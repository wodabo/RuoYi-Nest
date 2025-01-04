import { Injectable } from '@nestjs/common';
import { Repository, In, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysRoleMenu } from '../entities/sys-role-menu.entity';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';

@Injectable()
export class SysRoleMenuRepository {
  constructor(
    @InjectRepository(SysRoleMenu)
    private readonly roleMenuRepository: Repository<SysRoleMenu>,
    private readonly sqlLoggerUtils: SqlLoggerUtils,
    private readonly contextHolderUtils: ContextHolderUtils,
  ) {}

  /**
   * 查询菜单使用数量
   *
   * @param menuId 菜单ID
   * @return 结果
   */
  async checkMenuExistRole(menuId: number): Promise<number> {
    const queryBuilder = this.roleMenuRepository
      .createQueryBuilder('rm')
      .select('COUNT(1)', 'count')
      .where('rm.menuId = :menuId', { menuId });

    this.sqlLoggerUtils.log(queryBuilder, 'checkMenuExistRole');
    const result = await queryBuilder.getRawOne();
    return result ? result.count : 0;
  }

  /**
   * 通过角色ID删除角色和菜单关联
   *
   * @param roleId 角色ID
   * @return 结果
   */
  async deleteRoleMenuByRoleId(roleId: number): Promise<number> {
    const entityManager =
      this.contextHolderUtils.getContext('transactionManager') ||
      this.roleMenuRepository.manager;
    const queryBuilder = entityManager
      .createQueryBuilder()
      .delete()
      .from(SysRoleMenu)
      .where('roleId = :roleId', { roleId });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteRoleMenuByRoleId');
    const result = await queryBuilder.execute();
    return result.affected;
  }

  /**
   * 批量删除角色菜单关联信息
   *
   * @param roleIds 需要删除的数据ID
   * @return 结果
   */
  async deleteRoleMenu(roleIds: number[]): Promise<number> {
    const entityManager =
      this.contextHolderUtils.getContext('transactionManager') ||
      this.roleMenuRepository.manager;
    const queryBuilder = entityManager
      .createQueryBuilder()
      .delete()
      .from(SysRoleMenu)
      .where('roleId IN (:...roleIds)', { roleIds });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteRoleMenu');
    const result = await queryBuilder.execute();
    return result.affected;
  }

  /**
   * 批量新增角色菜单信息
   *
   * @param roleMenuList 角色菜单列表
   * @return 结果
   */
  async batchRoleMenu(roleMenuList: SysRoleMenu[]): Promise<number> {
    const entityManager =
      this.contextHolderUtils.getContext('transactionManager') ||
      this.roleMenuRepository.manager;
    const queryBuilder = entityManager
      .createQueryBuilder()
      .insert()
      .into(SysRoleMenu)
      .values(roleMenuList);

    this.sqlLoggerUtils.log(queryBuilder, 'batchRoleMenu');
    const result = await queryBuilder.execute();
    return result.identifiers.length;
  }
}
