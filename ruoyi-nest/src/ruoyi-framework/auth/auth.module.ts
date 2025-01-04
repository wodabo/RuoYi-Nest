import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthService } from './jwt/jwt-auth-service';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { GlobalAuthGuard } from '~/ruoyi-framework/auth/jwt/jwt-auth.guard';
import { JwtStrategy } from '~/ruoyi-framework/auth/jwt/jwt-strategy';
import { SysUserModule } from '~/ruoyi-system/sys-user/sys-user.module';
import { PermissionModule } from '~/ruoyi-share/permission/permission.module';
import { RedisModule } from '~/ruoyi-share/redis/redis.module';
import { ShareConfigModule } from '~/ruoyi-share/config/share-config.module';
import { TokenConfigService } from '~/ruoyi-share/config/token-config.service';
const providers = [
  JwtAuthService,
  JwtStrategy,
  {
    provide: APP_GUARD,
    useClass: GlobalAuthGuard,
  },
];

@Module({
  imports: [
    SysUserModule,
    PassportModule,
    PermissionModule,
    TypeOrmModule.forFeature([SysUser]),
    RedisModule,
    JwtModule.registerAsync({
      imports: [ShareConfigModule],
      useFactory: async (tokenConfigService: TokenConfigService) => ({
        secret: tokenConfigService.getSecret(),
        signOptions: {
          expiresIn: tokenConfigService.getExpireTime(),
        },
      }),
      inject: [TokenConfigService],
    }),
    ShareConfigModule,
  ],
  providers,
  exports: [JwtAuthService],
})
export class AuthModule {}
