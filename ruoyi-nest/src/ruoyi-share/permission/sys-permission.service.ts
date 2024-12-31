import { Injectable } from '@nestjs/common';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { SysMenuService } from '~/ruoyi-system/sys-menu/sys-menu.service';
import { SysRoleService } from '~/ruoyi-system/sys-role/sys-role.service';
import { UserConstants } from '../constant/UserConstants';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';

/**
 * 用户权限处理
 * 
 * @author ruoyi
 */
@Injectable()
export class SysPermissionService {
    constructor(
        private readonly roleService: SysRoleService,
        private readonly menuService: SysMenuService,
        private readonly securityUtils: SecurityUtils
    ) {}

    /**
     * 获取角色数据权限
     * 
     * @param user 用户信息
     * @returns 角色权限信息
     */
    async getRolePermission(user: SysUser): Promise<string[]> {
        const roles = [];

        // 管理员拥有所有权限
        if (this.securityUtils.isAdmin(user)) {
            roles.push('admin')
        } else {
            const userRoles = await this.roleService.selectRolePermissionByUserId(user.userId);
            userRoles.forEach(role => roles.push(role));
        }
        return roles;
    }

    /**
     * 获取菜单数据权限
     * 
     * @param user 用户信息
     * @returns 菜单权限信息
     */
    async getMenuPermission(user: SysUser): Promise<string[]> {
        const perms = [];
        // 管理员拥有所有权限
        if (this.securityUtils.isAdmin(user)) {
            perms.push('*:*:*');
        } else {
            const roles = user.roles;
            if (roles && roles.length > 0) {
                // 多角色设置permissions属性，以便数据权限匹配权限
                for (const role of roles) {
                    if (role.status === UserConstants.ROLE_NORMAL) {
                        const rolePerms = await this.menuService.selectMenuPermsByRoleId(role.roleId);
                        role.permissions = rolePerms;
                        rolePerms.forEach(perm => perms.push(perm));
                    }
                }
            } else {
                const userPerms = await this.menuService.selectMenuPermsByUserId(user.userId);
                userPerms.forEach(perm => perms.push(perm));
            }
        }
        return perms;
    }
}