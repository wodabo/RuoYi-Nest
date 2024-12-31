import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SysRole } from './entities/sys-role.entity';
import { SysRoleRepository } from './repositories/sys-role.repository';
import { DataScope } from '~/ruoyi-share/annotation/DataScope';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { UserConstants } from '~/ruoyi-share/constant/UserConstants';
import { SysRoleMenu } from '~/ruoyi-system/sys-role-menu/entities/sys-role-menu.entity';
import { SysRoleMenuRepository } from '~/ruoyi-system/sys-role-menu/repositories/sys-role-menu.repository';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';
import { Transactional } from '~/ruoyi-share/annotation/Transactional';
import { SysUserRoleRepository } from '../sys-user-role/repositories/sys-user-role.repository';
import { SysRoleDeptRepository } from '../sys-role-dept/repositories/sys-role-dept.repository';

@Injectable()
export class SysRoleService {
  constructor(
    private readonly roleRepository: SysRoleRepository,
    private readonly securityUtils: SecurityUtils,
    private readonly roleMenuRepository: SysRoleMenuRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly contextHolderUtils: ContextHolderUtils,
    private readonly userRoleRepository: SysUserRoleRepository,
    private readonly roleDeptRepository: SysRoleDeptRepository
  ) {}

  @DataScope({ deptAlias: 'd' }) 
  async selectRoleList(query: SysRole): Promise<[SysRole[], number]> {
    // // 获取当前方法的元数据
    // const metadata = Reflect.getMetadata(DATA_SCOPE_KEY, this.selectRoleList);

    // // 从元数据中获取注解参数
    // const { deptAlias } = metadata;

    // if(deptAlias){
    //   // 设置查询参数
    //   query.deptAlias = deptAlias;
    // }
        
    return this.roleRepository.selectRoleList(query);  
  }

  async selectRoleById(roleId: number): Promise<SysRole> {
    return this.roleRepository.selectRoleById(roleId);
  }

  async selectRolesByUserId(userId: number, loginUser?: LoginUser): Promise<SysRole[]> {
    const userRoles = await this.roleRepository.selectRolePermissionByUserId(userId);
    const roles = await this.selectRoleAll();
    
    for (const role of roles) {
      for (const userRole of userRoles) {
        if (role.roleId === userRole.roleId) {
          role.flag = true;
          break;
        }
      }
    }
    return roles;
  }

  async selectRolePermissionByUserId(userId: number): Promise<string[]> {
    const roles = await this.roleRepository.selectRolePermissionByUserId(userId);
    const perms = [];
    roles.forEach(role => {
      if (role.roleKey) {
        perms.push(role.roleKey);
      }
    });
    return perms;
  }

  async selectRoleAll(): Promise<SysRole[]> {
    const [roles, total] = await this.selectRoleList(new SysRole());
    return roles;
  }

  // async selectRoleListByUserId(userId: number): Promise<number[]> {
  //   const roles = await this.selectRolesByUserId(userId);
  //   return roles.map(role => role.roleId);
  // }

  async checkRoleNameUnique(role: SysRole): Promise<boolean> {
    const roleId = role.roleId ? role.roleId : -1;
    const existingRole = await this.roleRepository.checkRoleNameUnique(role.roleName);

    if (existingRole && existingRole.roleId !== roleId) {
      return UserConstants.NOT_UNIQUE;
    }
    return UserConstants.UNIQUE;
  }

  async checkRoleKeyUnique(role: SysRole): Promise<boolean> {
    const roleId = role.roleId ? role.roleId : -1;
    const existingRole = await this.roleRepository.checkRoleKeyUnique(role.roleKey);

    if (existingRole && existingRole.roleId !== roleId) {
      return UserConstants.NOT_UNIQUE;
    }
    return UserConstants.UNIQUE;
  }

    /**
   * 校验角色是否允许操作
   * 
   * @param role 角色信息
   */
  checkRoleAllowed(role: SysRole): void {
    if (role.roleId && this.securityUtils.isAdmin(role.roleId)) {
      throw new ServiceException('不允许操作超级管理员角色');
    }
  }

  async checkRoleDataScope(roleIds: number[]): Promise<void> {
    const loginUser = this.securityUtils.getLoginUser();
    if (!this.securityUtils.isAdmin(loginUser.userId)) {
      for (const roleId of roleIds) {
        const query = new SysRole();
        query.roleId = roleId;
        const [roles, _total] = await this.selectRoleList(query);
        if (!roles || roles.length === 0) {
          throw new ServiceException('没有权限访问角色数据！');
        }
      }
    }
  }

  @Transactional()
  async insertRole(role: SysRole): Promise<number> {
    // 新增角色信息
    const roleId = await this.roleRepository.insertRole(role);
    role.roleId = roleId;
    // 新增角色与菜单关联
    return this.insertRoleMenu(role);
  }

  /**
     * 新增角色菜单信息
     * 
     * @param role 角色对象
     */
  async insertRoleMenu(role: SysRole): Promise<number> {
    let rows = 1;
    // 新增用户与角色管理
    const list: SysRoleMenu[] = role.menuIds.map(menuId => ({
      roleId: role.roleId,  
      menuId
    }));
    if (list.length > 0) {
      rows = await this.roleMenuRepository.batchRoleMenu(list);
    }
    return rows;
  }

  @Transactional()
  async updateRole(role: SysRole): Promise<number> {
   
    await this.roleRepository.updateRole(role);
    await this.roleMenuRepository.deleteRoleMenuByRoleId(role.roleId);
    return this.insertRoleMenu(role);
  }

  /**
   * 通过角色ID查询角色使用数量
   * 
   * @param roleId 角色ID
   * @return 结果
   */
  async countUserRoleByRoleId(roleId: number): Promise<number> {
    return this.userRoleRepository.countUserRoleByRoleId(roleId);
  }

  @Transactional()
  async deleteRoleByIds(roleIds: number[]): Promise<number> {
    let count = 0;
    for (const roleId of roleIds) {
      const role = new SysRole();
      role.roleId = roleId;
      this.checkRoleAllowed(role);
      await this.checkRoleDataScope([roleId]);

      
      if (await this.countUserRoleByRoleId(roleId) > 0) {
        throw new ServiceException(`${role.roleName}已分配,不能删除`);
      }


    }

    // 删除角色与菜单关联
    await this.roleMenuRepository.deleteRoleMenu(roleIds);
    // 删除角色与部门关联
    await this.roleDeptRepository.deleteRoleDept(roleIds);
    count = await this.roleRepository.deleteRoleByIds(roleIds);
    return count;
  }
}