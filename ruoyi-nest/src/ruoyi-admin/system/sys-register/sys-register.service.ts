import { Injectable, Request } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { Validator } from 'class-validator';
import { SysUserService } from '~/ruoyi-system/sys-user/sys-user.service';
import { RegisterBodyDto } from '~/ruoyi-share/dto/register-body.dto';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { JwtStrategy } from '~/ruoyi-framework/auth/jwt/jwt-strategy';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { UserPasswordNotMatchException } from '~/ruoyi-share/exception/user/UserPasswordNotMatchException';
import { SysConfigService } from '~/ruoyi-system/sys-config/sys-config.service';
import { CacheConstants } from '~/ruoyi-share/constant/CacheConstants';
import { RedisCacheService } from '~/ruoyi-share/redis/redis-cache.service';
import { MessageUtils } from '~/ruoyi-share/utils/message.utils';
import { CaptchaException } from '~/ruoyi-share/exception/user/CaptchaException';
import { CaptchaExpireException } from '~/ruoyi-share/exception/user/CaptchaExpireException';
import { UserNotExistsException } from '~/ruoyi-share/exception/user/UserNotExistsException';
import { UserConstants } from '~/ruoyi-share/constant/UserConstants';
import { BlackListException } from '~/ruoyi-share/exception/user/BlackListException';
import { IpUtils } from '~/ruoyi-share/utils/ip.utils';
import { LogUtils } from '~/ruoyi-share/utils/log.utils';
import { Constants } from '~/ruoyi-share/constant/Constants';

@Injectable()
export class SysRegisterService {
  private readonly logger = new Logger(SysRegisterService.name);

  constructor(
    private readonly userService: SysUserService,
    private readonly configService: SysConfigService,
    private readonly redisCacheService: RedisCacheService,
    private readonly ipUtils: IpUtils,
    private readonly securityUtils: SecurityUtils,
    private readonly logUtils: LogUtils,
  ) {}

  /**
   * 注册
   * @param registerBody 注册信息
   */
  async register(registerBody: RegisterBodyDto): Promise<string> {
    let msg = '',
      username = registerBody.username,
      password = registerBody.password;
    const sysUser = new SysUser();
    sysUser.userName = username;

    // 验证码开关
    const captchaEnabled = this.configService.selectCaptchaEnabled();
    if (captchaEnabled) {
      await this.validateCaptcha(
        username,
        registerBody.code,
        registerBody.uuid,
      );
    }

    if (!username) {
      msg = '用户名不能为空';
    } else if (!password) {
      msg = '用户密码不能为空';
    } else if (
      username.length < UserConstants.USERNAME_MIN_LENGTH ||
      username.length > UserConstants.USERNAME_MAX_LENGTH
    ) {
      msg = '账户长度必须在2到20个字符之间';
    } else if (
      password.length < UserConstants.PASSWORD_MIN_LENGTH ||
      password.length > UserConstants.PASSWORD_MAX_LENGTH
    ) {
      msg = '密码长度必须在5到20个字符之间';
    } else if (!this.userService.checkUserNameUnique(sysUser)) {
      msg = "保存用户'" + username + "'失败，注册账号已存在";
    } else {
      sysUser.nickName = username;
      sysUser.password = this.securityUtils.encryptPassword(password);
      const regFlag = await this.userService.registerUser(sysUser);
      if (!regFlag) {
        msg = '注册失败,请联系系统管理人员';
      } else {
        this.logUtils.recordLogininfor(
          username,
          Constants.REGISTER,
          MessageUtils.message('user.register.success'),
        );
      }
    }
    return msg;
  }

  /**
   * 校验验证码
   * @param username 用户名
   * @param code 验证码
   * @param uuid 唯一标识
   */
  private async validateCaptcha(
    username: string,
    code: string,
    uuid: string,
  ): Promise<void> {
    const verifyKey = `${CacheConstants.CAPTCHA_CODE_KEY}${uuid || ''}`;
    const captcha: string =
      await this.redisCacheService.getCacheObject(verifyKey);
    await this.redisCacheService.deleteObject(verifyKey);
    if (!captcha) {
      this.logger.warn(`登录用户：${username} 验证码已失效`);
      this.logUtils.recordLogininfor(
        username,
        Constants.LOGIN_FAIL,
        MessageUtils.message('user.captcha.expire'),
      );
      throw new CaptchaExpireException();
    }

    if (code.toLowerCase() !== captcha.toLowerCase()) {
      this.logger.warn(`登录用户：${username} 验证码错误`);
      this.logUtils.recordLogininfor(
        username,
        Constants.LOGIN_FAIL,
        MessageUtils.message('user.captcha.error'),
      );
      throw new CaptchaException();
    }
  }
}
