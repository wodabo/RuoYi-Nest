import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysDept } from '../entities/sys-dept.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SysRoleDeptRepository } from '~/ruoyi-system/sys-role-dept/repositories/sys-role-dept.repository';
import { SysRoleDept } from '~/ruoyi-system/sys-role-dept/entities/sys-role-dept.entity';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { DataScope } from '~/ruoyi-share/constant/DataScope';
import { UserConstants } from '~/ruoyi-share/constant/UserConstants';
import { DataScopeUtils } from '~/ruoyi-share/utils/data-scope.utils';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';
@Injectable()
export class SysDeptRepository {
  constructor(
    @InjectRepository(SysDept)
    private readonly deptRepository: Repository<SysDept>,
    @InjectRepository(SysUser)
    private readonly userRepository: Repository<SysUser>,
    private readonly roleDeptRepository: SysRoleDeptRepository,
    private readonly queryUtils: QueryUtils,
    private readonly dataScopeUtils: DataScopeUtils,
    private readonly sqlLoggerUtils: SqlLoggerUtils,
  ) {}

  private selectDeptVo(): SelectQueryBuilder<SysDept> {
    return this.deptRepository
      .createQueryBuilder('d')
      .select([
        'd.deptId',
        'd.parentId',
        'd.ancestors',
        'd.deptName',
        'd.orderNum',
        'd.leader',
        'd.phone',
        'd.email',
        'd.status',
        'd.delFlag',
        'd.createBy',
        'd.createTime',
        'd.updateBy',
        'd.updateTime',
      ]);
  }

  async selectDeptList(query: SysDept): Promise<[SysDept[], number]> {
    const queryBuilder = this.selectDeptVo();

    if (query.delFlag) {
      queryBuilder.where('d.delFlag = :delFlag', { delFlag: query.delFlag });
    }

    if (query.deptId) {
      queryBuilder.andWhere('d.deptId = :deptId', { deptId: query.deptId });
    }
    if (query.parentId) {
      queryBuilder.andWhere('d.parentId = :parentId', {
        parentId: query.parentId,
      });
    }
    if (query.deptName) {
      queryBuilder.andWhere('d.deptName LIKE :deptName', {
        deptName: `%${query.deptName}%`,
      });
    }
    if (query.status) {
      queryBuilder.andWhere('d.status = :status', { status: query.status });
    }

    this.dataScopeUtils.dataScopeFilter(queryBuilder, query.params);

    queryBuilder.orderBy('d.parentId', 'ASC').addOrderBy('d.orderNum', 'ASC');

    this.sqlLoggerUtils.log(queryBuilder, 'selectDeptList');
    return this.queryUtils.executeQuery(queryBuilder, query);
  }

  async selectDeptListByRoleId(
    roleId: number,
    deptCheckStrictly: boolean,
  ): Promise<number[]> {
    const queryBuilder = this.deptRepository
      .createQueryBuilder('d')
      .select('d.deptId')
      .leftJoin('sys_role_dept', 'rd', 'd.deptId = rd.dept_id')
      .where('rd.role_id = :roleId', { roleId });

    if (deptCheckStrictly) {
      queryBuilder.andWhere(
        'd.deptId NOT IN ' +
          '(SELECT d.parentId FROM sys_dept d ' +
          'INNER JOIN sys_role_dept rd ON d.deptId = rd.dept_id AND rd.role_id = :roleId)',
        { roleId },
      );
    }

    queryBuilder.orderBy('d.parentId', 'ASC').addOrderBy('d.orderNum', 'ASC');

    this.sqlLoggerUtils.log(queryBuilder, 'selectDeptListByRoleId');

    const result = await queryBuilder.getMany();
    return result.map((item) => item.deptId);
  }

  async selectDeptById(deptId: number): Promise<SysDept> {
    return this.deptRepository
      .createQueryBuilder('d')
      .select([
        'd.deptId',
        'd.parentId',
        'd.ancestors',
        'd.deptName',
        'd.orderNum',
        'd.leader',
        'd.phone',
        'd.email',
        'd.status',
      ])
      .addSelect('parent.dept_name', 'parentName')
      .leftJoin('sys_dept', 'parent', 'd.parentId = parent.deptId')
      .where('d.deptId = :deptId', { deptId })
      .getOne();
  }

  async checkDeptExistUser(deptId: number): Promise<number> {
    return this.userRepository
      .createQueryBuilder('u')
      .select('COUNT(*)')
      .where('u.dept_id = :deptId', { deptId })
      .andWhere('u.del_flag = :delFlag', { delFlag: '0' })
      .getRawOne()
      .then((result) => result.count);
  }

  async hasChildByDeptId(deptId: number): Promise<number> {
    return this.deptRepository
      .createQueryBuilder('d')
      .select('COUNT(*)')
      .where('d.parentId = :deptId', { deptId })
      .andWhere('d.delFlag = :delFlag', { delFlag: '0' })
      .getRawOne()
      .then((result) => result.count);
  }

  async selectChildrenDeptById(deptId: number): Promise<SysDept[]> {
    return this.deptRepository
      .createQueryBuilder('d')
      .select('*')
      .where('FIND_IN_SET(:deptId, d.ancestors)', { deptId })
      .getMany();
  }
  async selectNormalChildrenDeptById(deptId: number): Promise<number> {
    return this.deptRepository
      .createQueryBuilder('d')
      .select('COUNT(*)')
      .where('d.status = :status', { status: '0' })
      .andWhere('d.delFlag = :delFlag', { delFlag: '0' })
      .andWhere('FIND_IN_SET(:deptId, d.ancestors) > 0', { deptId })
      .getRawOne()
      .then((result) => result.count);
  }

  async checkDeptNameUnique(
    deptName: string,
    parentId: number,
  ): Promise<SysDept> {
    return this.selectDeptVo()
      .where('dept_name = :deptName', { deptName })
      .andWhere('parent_id = :parentId', { parentId })
      .andWhere('del_flag = :delFlag', { delFlag: '0' })
      .limit(1)
      .getOne();
  }

  async insertDept(dept: SysDept): Promise<number> {
    const insertObj: any = {};
    if (dept.deptId != null && dept.deptId != 0) insertObj.deptId = dept.deptId;
    if (dept.parentId != null && dept.parentId != 0)
      insertObj.parentId = dept.parentId;
    if (dept.deptName != null && dept.deptName != '')
      insertObj.deptName = dept.deptName;
    if (dept.ancestors != null && dept.ancestors != '')
      insertObj.ancestors = dept.ancestors;
    if (dept.orderNum != null) insertObj.orderNum = dept.orderNum;
    if (dept.leader != null && dept.leader != '')
      insertObj.leader = dept.leader;
    if (dept.phone != null && dept.phone != '') insertObj.phone = dept.phone;
    if (dept.email != null && dept.email != '') insertObj.email = dept.email;
    if (dept.status != null) insertObj.status = dept.status;
    if (dept.createBy != null && dept.createBy != '')
      insertObj.createBy = dept.createBy;
    insertObj.createTime = new Date();

    const queryBuilder = this.deptRepository
      .createQueryBuilder('d')
      .insert()
      .into(SysDept)
      .values(insertObj);

    this.sqlLoggerUtils.log(queryBuilder, 'insertDept');
    const result = await queryBuilder.execute();
    return result.identifiers[0].deptId;
  }

  async updateDept(dept: SysDept): Promise<number> {
    const updateData: any = {
      updateTime: new Date(), // 更新时间总是需要更新的
    };

    if (dept.parentId != null && dept.parentId != 0)
      updateData.parentId = dept.parentId;
    if (dept.deptName != null && dept.deptName != '')
      updateData.deptName = dept.deptName;
    if (dept.ancestors != null && dept.ancestors != '')
      updateData.ancestors = dept.ancestors;
    if (dept.orderNum != null) updateData.orderNum = dept.orderNum;
    if (dept.leader != null && dept.leader != '')
      updateData.leader = dept.leader;
    if (dept.phone != null && dept.phone != '') updateData.phone = dept.phone;
    if (dept.email != null && dept.email != '') updateData.email = dept.email;
    if (dept.status != null && dept.status != '')
      updateData.status = dept.status;
    if (dept.updateBy != null && dept.updateBy != '')
      updateData.updateBy = dept.updateBy;

    const result = await this.deptRepository.update(dept.deptId, updateData);
    return result.affected;
  }

  async updateDeptChildren(depts: SysDept[]): Promise<void> {
    const updateQuery = `UPDATE sys_dept SET ancestors = CASE dept_id `;
    const whenClauses = depts
      .map((d) => `WHEN ${d.deptId} THEN '${d.ancestors}'`)
      .join(' ');
    const inClause = `WHERE dept_id IN (${depts.map((d) => `${d.deptId}`).join(', ')})`;
    const query = `${updateQuery}${whenClauses} END ${inClause}`;
    await this.deptRepository.query(query);
  }

  async updateDeptStatusNormal(deptIds: number[]): Promise<void> {
    const query = `UPDATE sys_dept SET status = '0' WHERE dept_id IN (${deptIds.map((id) => `'${id}'`).join(', ')})`;
    await this.deptRepository.query(query);
  }

  async deleteDeptById(deptId: number): Promise<number> {
    const query = `UPDATE sys_dept SET del_flag = '2' WHERE dept_id = ${deptId}`;
    const result = await this.deptRepository.query(query);
    return result.affectedRows;
  }
}
