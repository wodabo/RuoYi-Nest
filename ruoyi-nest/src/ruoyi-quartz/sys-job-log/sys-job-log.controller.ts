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
  ValidationPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  PartialType,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { SysJobLogService } from '~/ruoyi-quartz/sys-job-log/sys-job-log.service';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';
import { Log } from '~/ruoyi-share/annotation/Log';
import { SysJobLog } from '~/ruoyi-quartz/sys-job-log/entities/sys-job-log.entity';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { ExcelUtils } from '~/ruoyi-share/utils/excel.utils';

@ApiTags('定时任务调度日志')
@Controller('monitor/jobLog')
@UseGuards(AuthGuard('jwt'))
export class SysJobLogController extends BaseController {
  constructor(
    private readonly jobLogService: SysJobLogService,
    private readonly excelUtils: ExcelUtils,
  ) {
    super();
  }

  @PreAuthorize('hasPermi("monitor:job:list")')
  @Get('list')
  @ApiOperation({ summary: '获取定时任务调度日志列表' })
  async list(@Query() query: SysJobLog): Promise<TableDataInfo> {
    this.startPage(query);
    const [list, total] = await this.jobLogService.selectJobLogList(query);
    return this.getDataTable(list, total);
  }

  @PreAuthorize('hasPermi("monitor:job:export")')
  @Post('export')
  @ApiOperation({ summary: '导出定时任务调度日志' })
  @Log({ title: '任务调度日志', businessType: BusinessType.EXPORT })
  async export(@Res() res, @Body() jobLog: SysJobLog) {
    const [list] = await this.jobLogService.selectJobLogList(jobLog);
    await this.excelUtils.exportExcel(res, list, '调度日志', SysJobLog);
  }

  @PreAuthorize("hasPermi('monitor:job:query')")
  @Get(':jobLogId')
  @ApiOperation({ summary: '根据调度编号获取详细信息' })
  async getInfo(@Param('jobLogId', ParseIntPipe) jobLogId: number) {
    return AjaxResult.success(
      await this.jobLogService.selectJobLogById(jobLogId),
    );
  }

  @PreAuthorize("hasPermi('monitor:job:remove')")
  @Delete(':jobLogIds')
  @ApiOperation({ summary: '删除定时任务调度日志' })
  @Log({ title: '定时任务调度日志', businessType: BusinessType.DELETE })
  async remove(
    @Param('jobLogIds', new ParseArrayPipe({ items: Number, separator: ',' }))
    jobLogIds: number[],
  ) {
    return AjaxResult.success(
      await this.jobLogService.deleteJobLogByIds(jobLogIds),
    );
  }

  @PreAuthorize("hasPermi('monitor:job:remove')")
  @Delete('clean')
  @ApiOperation({ summary: '清空定时任务调度日志' })
  @Log({ title: '调度日志', businessType: BusinessType.CLEAN })
  async clean() {
    await this.jobLogService.cleanJobLog();
    return AjaxResult.success();
  }
}
