import { Injectable } from '@nestjs/common';
import { DataScope } from '~/ruoyi-share/constant/DataScope';
import { UserConstants } from '../constant/UserConstants';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { SysDept } from '~/ruoyi-system/sys-dept/entities/sys-dept.entity';
import { SysRoleDept } from '~/ruoyi-system/sys-role-dept/entities/sys-role-dept.entity';
import { SelectQueryBuilder } from 'typeorm';
import { SecurityUtils } from './security.utils';
import { LoginUser } from '../model/login-user';

@Injectable()
export class DataScopeUtils {
  constructor(private readonly securityUtils: SecurityUtils) {}

  /**
   * 构建数据过滤条件
   */
  dataScopeFilter(queryBuilder: SelectQueryBuilder<any>, params?: any) {
    const { deptAlias, userAlias, permission } = params;

    const loginUser = this.securityUtils.getLoginUser();

    // 如果是超级管理员则不过滤数据
    if (this.securityUtils.isAdmin(loginUser.userId)) {
      return;
    }

    const scopeCustomIds: number[] = [];

    // 获取具有自定义数据权限的角色ID
    loginUser.user.roles.forEach((role) => {
      if (
        role.dataScope === DataScope.DATA_SCOPE_CUSTOM &&
        role.status === UserConstants.ROLE_NORMAL
      ) {
        scopeCustomIds.push(role.roleId);
      }
    });

    const conditions: string[] = [];

    // 根据角色数据范围处理
    for (const role of loginUser.user.roles) {
      if (
        conditions.includes(role.dataScope) ||
        role.status === UserConstants.ROLE_DISABLE
      ) {
        continue;
      }

      if (DataScope.DATA_SCOPE_ALL === role.dataScope) {
        conditions.push(role.dataScope);
        break;
      } else if (DataScope.DATA_SCOPE_CUSTOM === role.dataScope) {
        if (scopeCustomIds.length > 1) {
          queryBuilder.orWhere((qb) => {
            const subQuery = qb
              .subQuery()
              .select('rd.deptId')
              .from(SysRoleDept, 'rd')
              .where('rd.roleId IN (:...roleIds)', { roleIds: scopeCustomIds })
              .getQuery();
            return `${deptAlias}.dept_id IN ${subQuery}`;
          });
        } else {
          queryBuilder.andWhere((qb) => {
            const subQuery = qb
              .subQuery()
              .select('rd.deptId')
              .from(SysRoleDept, 'rd')
              .where('rd.roleId = :roleId', { roleId: role.roleId })
              .getQuery();
            return `${deptAlias}.dept_id IN ${subQuery}`;
          });
          //   queryBuilder.orWhere(`${deptAlias}.dept_id IN (SELECT dept_id FROM sys_role_dept WHERE role_id = :roleId)`, { roleId: role.roleId });
        }
      } else if (DataScope.DATA_SCOPE_DEPT === role.dataScope) {
        queryBuilder.orWhere(`${deptAlias}.deptId = :deptId`, {
          deptId: loginUser.deptId,
        });
      } else if (DataScope.DATA_SCOPE_DEPT_AND_CHILD === role.dataScope) {
        queryBuilder.orWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select(`${deptAlias}.deptId`)
            .from(SysDept, deptAlias)
            .where(
              `${deptAlias}.deptId = :deptId OR FIND_IN_SET(:deptId, ${deptAlias}.ancestors)`,
              { deptId: loginUser.deptId },
            )
            .getQuery();
          return `${deptAlias}.deptId IN ${subQuery}`;
        });
      } else if (DataScope.DATA_SCOPE_SELF === role.dataScope) {
        if (userAlias) {
          queryBuilder.orWhere(`${userAlias}.userId = :userId`, {
            userId: loginUser.userId,
          });
        } else {
          queryBuilder.orWhere(`${deptAlias}.deptId = 0`);
        }
      }
      conditions.push(role.dataScope);
    }

    // 如果没有任何数据权限限制,则不查询任何数据
    if (conditions.length === 0) {
      queryBuilder.orWhere(`${deptAlias}.deptId = 0`);
    }
  }
}
