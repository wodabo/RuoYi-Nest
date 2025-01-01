import { Controller, Get, Post, Delete, Body, Param, Query, Res, Request, ParseArrayPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { SysLogininfor } from '~/ruoyi-system/sys-logininfor/entities/sys-logininfor.entity';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { ExcelUtils } from '~/ruoyi-share/utils/excel.utils';
import { FileUploadUtils } from '~/ruoyi-share/utils/file-upload.utils';  
import { MimeTypeUtils } from '~/ruoyi-share/utils/mime-type.utils';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { Log } from '~/ruoyi-share/annotation/Log';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';
import { SysLogininforService } from '~/ruoyi-system/sys-logininfor/sys-logininfor.service';
import { PasswordUtils } from '~/ruoyi-share/utils/password.utils';

/**
 * 系统访问记录
 * 
 * @author ruoyi
 */
@ApiTags('系统访问记录')
@Controller('monitor/logininfor')
export class SysLogininforController extends BaseController {
  constructor(
    private readonly logininforService: SysLogininforService,
    private readonly excelUtils: ExcelUtils,
    private readonly passwordUtils: PasswordUtils
  ) {
    super();
  }

  /**
   * 获取系统访问记录列表
   */
  @ApiOperation({ summary: '获取系统访问记录列表' })
  @PreAuthorize('hasPermi("monitor:logininfor:list")')
  @Get('list')
  async list(@Query() query: SysLogininfor, @Request() req) {
    this.startPage(query);
    const [list, total] = await this.logininforService.selectLogininforList(query);
    return this.getDataTable(list, total);
  }

  /**
   * 清空系统访问记录
   */
  @ApiOperation({ summary: '清空系统访问记录' })
  @PreAuthorize('hasPermi("monitor:logininfor:remove")')
  @Log({ title: '登录日志', businessType: BusinessType.CLEAN })
  @Delete('clean')
  async clean() {
    await this.logininforService.cleanLogininfor();
    return this.success();
  }

  /**
   * 导出系统访问记录
   */
  @ApiOperation({ summary: '导出系统访问记录' })
  @PreAuthorize('hasPermi("monitor:logininfor:export")')
  @Log({ title: '登录日志', businessType: BusinessType.EXPORT })
  @Post('export')
  async export(@Res() res, @Body() logininfor: SysLogininfor, @Request() req) {
    const [list] = await this.logininforService.selectLogininforList(logininfor);
    await this.excelUtils.exportExcel(res, list, '登录日志', SysLogininfor);
  }

  /**
   * 删除系统访问记录
   * 
   * @param infoIds 需要删除的访问记录ID
   */
  @ApiOperation({ summary: '删除系统访问记录' })
  @PreAuthorize('hasPermi("monitor:logininfor:remove")')
  @Log({ title: '登录日志', businessType: BusinessType.DELETE })
  @Delete(':infoIds')
  async remove(@Param('infoIds',new ParseArrayPipe({ items: Number, separator: ',' })) infoIds: number[]) {
    await this.logininforService.deleteLogininforByIds(infoIds);
    return this.success();
  }

  /**
   * 解锁账户
   * 
   * @param userName 用户名称
   */
  @ApiOperation({ summary: '解锁账户' })
  @PreAuthorize('hasPermi("monitor:logininfor:unlock")')
  @Log({ title: '账户解锁', businessType: BusinessType.OTHER })
  @Get('unlock/:userName')
  async unlock(@Param('userName') userName: string) {
    await this.passwordUtils.clearLoginRecordCache(userName);
    return this.success();
  }
}
