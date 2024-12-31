import { Controller, Get, Post, Put, Delete, Body, Param, Query, Res,Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SysRoleService } from '~/ruoyi-system/sys-role/sys-role.service';
import { SysRole } from '~/ruoyi-system/sys-role/entities/sys-role.entity';
// import { PreAuthorize } from '~/ruoyi-share/decorators/preAuthorize.decorator';
// import { Log } from '~/ruoyi-share/decorators/log.decorator';
// import { BusinessType } from '~/ruoyi-share/enums/businessType.enum';
// import { AjaxResult } from '~/ruoyi-share/models/ajax-result.model';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { Log } from '~/ruoyi-share/annotation/Log';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { SysDept } from '~/ruoyi-system/sys-dept/entities/sys-dept.entity';
import { SysDeptService } from '~/ruoyi-system/sys-dept/sys-dept.service';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';
import { ExcelUtils } from '~/ruoyi-share/utils/excel.utils';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { SysPermissionService } from '~/ruoyi-share/permission/sys-permission.service';
import { SysUserService } from '~/ruoyi-system/sys-user/sys-user.service';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';

@ApiTags('角色信息')
@Controller('system/role')
export class SysRoleController extends BaseController {
  constructor(
    private readonly roleService: SysRoleService,
    private readonly deptService: SysDeptService,
    private readonly excelUtils: ExcelUtils,
    private readonly securityUtils: SecurityUtils,
    private readonly userService: SysUserService,
    private readonly permissionService: SysPermissionService,
    private readonly jwtAuthService: JwtAuthService 
  ) {
    super();
  }

  // @PreAuthorize('system:role:list')
  @Get('list')
  @ApiOperation({ summary: '获取角色列表' })
  @ApiResponse({ status: 200, description: '成功', type: TableDataInfo })
  async list(@Query() query: SysRole,@Request() req): Promise<TableDataInfo> {
    this.startPage(query);
    const loginUser = req.user
    const [list, total] = await this.roleService.selectRoleList(query);
    return this.getDataTable(list, total);
  }

  @PreAuthorize('hasPermi("system:role:export")')   
  @Post('export')
  // @Log({ title: '角色管理', businessType: BusinessType.EXPORT })  
  @ApiOperation({ summary: '导出角色数据' })
  async export(@Res() res, @Body() role: SysRole): Promise<void> {
    const [list, _total] = await this.roleService.selectRoleList(role);
    await this.excelUtils.exportExcel(res, list, '角色数据',SysRole);
  }

  @PreAuthorize('hasPermi("system:role:query")')  
  @Get(':roleId')
  @ApiOperation({ summary: '根据角色编号获取详细信息' })
  @ApiResponse({ status: 200, description: '成功', type: AjaxResult })    
  async getInfo(@Param('roleId') roleId: number): Promise<AjaxResult> {
    await this.roleService.checkRoleDataScope([roleId]);
    const data = await this.roleService.selectRoleById(roleId);
    return AjaxResult.success(data);
  }

  @PreAuthorize('hasPermi("system:role:add")')
  @Post()
  // @Log({ title: '角色管理', businessType: BusinessType.INSERT })
  @ApiOperation({ summary: '新增角色' })
  @ApiResponse({ status: 200, description: '成功', type: AjaxResult })
  async add(@Body() role: SysRole,@Request() req): Promise<AjaxResult> {
    const loginUser = req.user
    if (!(await this.roleService.checkRoleNameUnique(role))) {
      return AjaxResult.error(`新增角色'${role.roleName}'失败，角色名称已存在`);
    }
    if (!(await this.roleService.checkRoleKeyUnique(role))) {
      return AjaxResult.error(`新增角色'${role.roleName}'失败，角色权限已存在`);
    }
    role.createBy = loginUser.getUsername();
    const result = await this.roleService.insertRole(role);
    return AjaxResult.success(result);
  }

  @PreAuthorize('hasPermi("system:role:edit")')
  @Put()
  // @Log({ title: '角色管理', businessType: BusinessType.UPDATE })
  @ApiOperation({ summary: '修改保存角色' })
  @ApiResponse({ status: 200, description: '成功', type: AjaxResult })
  async edit(@Body() role: SysRole,@Request() req): Promise<AjaxResult> {
    const loginUser = req.user
    this.roleService.checkRoleAllowed(role);
    await this.roleService.checkRoleDataScope([role.roleId]);
    if (!(await this.roleService.checkRoleNameUnique(role))) {
      return AjaxResult.error(`修改角色'${role.roleName}'失败，角色名称已存在`);
    }
    if (!(await this.roleService.checkRoleKeyUnique(role))) {
      return AjaxResult.error(`修改角色'${role.roleName}'失败，角色权限已存在`);
    }
    role.updateBy = loginUser.getUsername();
    const result = await this.roleService.updateRole(role);
    if (result > 0) {
      // Update cache user permissions  
      if (loginUser && !this.securityUtils.isAdmin(loginUser.userId)) {
        loginUser.user = await this.userService.selectUserByUserName(loginUser.getUsername());
        loginUser.permissions = await this.permissionService.getMenuPermission(loginUser.user);
        this.jwtAuthService.setLoginUser(loginUser);
      }
      return AjaxResult.success();
    }
    return AjaxResult.error(`修改角色'${role.roleName}'失败，请联系管理员`);
  }

  // @PreAuthorize('system:role:edit')
  // @Put('dataScope')
  // @Log({ title: '角色管理', businessType: BusinessType.UPDATE })
  // @ApiOperation({ summary: '修改保存数据权限' })
  // @ApiResponse({ status: 200, description: '成功', type: AjaxResult })
  // async dataScope(@Body() role: SysRole): Promise<AjaxResult> {
  //   this.sysRoleService.checkRoleAllowed(role);
  //   await this.sysRoleService.checkRoleDataScope(role.roleId);
  //   return AjaxResult.toAjax(await this.sysRoleService.authDataScope(role));
  // }

  @PreAuthorize('system:role:edit')
  @Put('changeStatus')
  @Log({ title: '角色管理', businessType: BusinessType.UPDATE })
  @ApiOperation({ summary: '状态修改' })
  @ApiResponse({ status: 200, description: '成功', type: AjaxResult })
  async changeStatus(@Body() role: SysRole): Promise<AjaxResult> {
    this.roleService.checkRoleAllowed(role);
    await this.roleService.checkRoleDataScope([role.roleId]);
    return AjaxResult.success(await this.roleService.updateRoleStatus(role));
  }

  @PreAuthorize("hasPermi('system:role:remove')")
  @Delete(':roleIds')
  @Log({ title: '角色管理', businessType: BusinessType.DELETE })
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 200, description: '成功', type: AjaxResult })
  async remove(@Param('roleIds') roleIds: string): Promise<AjaxResult> {
    return AjaxResult.success(await this.roleService.deleteRoleByIds(roleIds.split(',').map(id => +id)));
  }

  // @PreAuthorize('system:role:query')
  // @Get('optionselect')
  // @ApiOperation({ summary: '获取角色选择框列表' })
  // @ApiResponse({ status: 200, description: '成功', type: AjaxResult })
  // async optionselect(): Promise<AjaxResult> {
  //   const roles = await this.sysRoleService.selectRoleAll();
  //   return AjaxResult.success(roles);
  // }


  @PreAuthorize('hasPermi("system:role:query")')
  @Get('deptTree/:roleId')
  @ApiOperation({ summary: '获取对应角色部门树列表' })
  @ApiResponse({ status: 200, description: '成功', type: AjaxResult })
  async deptTree(@Param('roleId') roleId: number): Promise<AjaxResult> {
    const checkedKeys = await this.deptService.selectDeptListByRoleId(roleId);
    const depts = await this.deptService.selectDeptTreeList(new SysDept());
    const ajax = AjaxResult.success();
    ajax.put('checkedKeys', checkedKeys);
    ajax.put('depts', depts);
    return ajax;
  }

  // Additional methods like allocatedList, unallocatedList, cancelAuthUser, etc. can be added here
  // following the same pattern as above.
}
