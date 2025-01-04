import { Module, Global } from '@nestjs/common';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';
import { TokenConfigService } from '~/ruoyi-share/config/token-config.service';
const providers = [RuoYiConfigService, TokenConfigService];

@Global()
@Module({
  imports: [],
  controllers: [],
  providers,
  exports: [RuoYiConfigService, TokenConfigService],
})
export class ShareConfigModule {}
