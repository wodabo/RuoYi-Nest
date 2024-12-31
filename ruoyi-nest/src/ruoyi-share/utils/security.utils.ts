import * as bcrypt from 'bcrypt';
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
import { ContextHolderUtils } from './context-holder.utils';

/**
 * 安全服务工具类
 * 
 * @author ruoyi
 */
@Injectable()
export class SecurityUtils {


  constructor(
    private readonly contextHolderUtils: ContextHolderUtils
) {
}    

  /**
   * 获取用户
   */
  getLoginUser(): LoginUser {
    try {
      const request = this.contextHolderUtils.getContext('request');
      const user:LoginUser = request['user'] as LoginUser;  
      if (!user) {
        throw new Error('No user found in request context');
      }
      return user;
    } catch (e) {
      throw new ServiceException("获取用户信息异常", HttpStatus.UNAUTHORIZED);
    }
  }


  /**
   * 生成BCryptPasswordEncoder密码
   * 
   * @param password 密码
   * @return 加密字符串
   */
  encryptPassword(password: string): string {
    const salt = '$2a$10$' + bcrypt.genSaltSync(10).slice(7);
    return bcrypt.hashSync(password, salt);
  }

  /**
   * 判断密码是否相同
   * 
   * @param rawPassword 真实密码
   * @param encodedPassword 加密后字符
   * @return 结果
   */
  matchesPassword(rawPassword: string, encodedPassword: string): boolean {
    return bcrypt.compareSync(rawPassword, encodedPassword);
  }

  /**
   * 是否为管理员
   */
  isAdmin(user: SysUser | number): boolean {
    if (typeof user === 'number') {
      return user === 1;
    }
    return user.userId !== null && user.userId === 1;
  }


}
