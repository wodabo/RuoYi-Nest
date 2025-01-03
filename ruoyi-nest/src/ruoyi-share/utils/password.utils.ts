import * as bcrypt from 'bcryptjs';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { HttpStatus } from '~/ruoyi-share/constant/HttpStatus';
import { Constants } from '~/ruoyi-share/constant/Constants';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { REQUEST } from '@nestjs/core';
import { AsyncLocalStorage } from 'async_hooks';
import { RedisCacheService } from '~/ruoyi-share/redis/redis-cache.service';
import { CacheConstants } from '../constant/CacheConstants';
import { ConfigService } from '@nestjs/config';
import { SecurityUtils } from './security.utils';

/**
 * 安全服务工具类
 * 
 * @author ruoyi
 */
@Injectable()
export class PasswordUtils {
  private maxRetryCount: number
  private lockTime: number

  constructor(
    private readonly redisCacheService: RedisCacheService,
    private readonly configService: ConfigService,
    private readonly securityUtils: SecurityUtils,  
   
) {
    this.maxRetryCount = this.configService.get<number>('user.password.maxRetryCount');
    this.lockTime = this.configService.get<number>('user.password.lockTime');
}    



  /**
   * 登录账户密码错误次数缓存键名
   * 
   * @param username 用户名
   * @return 缓存键key
   */
  private getCacheKey(username: string): string {
    return CacheConstants.PWD_ERR_CNT_KEY + username;
  }

  /**
   * 验证用户登录
   * 
   * @param user 用户对象
   */
  async validate(user: SysUser): Promise<void> {
    const username = user.userName;

    const loginUser: LoginUser = this.securityUtils.getLoginUser();

    const password = loginUser.getPassword();

    let retryCount: number = await this.redisCacheService.getCacheObject(this.getCacheKey(username));

    if (!retryCount) {
      retryCount = 0;
    }

    if (retryCount >= this.maxRetryCount) {
      throw new ServiceException(`密码错误次数超过限制(${this.maxRetryCount}), 请在${this.lockTime}分钟后重试`, HttpStatus.UNAUTHORIZED);
    }

    if (!this.securityUtils.matchesPassword(password, user.password)) {
      retryCount++;
      this.redisCacheService.setCacheObjectWithTimeout(this.getCacheKey(username), retryCount, this.lockTime);
      throw new ServiceException('密码不匹配', HttpStatus.UNAUTHORIZED);
    } else {
      this.clearLoginRecordCache(username);
    }
  }

  /**
   * 清除登录记录缓存
   * 
   * @param loginName 登录名
   */
  clearLoginRecordCache(loginName: string): void {
    if (this.redisCacheService.hasKey(this.getCacheKey(loginName))) {
      this.redisCacheService.deleteObject(this.getCacheKey(loginName));
    }
  }
}
