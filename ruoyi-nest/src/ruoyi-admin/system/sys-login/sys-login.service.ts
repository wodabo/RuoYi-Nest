import { Injectable,Request, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { Validator } from 'class-validator';
import { SysUserRepository } from '~/ruoyi-system/sys-user/repositories/sys-user.repository';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { JwtStrategy } from '~/ruoyi-framework/auth/jwt/jwt-strategy';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { UserPasswordNotMatchException } from '~/ruoyi-share/exception/user/UserPasswordNotMatchException';
import { SysUserService } from '~/ruoyi-system/sys-user/sys-user.service';
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
export class SysLoginService {
    private readonly logger = new Logger(SysLoginService.name);

    constructor(
        private readonly jwtAuthService: JwtAuthService,
        private readonly userService: SysUserService,
        private readonly configService: SysConfigService,
        private readonly redisCacheService: RedisCacheService,  
        private readonly ipUtils: IpUtils,
        private readonly securityUtils: SecurityUtils,
        private readonly logUtils: LogUtils
    ) {}

    /**
     * 根据用户名加载用户信息
     * @param username 用户名
     */
    async login(username: string, password: string, code: string, uuid: string, request: Request): Promise<string> {
        // 验证码校验
        await this.validateCaptcha(username, code, uuid);
        // 登录前置校验
        await this.loginPreCheck(username, password, request);
        const sysUser = await this.userService.selectUserByUserName(username);
     
        if(!this.securityUtils.matchesPassword(password, sysUser.password)){
            this.logger.warn(`登录用户：${username} 密码错误.`);
            this.logUtils.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("user.password.not.match"));
            throw new UserPasswordNotMatchException();
        }

        const loginUser = new LoginUser();
        loginUser.user = sysUser;

        // const user = await this.jwtStrategy.validate({username,password});
        this.logUtils.recordLogininfor(username, Constants.LOGIN_SUCCESS, MessageUtils.message("user.login.success"));
        const token = await this.jwtAuthService.createToken(loginUser,request);
        return token;   
    }

    /**
     * 校验验证码
     * @param username 用户名
     * @param code 验证码
     * @param uuid 唯一标识
     */
    private async validateCaptcha(username: string, code: string, uuid: string): Promise<void> {
        const captchaEnabled = this.configService.selectCaptchaEnabled(); // TODO: Get from config service
        
        if (captchaEnabled) {
            const verifyKey = `${CacheConstants.CAPTCHA_CODE_KEY}${uuid || ''}`; 
            const captcha:string = await this.redisCacheService.getCacheObject(verifyKey); // TODO: Get from redis cache
            
            if (!captcha) {
                this.logger.warn(`登录用户：${username} 验证码已失效`);
                this.logUtils.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("user.captcha.expire"));
                throw new CaptchaExpireException();
            }

            await this.redisCacheService.deleteObject(verifyKey);

            // TODO: Delete captcha from redis
            
            if (code.toLowerCase() !== captcha.toLowerCase()) {
                this.logger.warn(`登录用户：${username} 验证码错误`);
                this.logUtils.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("user.captcha.error"));
                throw new CaptchaException(); 
            }
        }
    }
    /**
     * 登录前置校验
     * @param username 用户名
     * @param password 用户密码
     */
    private async loginPreCheck(username: string, password: string, @Request() req) {
        // 用户名或密码为空 错误
        if (!username || !password) {
            this.logUtils.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("not.null"));
            throw new UserNotExistsException();
        }

        // 密码如果不在指定范围内 错误
        if (password.length < UserConstants.PASSWORD_MIN_LENGTH || 
            password.length > UserConstants.PASSWORD_MAX_LENGTH) {
            this.logUtils.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("user.password.not.match"));
            throw new UserPasswordNotMatchException();
        }

        // 用户名不在指定范围内 错误
        if (username.length < UserConstants.USERNAME_MIN_LENGTH ||
            username.length > UserConstants.USERNAME_MAX_LENGTH) {
            this.logUtils.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("user.password.not.match"));
            throw new UserPasswordNotMatchException();
        }

        // IP黑名单校验
        const blackStr = await this.configService.selectConfigByKey("sys.login.blackIPList");
        if (this.ipUtils.isMatchedIp(blackStr, this.ipUtils.getIpAddr(req))) {
            this.logUtils.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("login.blocked"));
            throw new BlackListException();
        }
    }

      /**
       * 记录登录信息
       * @param userId 用户ID
       */
      async recordLoginInfo(userId: number, request: Request) {
        const sysUser = new SysUser();
        sysUser.userId = userId;
        sysUser.loginIp = this.ipUtils.getIpAddr(request);
        sysUser.loginDate = new Date();

        await this.userService.updateUserProfile(sysUser);
      }
}