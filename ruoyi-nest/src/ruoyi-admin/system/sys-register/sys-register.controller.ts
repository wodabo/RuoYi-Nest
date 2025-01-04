import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  PartialType,
} from '@nestjs/swagger';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { RegisterBodyDto } from '~/ruoyi-share/dto/register-body.dto';
import { SysConfigService } from '~/ruoyi-system/sys-config/sys-config.service';
import { SysRegisterService } from '~/ruoyi-admin/system/sys-register/sys-register.service';

@ApiTags('注册验证')
@Controller('register')
export class SysRegisterController extends BaseController {
  constructor(
    private readonly registerService: SysRegisterService,
    private readonly configService: SysConfigService,
  ) {
    super();
  }

  @ApiOperation({ summary: '用户注册' })
  @Post()
  async register(@Body() user: RegisterBodyDto) {
    if (
      !(
        'true' ===
        (await this.configService.selectConfigByKey('sys.account.registerUser'))
      )
    ) {
      return this.error('当前系统没有开启注册功能！');
    }
    const msg = await this.registerService.register(user);
    return !msg ? this.success() : this.error(msg);
  }
}
