import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysUserOnlineService } from '~/ruoyi-system/sys-user-online/sys-user-online.service';

const providers = [SysUserOnlineService];
@Module({
  imports: [],
  controllers: [],
  providers,
  exports: [SysUserOnlineService],
})
export class SysUserOnlineModule {}
