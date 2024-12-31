import { Module } from '@nestjs/common';
import { GenConfigService } from './gen-config.service';


const providers = [GenConfigService];
@Module({
  imports: [
  ],
  controllers: [],
  providers,
  exports: [GenConfigService]
})
export class GenConfigModule {}
