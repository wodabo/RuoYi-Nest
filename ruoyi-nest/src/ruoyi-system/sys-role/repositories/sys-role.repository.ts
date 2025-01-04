import { Injectable } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysRole } from '../entities/sys-role.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { DataScopeUtils } from '~/ruoyi-share/utils/data-scope.utils';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';
@Injectable()
export class SysRoleRepository {
  constructor(
    @InjectRepository(SysRole)
    private readonly roleRepository: Repository<SysRole>,
    private readonly queryUtils: QueryUtils,
    private readonly dataScopeUtils: DataScopeUtils,
    private readonly sqlLoggerUtils: SqlLoggerUtils,
    private readonly contextHolderUtils: ContextHolderUtils,
  ) {}

  selectRoleVo() {
    return this.roleRepository
      .createQueryBuilder('r')
      .leftJoin('sys_user_role', 'ur', 'ur.role_id = r.role_id')
      .leftJoin('sys_user', 'u', 'u.user_id = ur.user_id')
      .leftJoin('sys_dept', 'd', 'u.dept_id = d.dept_id')
      .select([
        'r.roleId',
        'r.roleName',
        'r.roleKey',
        'r.roleSort',
        'r.dataScope',
        'r.menuCheckStrictly',
        'r.deptCheckStrictly',
        'r.status',
        'r.delFlag',
        'r.createTime',
        // 'r.updateTime',
        // 'r.createBy',
        // 'r.updateBy',
        // 'r.updateTime',
        'r.remark',
      ])
      .distinct(true);
  }

  async selectRoleList(query: SysRole): Promise<[SysRole[], number]> {
    const queryBuilder = this.selectRoleVo().where('r.delFlag = :delFlag', {
      delFlag: '0',
    });

    if (query.roleId) {
      queryBuilder.andWhere('r.roleId = :roleId', { roleId: query.roleId });
    }
    if (query.roleName) {
      queryBuilder.andWhere('r.roleName like :roleName', {
        roleName: `%${query.roleName}%`,
      });
    }
    if (query.status) {
      queryBuilder.andWhere('r.status = :status', { status: query.status });
    }
    if (query.roleKey) {
      queryBuilder.andWhere('r.roleKey like :roleKey', {
        roleKey: `%${query.roleKey}%`,
      });
    }
    if (query.params?.beginTime) {
      queryBuilder.andWhere(
        'DATE_FORMAT(r.createTime,"%Y%m%d") >= DATE_FORMAT(:beginTime,"%Y%m%d")',
        {
          beginTime: query.params.beginTime,
        },
      );
    }
    if (query.params?.endTime) {
      queryBuilder.andWhere(
        'DATE_FORMAT(r.createTime,"%Y%m%d") <= DATE_FORMAT(:endTime,"%Y%m%d")',
        {
          endTime: query.params.endTime,
        },
      );
    }

    this.dataScopeUtils.dataScopeFilter(queryBuilder, query.params);

    // Add data scope filter if provided
    // if (query.params?.dataScope) {
    //   queryBuilder.andWhere(query.params.dataScope);
    // }

    queryBuilder.orderBy('r.roleSort', 'ASC');

    this.sqlLoggerUtils.log(queryBuilder, 'selectRoleList');
    return this.queryUtils.executeQuery(queryBuilder, query);
  }

  async selectRolePermissionByUserId(userId: number): Promise<SysRole[]> {
    const queryBuilder = this.roleRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('sys_user_role', 'ur', 'ur.role_id = r.role_id')
      .leftJoinAndSelect('sys_user', 'u', 'u.user_id = ur.user_id')
      .leftJoinAndSelect('sys_dept', 'd', 'u.dept_id = d.dept_id')
      .select([
        'r.roleId',
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
        'r.createBy',
        'r.updateBy',
        'r.updateTime',
      ])
      .where('r.delFlag = :delFlag', { delFlag: '0' })
      .andWhere('ur.user_id = :userId', { userId })
      .distinct(true);

    this.sqlLoggerUtils.log(queryBuilder, 'selectRolePermissionByUserId');
    return queryBuilder.getMany();
  }

  async selectRoleAll(): Promise<SysRole[]> {
    const queryBuilder = this.roleRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.userRoles', 'ur')
      .leftJoinAndSelect('ur.user', 'u')
      .leftJoinAndSelect('u.dept', 'd')
      .where('r.delFlag = :delFlag', { delFlag: '0' });

    this.sqlLoggerUtils.log(queryBuilder, 'selectRoleAll');
    return queryBuilder.getMany();
  }

  async selectRoleListByUserId(userId: number): Promise<number[]> {
    const queryBuilder = this.roleRepository
      .createQueryBuilder('r')
      .leftJoin('r.userRoles', 'ur')
      .leftJoin('ur.user', 'u')
      .where('u.userId = :userId', { userId })
      .andWhere('r.delFlag = :delFlag', { delFlag: '0' });

    this.sqlLoggerUtils.log(queryBuilder, 'selectRoleListByUserId');
    const roles = await queryBuilder.getMany();
    return roles.map((role) => role.roleId);
  }

  async selectRoleById(roleId: number): Promise<SysRole> {
    const queryBuilder = this.selectRoleVo().where('r.roleId = :roleId', {
      roleId,
    });

    this.sqlLoggerUtils.log(queryBuilder, 'selectRoleById');
    return queryBuilder.getOne();
  }

  /**
   * 根据用户名查询角色
   */
  async selectRolesByUserName(userName: string): Promise<any[]> {
    const queryBuilder = this.selectRoleVo()
      .where('u.user_name = :userName', { userName })
      .andWhere('r.del_flag = :delFlag', { delFlag: '0' });

    this.sqlLoggerUtils.log(queryBuilder, 'selectRolesByUserName');

    return queryBuilder.getMany();
  }

  async checkRoleNameUnique(roleName: string): Promise<SysRole> {
    const queryBuilder = this.selectRoleVo()
      .where('r.roleName = :roleName', { roleName })
      .andWhere('r.delFlag = :delFlag', { delFlag: '0' });

    this.sqlLoggerUtils.log(queryBuilder, 'checkRoleNameUnique');
    return queryBuilder.getOne();
  }

  async checkRoleKeyUnique(roleKey: string): Promise<SysRole> {
    const queryBuilder = this.selectRoleVo()
      .where('r.roleKey = :roleKey', { roleKey })
      .andWhere('r.delFlag = :delFlag', { delFlag: '0' });

    this.sqlLoggerUtils.log(queryBuilder, 'checkRoleKeyUnique');
    return queryBuilder.getOne();
  }

  async insertRole(role: SysRole): Promise<number> {
    const entityManager =
      this.contextHolderUtils.getContext('transactionManager') ||
      this.roleRepository.manager;

    const queryBuilder = entityManager
      .createQueryBuilder(SysRole, 'r')
      .insert()
      .into(SysRole)
      .values({
        ...role,
        createTime: new Date(),
      });

    this.sqlLoggerUtils.log(queryBuilder, 'insertRole');
    const result = await queryBuilder.execute();
    return result.identifiers[0].roleId;
  }

  async updateRole(role: SysRole): Promise<number> {
    // 创建更新对象，只包含有值的字段
    const updateData: any = {
      updateTime: new Date(), // 更新时间总是需要更新的
    };

    // 只有当字段有值时才添加到更新对象中
    if (role.roleName != null && role.roleName != '')
      updateData.roleName = role.roleName;
    if (role.roleKey != null && role.roleKey != '')
      updateData.roleKey = role.roleKey;
    if (role.roleSort != null) updateData.roleSort = role.roleSort;
    if (role.dataScope != null && role.dataScope != '')
      updateData.dataScope = role.dataScope;
    if (role.menuCheckStrictly != null)
      updateData.menuCheckStrictly = role.menuCheckStrictly;
    if (role.deptCheckStrictly != null)
      updateData.deptCheckStrictly = role.deptCheckStrictly;
    if (role.status != null && role.status != '')
      updateData.status = role.status;
    if (role.remark != null) updateData.remark = role.remark;
    if (role.updateBy != null && role.updateBy != '')
      updateData.updateBy = role.updateBy;

    const entityManager =
      this.contextHolderUtils.getContext('transactionManager') ||
      this.roleRepository.manager;

    const queryBuilder = entityManager
      .createQueryBuilder()
      .update(SysRole)
      .set(updateData)
      .where('roleId = :roleId', { roleId: role.roleId })
      .andWhere('delFlag = :delFlag', { delFlag: '0' });

    this.sqlLoggerUtils.log(queryBuilder, 'updateRole');
    const result = await queryBuilder.execute();
    return result.affected;
  }

  async deleteRoleById(roleId: number): Promise<number> {
    const queryBuilder = this.roleRepository
      .createQueryBuilder()
      .update(SysRole)
      .set({ delFlag: '2' })
      .where('roleId = :roleId', { roleId })
      .andWhere('delFlag = :delFlag', { delFlag: '0' });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteRoleById');
    const result = await queryBuilder.execute();
    return result.affected;
  }

  async deleteRoleByIds(roleIds: number[]): Promise<number> {
    const queryBuilder = this.roleRepository
      .createQueryBuilder()
      .update(SysRole)
      .set({ delFlag: '2' })
      .where('roleId IN (:...roleIds)', { roleIds })
      .andWhere('delFlag = :delFlag', { delFlag: '0' });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteRoleByIds');
    const result = await queryBuilder.execute();
    return result.affected;
  }
}
