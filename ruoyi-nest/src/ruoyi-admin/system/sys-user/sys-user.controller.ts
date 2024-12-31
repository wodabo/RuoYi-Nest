import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Put, 
  Param, 
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Res,
  Req,
  UploadedFile,
  UseInterceptors,
  Request,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, PartialType } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
// import { AuthGuard } from '@nestjs/passport';
import { SysUserService } from '~/ruoyi-system/sys-user/sys-user.service';
// import { SysRoleService } from '~/ruoyi-system/sys-role/sys-role.service';
// import { SysDeptService } from '~/ruoyi-system/sys-dept/sys-dept.service';
// import { SysPostService } from '~/ruoyi-system/sys-post/sys-post.service';
// import { Log } from '~/ruoyi-share/decorators/log.decorator';
// import { BusinessType } from '~/ruoyi-share/enums/business-type.enum';
// import { PreAuthorize } from '~/ruoyi-share/decorators/preauthorize.decorator';
// import { DataScope } from '~/ruoyi-share/decorators/datascope.decorator';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { SysDeptService } from '~/ruoyi-system/sys-dept/sys-dept.service';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result'; 
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { SysPostService } from '~/ruoyi-system/sys-post/sys-post.service';
import { SysRoleService } from '~/ruoyi-system/sys-role/sys-role.service';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';
import { Log } from '~/ruoyi-share/annotation/Log';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { FileUploadUtils } from '~/ruoyi-share/utils/file-upload.utils';
import { MimeTypeUtils } from '~/ruoyi-share/utils/mime-type.utils';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';
import { ExcelUtils } from '~/ruoyi-share/utils/excel.utils';
import { SysDept } from '~/ruoyi-system/sys-dept/entities/sys-dept.entity';


@ApiTags('用户管理')
@Controller('system/user')
// @UseGuards(AuthGuard('jwt'))
export class SysUserController extends BaseController {
  constructor(
    private readonly userService: SysUserService,
    // private readonly sysRoleService: SysRoleService,
    private readonly deptService: SysDeptService,
    private readonly postService: SysPostService,
    private readonly roleService: SysRoleService,
    private readonly securityUtils: SecurityUtils,
    private readonly jwtAuthService: JwtAuthService,  
    private readonly fileUploadUtils: FileUploadUtils,
    private readonly mimeTypeUtils: MimeTypeUtils,
    private readonly ruoyiConfigService: RuoYiConfigService,  
    private readonly excelUtils: ExcelUtils,
  ) {
    super();
  }

  @PreAuthorize('hasPermi("system:user:list")')
  @Get('list')
  @ApiOperation({ summary: '获取用户列表' })
  async list(@Query() query: SysUser,@Request() req): Promise<TableDataInfo> {
    this.startPage(query)
    const loginUser = req.user;
    const [list, total] = await this.userService.selectUserList(query);
    return this.getDataTable(list, total)
  }

  @PreAuthorize('hasPermi("system:user:export")')
  @Post('export')
  @ApiOperation({ summary: '导出用户' })
  @Log({ title: '用户管理', businessType: BusinessType.EXPORT })
  async export(@Res() res, @Body() user: SysUser, @Request() req) {
    const loginUser = req.user;
    const [list] = await this.userService.selectUserList(user);
    await this.excelUtils.exportExcel(res, list, '用户数据',SysUser);
  }

  @PreAuthorize('hasPermi("system:user:import")')
  @Post('importData')
  @ApiOperation({ summary: '导入用户数据' })
  @UseInterceptors(FileInterceptor('file'))
  @Log({ title: '用户管理', businessType: BusinessType.IMPORT })
  async importData(@UploadedFile() file, @Body('updateSupport') updateSupport: boolean, @Request() req) {
    const loginUser = req.user;
    const userList = await this.excelUtils.importExcel(file.buffer, SysUser);
    const message = await this.userService.importUser(userList, updateSupport, req.user.username);
    console.log(userList,'userList')
    return AjaxResult.success(message);
  }

  // @Post('importTemplate')
  // @ApiOperation({ summary: '下载导入模板' })
  // async importTemplate(@Res() res) {
  //   // Implement template download logic here
  // }

  @Get('profile')
  @ApiOperation({ summary: '获取个人信息' })
  async profile(@Request() req) {
    const loginUser = req.user;
    const user = loginUser.user;
    const ajax:any = AjaxResult.success(user);
    ajax.postGroup = await this.userService.selectUserPostGroup(loginUser.getUsername());
    ajax.roleGroup = await this.userService.selectUserRoleGroup(loginUser.getUsername());
    return ajax;
  }

  @Put('profile')
  @ApiOperation({ summary: '修改个人信息' })
  @Log({ title: '个人信息', businessType: BusinessType.UPDATE })
  async updateProfile(@Body() user: SysUser, @Request() req) {
    const loginUser = req.user;
    const currentUser = loginUser.user;
    currentUser.nickName = user.nickName;
    currentUser.email = user.email;
    currentUser.phonenumber = user.phonenumber;
    currentUser.sex = user.sex;

    if (user.phonenumber && !await this.userService.checkPhoneUnique(currentUser)) {
      return AjaxResult.error(`修改用户'${loginUser.username}'失败，手机号码已存在`);
    }
    if (user.email && !await this.userService.checkEmailUnique(currentUser)) {
      return AjaxResult.error(`修改用户'${loginUser.username}'失败，邮箱账号已存在`);
    }

    const result = await this.userService.updateUserProfile(currentUser);
    if (result > 0) {
      // 更新缓存用户信息
      await this.jwtAuthService.setLoginUser(loginUser);
      return AjaxResult.success();
    }
    return AjaxResult.error('修改个人信息异常，请联系管理员');
  }

  @Put('profile/updatePwd')
  @ApiOperation({ summary: '重置密码' })
  @Log({ title: '个人信息', businessType: BusinessType.UPDATE })
  async updatePwd(@Query('oldPassword') oldPassword: string, @Query('newPassword') newPassword: string, @Request() req) {
    const loginUser = req.user;
    const currentUser = loginUser.user;
    const userName = loginUser.getUsername();
    const password = loginUser.getPassword();

    if (!await this.securityUtils.matchesPassword(oldPassword, password)) {
      return AjaxResult.error('修改密码失败，旧密码错误');
    }
    if (await this.securityUtils.matchesPassword(newPassword, password)) {
      return AjaxResult.error('新密码不能与旧密码相同');
    }

    const encryptedPassword = await this.securityUtils.encryptPassword(newPassword);
    const result = await this.userService.resetUserPwd(userName, encryptedPassword);
    if (result > 0) {
      // 更新缓存用户密码
      currentUser.password = encryptedPassword;
      await this.jwtAuthService.setLoginUser(loginUser);
      return AjaxResult.success();
    }
    return AjaxResult.error('修改密码异常，请联系管理员');
  }

  @Post('profile/avatar')
  @ApiOperation({ summary: '上传头像' })
  @Log({ title: '用户头像', businessType: BusinessType.UPDATE })
  @UseInterceptors(FileInterceptor('avatarfile'))
  async avatar(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (file) {
      const loginUser = req.user;
      const avatar = await this.fileUploadUtils.uploadWithExtension(this.ruoyiConfigService.getAvatarPath(), file, this.mimeTypeUtils.IMAGE_EXTENSION);
      if (await this.userService.updateUserAvatar(loginUser.getUsername(), avatar)) {
        const ajax = AjaxResult.success();
        ajax.imgUrl = avatar;
        // 更新缓存用户头像
        loginUser.user.avatar = avatar;
        await this.jwtAuthService.setLoginUser(loginUser);
        return ajax;
      }
    }
    return AjaxResult.error('上传图片异常，请联系管理员');
  }
  
  @PreAuthorize('hasPermi("system:user:list")')
  @Get('deptTree')
  @ApiOperation({ summary: '获取部门树列表' })
  async deptTree(@Query() dept: SysDept,@Request() req) {      
    
    const loginUser = req.user;


    return AjaxResult.success(await this.deptService.selectDeptTreeList(dept));  
  }

    // nestjs 匹配参数路由更为宽松，所以deptTree要放在这个方法上面，否则会导致deptTree方法匹配不到
  @PreAuthorize("hasPermi('system:user:query')")
  @Get(['//',':userId'])
  @ApiOperation({ summary: '根据用户编号获取详细信息' })
  async getInfo(@Param('userId', new DefaultValuePipe(0), ParseIntPipe) userId: number, @Request() req) {
    const loginUser = req.user;
    const ajax:any = new AjaxResult();
    if (userId) {
      await this.userService.checkUserDataScope(userId,loginUser);
      const sysUser = await this.userService.selectUserById(userId);
      ajax.data = sysUser;
      ajax.postIds = await this.postService.selectPostListByUserId(userId);
      ajax.roleIds = sysUser.roles.map(role => role.roleId);
    }
    const roles = await this.roleService.selectRoleAll();
    ajax.roles =  this.securityUtils.isAdmin(userId) ? roles : roles.filter(r => !this.securityUtils.isAdmin(r.roleId));
    ajax.posts = await this.postService.selectPostAll();
    return ajax;
  }



  @PreAuthorize("hasPermi('system:user:add')")
  @Post()
  @ApiOperation({ summary: '新增用户' })
  @Log({ title: '用户管理', businessType: BusinessType.INSERT })
  async add(@Body() user: SysUser,@Request() req) {
    const loginUser = req.user;
    await this.deptService.checkDeptDataScope(user.deptId);
    await this.roleService.checkRoleDataScope(user.roleIds);
    if (!await this.userService.checkUserNameUnique(user)) {
      return AjaxResult.error(`新增用户'${user.userName}'失败，登录账号已存在`);
    }
    if (user.phonenumber && !await this.userService.checkPhoneUnique(user)) {
      return AjaxResult.error(`新增用户'${user.userName}'失败，手机号码已存在`);
    }
    if (user.email && !await this.userService.checkEmailUnique(user)) {
      return AjaxResult.error(`新增用户'${user.userName}'失败，邮箱账号已存在`);
    }
    user.createBy = loginUser.getUsername(); 
    user.password = await this.securityUtils.encryptPassword(user.password);
    return AjaxResult.success(await this.userService.insertUser(user));
  }

  @PreAuthorize('hasPermi("system:user:edit")')
  @ApiOperation({ summary: '修改用户' })
  @Log({ title: '用户管理', businessType: BusinessType.UPDATE })
  @Put()
  async update(@Body() user: SysUser,@Request() req) {
    const loginUser = req.user;
    await this.userService.checkUserAllowed(user);
    await this.userService.checkUserDataScope(user.userId);
    await this.deptService.checkDeptDataScope(user.deptId);
    await this.roleService.checkRoleDataScope(user.roleIds);
    if (!await this.userService.checkUserNameUnique(user)) {
      return AjaxResult.error(`修改用户'${user.userName}'失败，登录账号已存在`);
    }
    if (user.phonenumber && !await this.userService.checkPhoneUnique(user)) {
      return AjaxResult.error(`修改用户'${user.userName}'失败，手机号码已存在`);
    }
    if (user.email && !await this.userService.checkEmailUnique(user)) {
      return AjaxResult.error(`修改用户'${user.userName}'失败，邮箱账号已存在`);
    }
    user.updateBy = loginUser.getUsername();
    return AjaxResult.success(await this.userService.updateUser(user));
  }

  @PreAuthorize("hasPermi('system:user:remove')")
  @Delete(':userIds')
  @ApiOperation({ summary: '删除用户' })
  @Log({ title: '用户管理', businessType: BusinessType.DELETE })
  async remove(@Param('userIds') userIds: string,@Request() req) {
    const loginUser = req.user;
    const userIdArray = userIds.split(',').map(id => parseInt(id));
    if (userIdArray.includes(loginUser.userId)) {
      return AjaxResult.error('当前用户不能删除');
    }
    return AjaxResult.success(await this.userService.deleteUserByIds(userIdArray,loginUser));
  }

  @PreAuthorize("hasPermi('system:user:resetPwd')")
  @Put('resetPwd')
  @ApiOperation({ summary: '重置密码' })
  @Log({ title: '用户管理', businessType: BusinessType.UPDATE })
  async resetPwd(@Body() user: SysUser, @Request() req) {
    const loginUser = req.user;
    await this.userService.checkUserAllowed(user);
    await this.userService.checkUserDataScope(user.userId, loginUser);
    user.password = await this.securityUtils.encryptPassword(user.password);

    user.updateBy = loginUser.username;
    return AjaxResult.success(await this.userService.resetPwd(user));
  }

  @PreAuthorize("hasPermi('system:user:edit')")
  @Put('changeStatus')
  @ApiOperation({ summary: '状态修改' })
  @Log({ title: '用户管理', businessType: BusinessType.UPDATE })
  async changeStatus(@Body() user: SysUser, @Request() req) {
    const loginUser = req.user;
    const currentUser = loginUser.user;
    await this.userService.checkUserAllowed(currentUser);
    await this.userService.checkUserDataScope(currentUser.userId, loginUser);
    user.updateBy = loginUser.getUsername();
    return AjaxResult.success(await this.userService.updateUserStatus(user));
  }

  @PreAuthorize("hasPermi('system:user:query')")
  @Get('authRole/:userId')
  @ApiOperation({ summary: '根据用户编号获取授权角色' })
  async authRole(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    const loginUser = req.user;
    const user = await this.userService.selectUserById(userId);
    const roles = await this.roleService.selectRolesByUserId(userId,loginUser);
    const ajax = AjaxResult.success();
    ajax.user = user
    ajax.roles = this.securityUtils.isAdmin(userId) ? roles : roles.filter(r => !this.securityUtils.isAdmin(r.roleId));
    return ajax;
  }

  @PreAuthorize('hasPermi("system:user:edit")')
  @Put('authRole')
  @ApiOperation({ summary: '用户授权角色' })
  @Log({ title: '用户管理', businessType: BusinessType.GRANT })
  async insertAuthRole(@Query('userId', ParseIntPipe) userId: number, @Query('roleIds') roleIds: number[], @Request() req) {
    const loginUser = req.user;

    // await this.userService.checkUserDataScope(userId, loginUser);
    // await this.roleService.checkRoleDataScope(roleIds, loginUser);
    // await this.userService.insertUserAuth(userId, roleIds);
    return AjaxResult.success();
  }



  // private async parseExcel(file: any): Promise<any[]> {
  //   // Implement Excel parsing logic here
  //   return [];
  // }
}