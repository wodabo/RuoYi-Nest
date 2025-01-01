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
  ParseArrayPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, PartialType } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { SysJobService } from '~/ruoyi-quartz/sys-job/sys-job.service';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result'; 
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';
import { Log } from '~/ruoyi-share/annotation/Log';
import { SysJob } from '~/ruoyi-quartz/sys-job/entities/sys-job.entity';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { ExcelUtils } from '~/ruoyi-share/utils/excel.utils';
import { ScheduleUtils } from '~/ruoyi-share/utils/schedule.utils';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';


@ApiTags('定时任务管理')
@Controller('monitor/job')
export class SysJobController extends BaseController {
  constructor(
    private readonly jobService: SysJobService,
    private readonly excelUtils: ExcelUtils,
    private readonly securityUtils: SecurityUtils,
  ) {
    super();
  }

  @PreAuthorize('hasPermi("monitor:job:list")')
  @Get('list')
  @ApiOperation({ summary: '获取定时任务列表' })
  async list(@Query() query: SysJob): Promise<TableDataInfo> {
    this.startPage(query)
    const [list, total] = await this.jobService.selectJobList(query);
    return this.getDataTable(list, total)
  }

  @PreAuthorize('hasPermi("monitor:job:export")')
  @Post('export')
  @ApiOperation({ summary: '导出定时任务' })
  @Log({ title: '定时任务', businessType: BusinessType.EXPORT })
  async export(@Res() res, @Body() job: SysJob) {
    const [list] = await this.jobService.selectJobList(job);
    await this.excelUtils.exportExcel(res, list, '定时任务',SysJob);
  }

  @PreAuthorize("hasPermi('monitor:job:query')")
  @Get(':jobId')
  @ApiOperation({ summary: '根据任务编号获取详细信息' })
  async getInfo(@Param('jobId', new DefaultValuePipe(0), ParseIntPipe) jobId: number) {
    return AjaxResult.success(await this.jobService.selectJobById(jobId));
  }

  @PreAuthorize("hasPermi('monitor:job:add')")
  @Post()
  @ApiOperation({ summary: '新增定时任务' })
  @Log({ title: '定时任务', businessType: BusinessType.INSERT })
  async add(@Body() job: SysJob) {
    const loginUser = await this.securityUtils.getLoginUser();
    job.createBy = loginUser.getUsername(); 
    return AjaxResult.success(await this.jobService.insertJob(job));
  }

  @PreAuthorize('hasPermi("monitor:job:edit")')
  @ApiOperation({ summary: '修改定时任务' })
  @Log({ title: '定时任务', businessType: BusinessType.UPDATE })
  @Put()
  async update(@Body() job: SysJob) {
    const loginUser = await this.securityUtils.getLoginUser();
    job.updateBy = loginUser.getUsername();
    return AjaxResult.success(await this.jobService.updateJob(job));
  }

  @PreAuthorize("hasPermi('monitor:job:changeStatus')")
  @Put('changeStatus')
  @ApiOperation({ summary: '状态修改' })
  @Log({ title: '定时任务', businessType: BusinessType.UPDATE })
  async changeStatus(@Body() job: SysJob) {
    const newJob = await this.jobService.selectJobById(job.jobId);
    newJob.status = job.status;
    return AjaxResult.success(await this.jobService.changeStatus(newJob));
  }


  @PreAuthorize('hasPermi("monitor:job:changeStatus")')
  @ApiOperation({ summary: '定时任务立即执行一次' })
  @Log({ title: '定时任务', businessType: BusinessType.UPDATE })
  @Put('run')
  async run(@Body() job: SysJob) {
    const result = await this.jobService.run(job);
    return AjaxResult.success(result ? 'success' : 'error', result ? '执行成功' : '任务不存在或已过期！');
  }

  @PreAuthorize("hasPermi('monitor:job:remove')")
  @Delete(':jobIds')
  @ApiOperation({ summary: '删除定时任务' })
  @Log({ title: '定时任务', businessType: BusinessType.DELETE })
  async remove(@Param('jobIds',new ParseArrayPipe({ items: Number, separator: ',' })) jobIds: number[]) {
    return AjaxResult.success(await this.jobService.deleteJobByIds(jobIds));
  }
}