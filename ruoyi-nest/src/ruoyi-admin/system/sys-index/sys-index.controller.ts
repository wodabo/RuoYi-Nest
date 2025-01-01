import { Controller, Get, Res } from '@nestjs/common';
import { Public } from '~/ruoyi-framework/auth/decorators/public.decorator';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';

@Controller()
export class SysIndexController {
    constructor(private ruoyiConfigService: RuoYiConfigService) {}

    @Public()   
    @Get()
    index(@Res() res) {
        res.send(`欢迎使用${this.ruoyiConfigService.getName()}后台管理框架，当前版本：v${this.ruoyiConfigService.getVersion()}，请通过前端地址访问。`)
    }
}
