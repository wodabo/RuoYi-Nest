import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysConfigService } from './sys-config.service';
import { SysConfig } from './entities/sys-config.entity';
import { SysConfigRepository } from './repositories/sys-config.repository';
import { RedisModule } from '~/ruoyi-share/redis/redis.module';

const providers = [SysConfigService, SysConfigRepository];

@Module({
  imports: [TypeOrmModule.forFeature([SysConfig]), RedisModule],
  controllers: [],
  providers,
  exports: [SysConfigService, SysConfigRepository],
})
export class SysConfigModule {}
