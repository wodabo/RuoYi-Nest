import { Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtAuthService } from './jwt-auth-service';
import { PREAUTHORIZE_KEY } from '~/ruoyi-share/annotation/PreAuthorize';
import { PermissionValidatorService } from '~/ruoyi-share/permission/permission-validator.service';

@Injectable()
export class GlobalAuthGuard extends AuthGuard('jwt') {
  private context: ExecutionContext;
  constructor(
    private jwtAuthService: JwtAuthService, 
    private permissionValidatorService: PermissionValidatorService,
    private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    this.context = context;
    try {
      // Get request path
      const request = context.switchToHttp().getRequest();

      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (isPublic) {
        return true;
      }
  
      return super.canActivate(context);
    } catch (error) {
      console.error('Auth guard error:', error);
      throw error;
    }
  }




  private isAnonymousUrl(path: string, patterns: (string | RegExp)[]): boolean {
    return patterns.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(path);
      }
      return path === pattern;
    });
  }


  private getParams(expression: string) {
    // 匹配方法名和参数
    const methodRegex = /(\w+)\(['"](.+)['"]\)/;
    const match = expression.match(methodRegex);
    
    if (match) {
        return match[2].split(',').map(p => p.trim())
    }
    
    return null;
}

  private evaluatePermission(expression: string, user: any): boolean {
    // 支持多种表达式格式
    // hasRole('admin')
    // hasAnyRole('admin','user')
    // hasPermission('system:user:list')
    // hasAnyPermission('system:user:list','system:user:query')


    const matches = {
      hasRole: /hasRole\(['"](.+)['"]\)/.exec(expression),
      hasAnyRole: /hasAnyRole\((.+)\)/.exec(expression),
      hasPermi: /hasPermi\(['"](.+)['"]\)/.exec(expression),
      hasPermissions: /hasPermissions\(['"](.+)['"]\)/.exec(expression),
      hasAnyPermi: /hasAnyPermi\(['"](.+)['"]\)/.exec(expression),
    };


    if (matches.hasRole) {
      const role = matches.hasRole[1];
      return user.roles?.some(r => r.roleKey === role);
    }

    if (matches.hasAnyRole) {
      const roles = matches.hasAnyRole[1].split(',').map(r => r.trim().replace(/'/g, ''));
      return user.roles?.some(r => roles.includes(r.roleKey));
    }

    if (matches.hasPermi) {
      const [permission] = this.getParams(expression);
      // const permission = matches.hasPermi[1];
      // return user.permissions?.includes(permission);
      return this.permissionValidatorService.hasPermi(permission,user);
    }

    if (matches.hasAnyPermi) {
      const permissions = matches.hasAnyPermi[1].split(',').map(p => p.trim().replace(/'/g, ''));
      return user.permissions?.some(p => permissions.includes(p));
    }
    

    return this.permissionValidatorService.hasPermissions(user.permissions,'');
  }

  handleRequest(err, user, info) {

    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const requiredPermission = this.reflector.getAllAndOverride<string>(PREAUTHORIZE_KEY, [
        this.context.getHandler(), 
        this.context.getClass(),
    ]);


    if(requiredPermission){
      if(!this.evaluatePermission(requiredPermission,user)){
        throw new ForbiddenException();
      }
    }

  
    return user;
  }
}