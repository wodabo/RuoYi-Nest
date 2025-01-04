import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Res,
  Request,
  ParseArrayPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SysOperlogService } from '~/ruoyi-system/sys-operlog/sys-operlog.service';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { SysOperlog } from '~/ruoyi-system/sys-operlog/entities/sys-operlog.entity';
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

/**
 * 操作日志记录
 *
 * @author ruoyi
 */
@ApiTags('操作日志')
@Controller('monitor/operlog')
export class SysOperlogController extends BaseController {
  constructor(
    private readonly operlogService: SysOperlogService,
    private readonly excelUtils: ExcelUtils,
  ) {
    super();
  }

  /**
   * 获取操作日志列表
   *
   * @param query 查询参数
   */
  @ApiOperation({ summary: '获取操作日志列表' })
  @PreAuthorize('hasPermi("monitor:operlog:list")')
  @Get('list')
  async list(@Query() query: SysOperlog, @Request() req) {
    this.startPage(query);
    const [list, total] = await this.operlogService.selectOperLogList(query);
    return this.getDataTable(list, total);
  }

  /**
   * 清空操作日志
   */
  @ApiOperation({ summary: '清空操作日志' })
  @PreAuthorize('hasPermi("monitor:operlog:remove")')
  @Log({ title: '操作日志', businessType: BusinessType.CLEAN })
  @Delete('clean')
  async clean() {
    await this.operlogService.cleanOperLog();
    return this.success();
  }

  /**
   * 导出操作日志
   *
   * @param operLog 查询参数
   */
  @ApiOperation({ summary: '导出操作日志' })
  @PreAuthorize('hasPermi("monitor:operlog:export")')
  @Log({ title: '操作日志', businessType: BusinessType.EXPORT })
  @Post('export')
  async export(@Res() res, @Body() operLog: SysOperlog, @Request() req) {
    const [list] = await this.operlogService.selectOperLogList(operLog);
    await this.excelUtils.exportExcel(res, list, '操作日志', SysOperlog);
  }

  /**
   * 删除操作日志
   *
   * @param operIds 需要删除的操作日志ID
   */
  @ApiOperation({ summary: '删除操作日志' })
  @PreAuthorize('hasPermi("monitor:operlog:remove")')
  @Log({ title: '操作日志', businessType: BusinessType.DELETE })
  @Delete(':operIds')
  async remove(
    @Param('operIds', new ParseArrayPipe({ items: Number, separator: ',' }))
    operIds: number[],
  ) {
    await this.operlogService.deleteOperLogByIds(operIds);
    return this.success();
  }
}
