
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysLogininforModule } from '~/ruoyi-system/sys-logininfor/sys-logininfor.module';
import { SysOperlogModule } from '~/ruoyi-system/sys-operlog/sys-operlog.module';
import { SysUserOnlineModule } from '~/ruoyi-system/sys-user-online/sys-user-online.module';
import { SysLogininforController } from '~/ruoyi-admin/monitor/sys-logininfor/sys-logininfor.controller';
import { SysOperlogController } from '~/ruoyi-admin/monitor/sys-operlog/sys-operlog.controller';
import { SysUserOnlineController } from '~/ruoyi-admin/monitor/sys-user-online/sys-user-online.controller';

import { RedisModule } from '~/ruoyi-share/redis/redis.module';
import { ServerController } from '~/ruoyi-admin/monitor/server/server.controller';
import { CacheController } from '~/ruoyi-admin/monitor/cache/cache.controller';


const providers = [];

@Module({
  imports: [
    SysLogininforModule,
    SysOperlogModule,
    SysUserOnlineModule,
    RedisModule
  ],
  controllers: [SysLogininforController, SysOperlogController,SysUserOnlineController,ServerController,CacheController],
  providers,
  exports: []
})
export class MonitorModule {}
