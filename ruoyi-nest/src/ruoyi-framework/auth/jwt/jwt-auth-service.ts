import { ExecutionContext, Injectable, Logger, UnauthorizedException, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageUtils } from '~/ruoyi-share/utils/message.utils';
import { SysUserRepository } from '~/ruoyi-system/sys-user/repositories/sys-user.repository';
import { SysUserService } from '~/ruoyi-system/sys-user/sys-user.service';
import { PREAUTHORIZE_KEY } from '~/ruoyi-share/annotation/PreAuthorize';
import { Reflector } from '@nestjs/core';
import { SysPermissionService } from '~/ruoyi-share/permission/sys-permission.service';
import { IpUtils } from '~/ruoyi-share/utils/ip.utils';
import { AddressUtils } from '~/ruoyi-share/utils/address.utils';
import { CacheConstants } from '~/ruoyi-share/constant/CacheConstants';
import { RedisCacheService } from '~/ruoyi-share/redis/redis-cache.service';
import { UserStatus } from '~/ruoyi-share/enums/UserStatus';
import { TokenConfigService } from '~/ruoyi-share/config/token-config.service';
import { ShareUtils } from '~/ruoyi-share/utils/share.utils';
import { LogUtils } from '~/ruoyi-share/utils/log.utils'
import { Constants } from '~/ruoyi-share/constant/Constants';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';


@Injectable()
export class JwtAuthService {
  private readonly logger = new Logger(JwtAuthService.name);
  constructor(
    private jwtService: JwtService,
    private readonly userService: SysUserService,
    private readonly permissionService: SysPermissionService,
    private readonly addressUtils: AddressUtils,
    private readonly redisCacheService: RedisCacheService,
    private readonly ipUtils: IpUtils,
    private readonly tokenConfigService: TokenConfigService,
    private readonly shareUtils: ShareUtils,
    private readonly logUtils: LogUtils,
    private readonly contextHolderUtils: ContextHolderUtils
  ) { }

  async createToken(loginUser: LoginUser, request: Request) {
    const sysUser = loginUser.user;
    loginUser.userId = sysUser.userId;

    const payload = {
      sub: loginUser.userId,
      username: loginUser.getUsername()
    };
    const token = this.jwtService.sign(payload, {
      secret: this.tokenConfigService.getSecret(),
      expiresIn: this.tokenConfigService.getExpireTime(),
    });

    loginUser.token = token;

    // 权限集合  
    const permissions = await this.permissionService.getMenuPermission(sysUser);

    loginUser.permissions = permissions;

    await this.setUserAgent(loginUser, request);

    this.refreshToken(loginUser);

    return token;
  }

  /**
   * 设置用户身份信息
   * @param loginUser 登录信息
   */
  setLoginUser(loginUser: LoginUser) {
    if (loginUser && loginUser.token) {
      this.refreshToken(loginUser);
    }
  }

  /**
   * 刷新令牌有效期
   * @param loginUser 登录信息
   */
  refreshToken(loginUser: LoginUser) {
    loginUser.loginTime = Date.now();
    loginUser.expireTime = loginUser.loginTime + this.tokenConfigService.getExpireTime() // Convert minutes to milliseconds

    // Cache loginUser by token
    const userKey = this.getTokenKey(loginUser.token);
    this.redisCacheService.setCacheObjectWithTimeout(userKey, loginUser, this.tokenConfigService.getExpireTime());
  }

  /**
   * 获取用户身份信息的缓存key
   * @param token 令牌
   */
  private getTokenKey(token: string): string {
    return `${CacheConstants.LOGIN_TOKEN_KEY}${token}`;
  }

  /**
   * 设置用户代理信息
   * @param loginUser 登录信息
   * @param userAgent User-Agent header value
   */
  async setUserAgent(loginUser: LoginUser, request: Request) {
    const userAgent = request.headers['user-agent']
    const browserInfo = this.shareUtils.parseBrowser(userAgent);
    const osInfo = this.shareUtils.parseOS(userAgent);
    loginUser.ipaddr = this.ipUtils.getIpAddr(request);
    loginUser.loginLocation = await this.addressUtils.getLocation(loginUser.ipaddr);
    loginUser.browser = browserInfo;
    loginUser.os = osInfo;
  }


  /**
 * 获取登录用户信息
 * @param request HTTP请求对象
 * @returns 登录用户信息
 */
  async getLoginUser(request: Request): Promise<LoginUser | null> {
    // 从请求中获取token
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return null;
    }
    try {
      // 从Redis中获取用户信息
      const tokenKey = this.getTokenKey(token);
      const loginUser: LoginUser = await this.redisCacheService.getCacheObject(tokenKey);
      if (loginUser) {
        return new LoginUser(loginUser);
      }
      return null;
    } catch (error) {
      this.logger.error(`获取用户信息异常: ${error.message}`);
      return null;
    }
  }

  /**
   * 从请求头中提取token
   */
  public extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers[this.tokenConfigService.getHeader()];
    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  async validateUser(userId: number, username: string, request: Request): Promise<LoginUser> {

    const loginUser: LoginUser = await this.getLoginUser(request);


    if (!loginUser) {
      this.logger.warn(`登录用户：${username} 不存在.`);
      throw new ServiceException(MessageUtils.message('user.not.exists', { username }));
    }
    else if (loginUser.user.delFlag === UserStatus.DELETED.getCode()) {
      this.logger.warn(`登录用户：${username} 已被删除.`);
      throw new ServiceException(MessageUtils.message('user.password.delete', { username }));
    }
    else if (loginUser.user.status === UserStatus.DISABLE.getCode()) {
      this.logger.warn(`登录用户：${username} 已被停用.`);
      throw new ServiceException(MessageUtils.message('user.blocked', { username }));
    }


    return loginUser;
  }

  /**
   * 删除用户身份信息
   */
  async delLoginUser(token: string): Promise<void> {
    if (token) {
      const tokenKey = this.getTokenKey(token);
      await this.redisCacheService.deleteObject(tokenKey);
    }
  }


  /**
 * 退出登录
 */
  async logout(request: Request): Promise<void> {
    if (!request) {
      throw new UnauthorizedException('未登录');
    }


    const loginUser: LoginUser = await this.getLoginUser(request);
    if (loginUser) {
      const userName = loginUser.getUsername()
      // 从 Redis 中删除 token
      await this.delLoginUser(loginUser.token);

      // 记录用户退出日志
      this.logUtils.recordLogininfor(userName, Constants.LOGOUT, MessageUtils.message("user.logout.success"));
    }


  }
}