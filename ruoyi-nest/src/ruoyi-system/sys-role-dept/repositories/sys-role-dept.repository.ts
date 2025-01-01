import { Injectable } from '@nestjs/common';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysRoleDept } from '../entities/sys-role-dept.entity';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';

@Injectable()
export class SysRoleDeptRepository {
  constructor(
    @InjectRepository(SysRoleDept)
    private readonly roleDeptRepository: Repository<SysRoleDept>,
    private readonly dataSource: DataSource,
    private readonly sqlLoggerUtils: SqlLoggerUtils
  ) {}

  async deleteRoleDeptByRoleId(roleId: number): Promise<void> {
    const queryBuilder = this.roleDeptRepository.createQueryBuilder()
      .delete()
      .where('roleId = :roleId', { roleId });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteRoleDeptByRoleId');
    await queryBuilder.execute();
  }

  async selectCountRoleDeptByDeptId(deptId: number): Promise<number> {
    const queryBuilder = this.roleDeptRepository.createQueryBuilder('rd')
      .where('rd.deptId = :deptId', { deptId });

    this.sqlLoggerUtils.log(queryBuilder, 'selectCountRoleDeptByDeptId');
    return queryBuilder.getCount();
  }

  async deleteRoleDept(roleIds: number[]): Promise<void> {
    const queryBuilder = this.roleDeptRepository.createQueryBuilder()
      .delete()
      .where('roleId IN (:...roleIds)', { roleIds });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteRoleDept');
    await queryBuilder.execute();
  }

  async batchRoleDept(roleDepts: SysRoleDept[]): Promise<number> {
    const queryBuilder = this.dataSource.createQueryBuilder()
      .insert()
      .into(SysRoleDept)
      .values(roleDepts);

    this.sqlLoggerUtils.log(queryBuilder, 'batchRoleDept');
    const result = await queryBuilder.execute();
    return result.identifiers[0].id;  
  }

}
