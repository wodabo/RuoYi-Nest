import { Controller, Get, Body, Param, Query, Res, Request, UseGuards, UseInterceptors, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, PartialType } from '@nestjs/swagger';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
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
import { PasswordUtils } from '~/ruoyi-share/utils/password.utils';
import { Server } from '~/ruoyi-share/model/server';

@ApiTags('服务器监控')
@Controller('monitor/server')
export class ServerController extends BaseController {
  constructor(
    private readonly excelUtils: ExcelUtils,
    private readonly passwordUtils: PasswordUtils
  ) {
    super();
  }

  @ApiOperation({ summary: '获取服务器信息' })
  @PreAuthorize('hasPermi("monitor:server:list")')
  @Get()
  async getInfo(@Request() req) {
    const server = new Server();
    await server.copyTo();
    return this.success(server);
  }
}
