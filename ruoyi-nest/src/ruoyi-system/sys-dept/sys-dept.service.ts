import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SysDeptRepository } from './repositories/sys-dept.repository';
import { SysDept } from './entities/sys-dept.entity';
import { TreeSelect } from '~/ruoyi-share/dto/tree-select.dto';
// import { ServiceException } from '~/ruoyi-share/exceptions/service.exception';
// import { UserConstants } from '~/ruoyi-share/constants/user.constants';
// import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
// import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { TreeUtils } from '~/ruoyi-share/utils/tree.utils';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { DataScope } from '~/ruoyi-share/annotation/DataScope';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { SysRoleRepository } from '~/ruoyi-system/sys-role/repositories/sys-role.repository';
import { UserConstants } from '~/ruoyi-share/constant/UserConstants';
@Injectable()
export class SysDeptService {
  constructor(
    private readonly deptRepository: SysDeptRepository,
    private readonly securityUtils: SecurityUtils,
    private readonly treeUtils: TreeUtils,
    private readonly roleRepository: SysRoleRepository,
  ) {}

  @DataScope({ deptAlias: 'd' })
  async selectDeptList(query: SysDept): Promise<[SysDept[], number]> {
    // // 获取当前方法的元数据
    // const metadata = Reflect.getMetadata(DATA_SCOPE_KEY, this.selectDeptList);

    // // 从元数据中获取注解参数
    // const { deptAlias } = metadata;

    // if(deptAlias){
    //   // 设置查询参数
    //   query.deptAlias = deptAlias;
    // }
    if (!query.delFlag) {
      query.delFlag = '0';
    }
    return this.deptRepository.selectDeptList(query);
  }

  async selectDeptTreeList(query: SysDept): Promise<TreeSelect[]> {
    const [depts, _total] = await this.selectDeptList(query);

    const transformedDepts = depts.map((dept) => ({
      id: dept.deptId,
      label: dept.deptName,
      parentId: dept.parentId,
    }));

    return this.treeUtils.arrayToTree(
      transformedDepts,
      'id',
      'parentId',
      'children',
    );
  }

  buildDeptTree(depts: SysDept[]): SysDept[] {
    const returnList: SysDept[] = [];
    const tempList = depts.map((dept) => dept.deptId);
    for (const dept of depts) {
      if (!tempList.includes(dept.parentId)) {
        this.recursionFn(depts, dept);
        returnList.push(dept);
      }
    }
    return returnList.length ? returnList : depts;
  }

  buildDeptTreeSelect(depts: SysDept[]): TreeSelect[] {
    const deptTrees = this.buildDeptTree(depts);
    return deptTrees.map((dept) => {
      const treeSelect = new TreeSelect();
      treeSelect.id = dept.deptId;
      treeSelect.label = dept.deptName;
      return treeSelect;
    });
  }

  /**
   * 根据角色ID查询部门树信息
   *
   * @param roleId 角色ID
   * @return 选中部门列表
   */
  async selectDeptListByRoleId(roleId: number): Promise<number[]> {
    const role = await this.roleRepository.selectRoleById(roleId);
    return this.deptRepository.selectDeptListByRoleId(
      roleId,
      role.deptCheckStrictly,
    );
  }

  async selectDeptById(deptId: number): Promise<SysDept> {
    return this.deptRepository.selectDeptById(deptId);
  }

  async selectNormalChildrenDeptById(deptId: number): Promise<number> {
    return this.deptRepository.selectNormalChildrenDeptById(deptId);
  }

  async hasChildByDeptId(deptId: number): Promise<boolean> {
    const result = await this.deptRepository.selectChildrenDeptById(deptId);
    return result.length > 0;
  }

  async checkDeptExistUser(deptId: number): Promise<boolean> {
    const result = await this.deptRepository.checkDeptExistUser(deptId);
    return result > 0;
  }
  async checkDeptNameUnique(dept: SysDept): Promise<boolean> {
    const deptId = dept.deptId ? dept.deptId : -1;
    const existingDept = await this.deptRepository.checkDeptNameUnique(
      dept.deptName,
      dept.parentId,
    );
    if (existingDept && existingDept.deptId !== deptId) {
      return false;
    }
    return true;
  }

  async checkDeptDataScope(deptId: number): Promise<void> {
    const loginUser = this.securityUtils.getLoginUser();
    if (!this.securityUtils.isAdmin(loginUser.userId) && deptId) {
      const dept = new SysDept();
      dept.deptId = deptId;
      const depts = await this.selectDeptList(dept);
      if (!depts.length) {
        throw new ServiceException('没有权限访问部门数据！');
      }
    }
  }

  async insertDept(dept: SysDept): Promise<number> {
    const info = await this.deptRepository.selectDeptById(dept.parentId);
    // 如果父节点不为正常状态,则不允许新增子节点
    if (!info || info.status !== UserConstants.DEPT_NORMAL) {
      throw new ServiceException('部门停用，不允许新增');
    }
    dept.ancestors = `${info.ancestors},${dept.parentId}`;
    return this.deptRepository.insertDept(dept);
  }

  async updateDept(dept: SysDept): Promise<number> {
    const newParentDept = await this.selectDeptById(dept.parentId);
    const oldDept = await this.selectDeptById(dept.deptId);
    if (newParentDept && oldDept) {
      const newAncestors = `${newParentDept.ancestors},${newParentDept.deptId}`;
      const oldAncestors = oldDept.ancestors;
      dept.ancestors = newAncestors;
      await this.updateDeptChildren(dept.deptId, newAncestors, oldAncestors);
    }
    const result = await this.deptRepository.updateDept(dept);
    if (
      dept.status === UserConstants.DEPT_NORMAL &&
      dept.ancestors &&
      dept.ancestors !== '0'
    ) {
      await this.updateParentDeptStatusNormal(dept);
    }
    return result;
  }

  private async updateParentDeptStatusNormal(dept: SysDept): Promise<void> {
    const deptIds = dept.ancestors.split(',').map(Number);
    await this.deptRepository.updateDeptStatusNormal(deptIds);
  }

  private async updateDeptChildren(
    deptId: number,
    newAncestors: string,
    oldAncestors: string,
  ): Promise<void> {
    const children = await this.deptRepository.selectChildrenDeptById(deptId);
    children.forEach((child) => {
      child.ancestors = child.ancestors.replace(oldAncestors, newAncestors);
    });
    if (children.length > 0) {
      await this.deptRepository.updateDeptChildren(children);
    }
  }

  async deleteDeptById(deptId: number): Promise<number> {
    return this.deptRepository.deleteDeptById(deptId);
  }

  private recursionFn(list: SysDept[], t: SysDept): void {
    const childList = this.getChildList(list, t);
    t.children = childList;
    for (const tChild of childList) {
      if (this.hasChild(list, tChild)) {
        this.recursionFn(list, tChild);
      }
    }
  }

  private getChildList(list: SysDept[], t: SysDept): SysDept[] {
    return list.filter((n) => n.parentId === t.deptId);
  }

  private hasChild(list: SysDept[], t: SysDept): boolean {
    return this.getChildList(list, t).length > 0;
  }
}
