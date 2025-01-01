import { Controller, Get, Post, Put, Delete, Body, Param, Query, Res, Request, UseGuards, UseInterceptors, ParseIntPipe, DefaultValuePipe, ParseArrayPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, PartialType } from '@nestjs/swagger';
import { SysConfigService } from '~/ruoyi-system/sys-config/sys-config.service';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { SysConfig } from '~/ruoyi-system/sys-config/entities/sys-config.entity';
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


@ApiTags('参数配置')
@Controller('system/config')
export class SysConfigController extends BaseController {
  constructor(
    private readonly configService: SysConfigService,
    private readonly excelUtils: ExcelUtils,
    private readonly fileUploadUtils: FileUploadUtils,
    private readonly mimeTypeUtils: MimeTypeUtils,
    private readonly ruoyiConfigService: RuoYiConfigService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly securityUtils: SecurityUtils,
  ) {
    super();
  }

  @ApiOperation({ summary: '获取参数配置列表' })
  @PreAuthorize('hasPermi("system:config:list")')
  @Get('list')
  async list(@Query() query: SysConfig, @Request() req) {
    this.startPage(query);
    const [list, total] = await this.configService.selectConfigList(query);
    return this.getDataTable(list, total);
  }

  @ApiOperation({ summary: '刷新参数缓存' })
  @PreAuthorize('hasPermi("system:config:remove")')
  @Log({ title: '参数管理', businessType: BusinessType.CLEAN })
  @Delete('refreshCache')
  async refreshCache() {
    await this.configService.resetConfigCache();
    return this.success();
  }

  @ApiOperation({ summary: '导出参数配置' })
  @PreAuthorize('hasPermi("system:config:export")')
  @Log({ title: '参数管理', businessType: BusinessType.EXPORT })
  @Post('export')
  async export(@Res() res, @Body() config: SysConfig, @Request() req) {
    const [list] = await this.configService.selectConfigList(config);
    await this.excelUtils.exportExcel(res, list, '参数数据', SysConfig);
  }

  @ApiOperation({ summary: '根据参数编号获取详细信息' })
  @PreAuthorize('hasPermi("system:config:query")')
  @Get(':configId')
  async getInfo(@Param('configId', ParseIntPipe) configId: number) {
    const config = await this.configService.selectConfigById(configId);
    return this.success(config);
  }

  @ApiOperation({ summary: '根据参数键名查询参数值' })
  @Get('configKey/:configKey')
  async getConfigKey(@Param('configKey') configKey: string) {
    const value = await this.configService.selectConfigByKey(configKey);
    return this.success(null, value);
  }

  @ApiOperation({ summary: '新增参数配置' })
  @PreAuthorize('hasPermi("system:config:add")')
  @Log({ title: '参数管理', businessType: BusinessType.INSERT })
  @Post()
  async add(@Body() config: SysConfig, @Request() req) {
    if (!await this.configService.checkConfigKeyUnique(config)) {
      return this.error(`新增参数'${config.configName}'失败，参数键名已存在`);
    }
    config.createBy = req.user.username;
    const result = await this.configService.insertConfig(config);
    return this.toAjax(result);
  }

  @ApiOperation({ summary: '修改参数配置' })
  @PreAuthorize('hasPermi("system:config:edit")')
  @Log({ title: '参数管理', businessType: BusinessType.UPDATE })
  @Put()
  async edit(@Body() config: SysConfig, @Request() req) {
    if (!await this.configService.checkConfigKeyUnique(config)) {
      return this.error(`修改参数'${config.configName}'失败，参数键名已存在`);
    }
    config.updateBy = req.user.username;
    const result = await this.configService.updateConfig(config.configId, config);
    return this.toAjax(result);
  }

  @ApiOperation({ summary: '删除参数配置' })
  @PreAuthorize('hasPermi("system:config:remove")')
  @Log({ title: '参数管理', businessType: BusinessType.DELETE })
  @Delete(':configIds')
  async remove(@Param('configIds',new ParseArrayPipe({ items: Number, separator: ',' })) configIds: number[]) {
    await this.configService.deleteConfigByIds(configIds);
    return this.success();
  }


}
