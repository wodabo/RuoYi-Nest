import { 
  Controller, 
  Get, 
  Post,
  Body,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SysLoginService } from '~/ruoyi-admin/system/sys-login/sys-login.service';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { LoginBodyDto } from '~/ruoyi-share/dto/login-body.dto';
import { Public } from '~/ruoyi-framework/auth/decorators/public.decorator';
import { SysUserService } from '~/ruoyi-system/sys-user/sys-user.service';
import { SysPermissionService } from '~/ruoyi-share/permission/sys-permission.service';
import { SysMenuService } from '~/ruoyi-system/sys-menu/sys-menu.service';
@ApiTags('登录验证')
@Controller()
export class SysLoginController {
  constructor(
    private readonly loginService: SysLoginService,
    private readonly userService: SysUserService,
    private readonly permissionService: SysPermissionService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly menuService: SysMenuService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '登录方法' })
  async login(@Body() LoginBodyDto: LoginBodyDto, @Request() req) {
    const loginUser = req.user;

    // 生成令牌
    const token = await this.loginService.login(
      LoginBodyDto.username,
      LoginBodyDto.password,
      LoginBodyDto.code,
      LoginBodyDto.uuid,
      req
    );

    const success = AjaxResult.success();
    success.token = token;
    return success;
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: '登出方法' })
  async logout(@Request() req) {

    this.jwtAuthService.logout(req);
    const success = AjaxResult.success();
    return success;
  }

  @Get('getInfo')
  @ApiOperation({ summary: '获取用户信息' })
  async getInfo(@Request() req) {

    const loginUser = req.user;

    // 角色集合
    const roles = await this.permissionService.getRolePermission(loginUser);

    
    // 权限集合  
    // const permissions = await this.permissionService.getMenuPermission(loginUser.user);


    return {
      code: 200,
      msg: 'success',
      user: {
        ...loginUser.user,
      },
      roles: [...roles],
      permissions: loginUser.permissions
    };
  }

  @Get('getRouters') 
  @ApiOperation({ summary: '获取路由信息' })
  async getRouters(@Request() req) {
    const loginUser = req.user;

    const userId = loginUser.user.userId;
    const menus = await this.menuService.selectMenuTreeByUserId(userId);
    const routers = await this.menuService.buildMenus(menus);

    return {
      code: 200,
      msg: 'success',
      data: routers
    };
  }
}