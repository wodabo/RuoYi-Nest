import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SysDeptService } from '~/ruoyi-system/sys-dept/sys-dept.service';
import { SysDept } from '~/ruoyi-system/sys-dept/entities/sys-dept.entity';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { Log } from '~/ruoyi-share/annotation/Log';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';

@ApiTags('部门管理')
@Controller('system/dept')
export class SysDeptController extends BaseController {
  constructor(private readonly sysDeptService: SysDeptService) {
    super();
  }

  @ApiOperation({ summary: '获取部门列表' })
  @PreAuthorize('hasPermi("system:dept:list")')
  @Get('list')
  async list(@Query() query: SysDept, @Request() req): Promise<AjaxResult> {
    const [list, total] = await this.sysDeptService.selectDeptList(query);
    return this.success(list);
  }

  @ApiOperation({ summary: '查询部门列表（排除节点）' })
  @PreAuthorize('hasPermi("system:dept:list")')
  @Get('list/exclude/:deptId')
  async excludeChild(@Param('deptId') deptId: string): Promise<AjaxResult> {
    const [list, _total] = await this.sysDeptService.selectDeptList(
      new SysDept(),
    );
    const depts = list.filter(
      (d) => d.deptId !== +deptId && !d.ancestors.split(',').includes(deptId),
    );
    return this.success(depts);
  }

  @ApiOperation({ summary: '根据部门编号获取详细信息' })
  @PreAuthorize('hasPermi("system:dept:query")')
  @Get(':deptId')
  async getInfo(@Param('deptId') deptId: string): Promise<AjaxResult> {
    await this.sysDeptService.checkDeptDataScope(+deptId);
    const dept = await this.sysDeptService.selectDeptById(+deptId);
    console.log('[ dept ] >', dept);
    return this.success(dept);
  }

  @ApiOperation({ summary: '新增部门' })
  @PreAuthorize('hasPermi("system:dept:add")')
  @Log({ title: '部门管理', businessType: BusinessType.INSERT })
  @Post()
  async add(@Body() dept: SysDept, @Request() req): Promise<AjaxResult> {
    const loginUser = req.user;
    if (!(await this.sysDeptService.checkDeptNameUnique(dept))) {
      return this.error(`新增部门'${dept.deptName}'失败，部门名称已存在`);
    }
    dept.createBy = loginUser.getUsername();
    const result = await this.sysDeptService.insertDept(dept);
    return this.toAjax(result);
  }

  @ApiOperation({ summary: '修改部门' })
  @PreAuthorize('hasPermi("system:dept:edit")')
  @Log({ title: '部门管理', businessType: BusinessType.UPDATE })
  @Put()
  async edit(@Body() dept: SysDept, @Request() req): Promise<AjaxResult> {
    const loginUser = req.user;
    await this.sysDeptService.checkDeptDataScope(dept.deptId);
    if (!(await this.sysDeptService.checkDeptNameUnique(dept))) {
      return this.error(`修改部门'${dept.deptName}'失败，部门名称已存在`);
    }
    if (dept.parentId === dept.deptId) {
      return this.error(`修改部门'${dept.deptName}'失败，上级部门不能是自己`);
    }
    if (
      dept.status === '1' &&
      (await this.sysDeptService.selectNormalChildrenDeptById(dept.deptId)) > 0
    ) {
      return this.error('该部门包含未停用的子部门！');
    }
    dept.updateBy = loginUser.getUsername();
    const result = await this.sysDeptService.updateDept(dept);
    return this.toAjax(result);
  }

  @ApiOperation({ summary: '删除部门' })
  @PreAuthorize('hasPermi("system:dept:remove")')
  @Log({ title: '部门管理', businessType: BusinessType.DELETE })
  @Delete(':deptId')
  async remove(@Param('deptId') deptId: string): Promise<AjaxResult> {
    if (await this.sysDeptService.hasChildByDeptId(+deptId)) {
      return this.warn('存在下级部门,不允许删除');
    }
    if (await this.sysDeptService.checkDeptExistUser(+deptId)) {
      return this.warn('部门存在用户,不允许删除');
    }
    await this.sysDeptService.checkDeptDataScope(+deptId);
    const result = await this.sysDeptService.deleteDeptById(+deptId);
    return this.toAjax(result);
  }
}
