import { Injectable } from '@nestjs/common';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { SysMenuService } from '~/ruoyi-system/sys-menu/sys-menu.service';
import { SysRoleService } from '~/ruoyi-system/sys-role/sys-role.service';
import { UserConstants } from '../constant/UserConstants';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { Constants } from '../constant/Constants';
import { LoginUser } from '../model/login-user';

/**
 * RuoYi首创 自定义权限实现，ss取自SpringSecurity首字母
 *
 * @author ruoyi
 */
@Injectable()
export class PermissionValidatorService {
  constructor(
    private readonly roleService: SysRoleService,
    private readonly menuService: SysMenuService,
  ) {}

  /**
   * 验证用户是否具备某权限
   *
   * @param permission 权限字符串
   * @returns 用户是否具备某权限
   */
  hasPermi(permission: string, loginUser: LoginUser): boolean {
    if (!permission) {
      return false;
    }

    if (
      !loginUser ||
      !loginUser.permissions ||
      loginUser.permissions.length === 0
    ) {
      return false;
    }

    return this.hasPermissions(loginUser.permissions, permission);
  }

  /**
   * 验证用户是否不具备某权限，与 hasPermi逻辑相反
   *
   * @param permission 权限字符串
   * @returns 用户是否不具备某权限
   */
  lacksPermi(permission: string, loginUser: LoginUser): boolean {
    return !this.hasPermi(permission, loginUser);
  }

  /**
   * 验证用户是否具有以下任意一个权限
   *
   * @param permissions 以 PERMISSION_DELIMETER 为分隔符的权限列表
   * @returns 用户是否具有以下任意一个权限
   */
  hasAnyPermi(permissions: string, loginUser: LoginUser): boolean {
    if (!permissions) {
      return false;
    }

    if (
      !loginUser ||
      !loginUser.permissions ||
      loginUser.permissions.length === 0
    ) {
      return false;
    }

    const authorities = loginUser.permissions;
    for (const permission of permissions.split(
      Constants.PERMISSION_DELIMETER,
    )) {
      if (permission && this.hasPermissions(authorities, permission)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断用户是否拥有某个角色
   *
   * @param role 角色字符串
   * @returns 用户是否具备某角色
   */
  hasRole(role: string, loginUser: LoginUser): boolean {
    if (!role) {
      return false;
    }

    if (
      !loginUser ||
      !loginUser.user.roles ||
      loginUser.user.roles.length === 0
    ) {
      return false;
    }

    for (const sysRole of loginUser.user.roles) {
      const roleKey = sysRole.roleKey;
      if (Constants.SUPER_ADMIN === roleKey || roleKey === role.trim()) {
        return true;
      }
    }
    return false;
  }

  /**
   * 验证用户是否不具备某角色，与 isRole逻辑相反。
   *
   * @param role 角色名称
   * @returns 用户是否不具备某角色
   */
  lacksRole(role: string, loginUser: LoginUser): boolean {
    return !this.hasRole(role, loginUser);
  }

  /**
   * 验证用户是否具有以下任意一个角色
   *
   * @param roles 以 ROLE_NAMES_DELIMETER 为分隔符的角色列表
   * @returns 用户是否具有以下任意一个角色
   */
  hasAnyRoles(roles: string, loginUser: LoginUser): boolean {
    if (!roles) {
      return false;
    }

    if (
      !loginUser ||
      !loginUser.user.roles ||
      loginUser.user.roles.length === 0
    ) {
      return false;
    }

    for (const role of roles.split(Constants.ROLE_DELIMETER)) {
      if (this.hasRole(role, loginUser)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断是否包含权限
   *
   * @param permissions 权限列表
   * @param permission 权限字符串
   * @returns 用户是否具备某权限
   */
  hasPermissions(permissions: string[], permission: string): boolean {
    return (
      permissions.includes(Constants.ALL_PERMISSION) ||
      permissions.includes(permission.trim())
    );
  }
}
