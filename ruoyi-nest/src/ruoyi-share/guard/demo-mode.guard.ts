import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';
import { DemoModeException } from '~/ruoyi-share/exception/DemoModeException';

@Injectable()
export class DemoModeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private ruoyiConfigService: RuoYiConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isDemoMode = this.ruoyiConfigService.isDemoEnabled();

    if (!isDemoMode) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    // 允许 logout 操作通过
    if (url.includes('/logout')) {
      return true;
    }

    // 在演示模式下拦截修改操作
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      throw new DemoModeException('演示模式下不允许修改操作');
    }

    return true;
  }
}