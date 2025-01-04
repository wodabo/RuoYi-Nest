import { Module } from '@nestjs/common';
import { SysShareController } from '~/ruoyi-admin/share/sys-share/sys-share.controller';
import { SysConfigService } from '~/ruoyi-system/sys-config/sys-config.service';
import { RedisModule } from '~/ruoyi-share/redis/redis.module';
import { SysConfigModule } from '~/ruoyi-system/sys-config/sys-config.module';

const providers = [SysConfigService];

@Module({
  imports: [RedisModule, SysConfigModule],
  controllers: [SysShareController],
  providers,
  exports: [],
})
export class ShareModule {}
