import { Injectable } from '@nestjs/common';
import { Repository, In, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysUserRole } from '../entities/sys-user-role.entity';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';

@Injectable()
export class SysUserRoleRepository {
  constructor(
    @InjectRepository(SysUserRole)
    private readonly userRoleRepository: Repository<SysUserRole>,
    private readonly sqlLoggerUtils: SqlLoggerUtils,
    private readonly contextHolderUtils: ContextHolderUtils,
  ) {}

  /**
   * 查询角色列表
   */
  selectRoleVo() {
    return this.userRoleRepository
      .createQueryBuilder('ur')
      .leftJoin('sys_role', 'r', 'ur.role_id = r.role_id')
      .leftJoin('sys_user', 'u', 'u.user_id = ur.user_id')
      .leftJoin('sys_dept', 'd', 'u.dept_id = d.dept_id')
      .select([
        'DISTINCT r.roleId',
        'r.roleName',
        'r.roleKey',
        'r.roleSort',
        'r.dataScope',
        'r.menuCheckStrictly',
        'r.deptCheckStrictly',
        'r.status',
        'r.delFlag',
        'r.createTime',
        'r.remark',
      ]);
  }

  /**
   * 通过用户ID删除用户和角色关联
   */
  async deleteUserRoleByUserId(userId: number): Promise<number> {
    const queryBuilder = this.userRoleRepository
      .createQueryBuilder()
      .delete()
      .from(SysUserRole)
      .where('userId = :userId', { userId });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteUserRoleByUserId');
    const result = await queryBuilder.execute();
    return result.affected;
  }

  /**
   * 批量删除用户和角色关联
   */
  async deleteUserRole(userIds: number[]): Promise<number> {
    const entityManager =
      this.contextHolderUtils.getContext('transactionManager') ||
      this.userRoleRepository.manager;
    const queryBuilder = entityManager
      .createQueryBuilder()
      .delete()
      .from(SysUserRole)
      .where('userId IN (:...userIds)', { userIds });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteUserRole');
    const result = await queryBuilder.execute();
    return result.affected;
  }

  /**
   * 通过角色ID查询角色使用数量
   */
  async countUserRoleByRoleId(roleId: number): Promise<number> {
    const queryBuilder = this.userRoleRepository
      .createQueryBuilder('ur')
      .where('ur.roleId = :roleId', { roleId });

    this.sqlLoggerUtils.log(queryBuilder, 'countUserRoleByRoleId');
    return queryBuilder.getCount();
  }

  /**
   * 批量新增用户角色信息
   */
  async batchUserRole(userRoleList: SysUserRole[]): Promise<number> {
    const entityManager =
      this.contextHolderUtils.getContext('transactionManager') ||
      this.userRoleRepository.manager;
    const queryBuilder = entityManager
      .createQueryBuilder()
      .insert()
      .into(SysUserRole)
      .values(userRoleList);

    this.sqlLoggerUtils.log(queryBuilder, 'batchUserRole');
    const result = await queryBuilder.execute();
    return result.identifiers.length;
  }

  /**
   * 删除用户和角色关联信息
   */
  async deleteUserRoleInfo(userRole: SysUserRole): Promise<number> {
    const queryBuilder = this.userRoleRepository
      .createQueryBuilder()
      .delete()
      .from(SysUserRole)
      .where('userId = :userId', { userId: userRole.userId })
      .andWhere('roleId = :roleId', { roleId: userRole.roleId });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteUserRoleInfo');
    const result = await queryBuilder.execute();
    return result.affected;
  }

  /**
   * 批量取消授权用户角色
   */
  async deleteUserRoleInfos(
    roleId: number,
    userIds: number[],
  ): Promise<number> {
    const queryBuilder = this.userRoleRepository
      .createQueryBuilder()
      .delete()
      .from(SysUserRole)
      .where('roleId = :roleId', { roleId })
      .andWhere('userId IN (:...userIds)', { userIds });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteUserRoleInfos');
    const result = await queryBuilder.execute();
    return result.affected;
  }
}
