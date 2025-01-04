import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { Logger } from '@nestjs/common';
import { LoginBodyDto } from '~/ruoyi-share/dto/login-body.dto';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { UserPasswordNotMatchException } from '~/ruoyi-share/exception/user/UserPasswordNotMatchException';
import { JwtAuthService } from './jwt-auth-service';
import { REQUEST } from '@nestjs/core';
import { TokenConfigService } from '~/ruoyi-share/config/token-config.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    tokenConfigService: TokenConfigService,
  ) {
    const secret = tokenConfigService.getSecret(); // 先获取配置
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true, // 启用请求传递
    });
  }

  async validate(request: Request, payload: any) {
    try {
      const user = await this.jwtAuthService.validateUser(
        payload.sub,
        payload.username,
        request,
      );
      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
