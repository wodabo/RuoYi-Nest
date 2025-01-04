import { Controller, Get, Res } from '@nestjs/common';
import { Public } from '~/ruoyi-framework/auth/decorators/public.decorator';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';

@Controller()
export class SysIndexController {
  constructor(private ruoyiConfigService: RuoYiConfigService) {}

  @Public()
  @Get()
  index(@Res() res) {
    res.send(``);
  }
}
