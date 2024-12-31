import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysLogininforService } from './sys-logininfor.service';
import { SysLogininfor } from './entities/sys-logininfor.entity';
import { SysLogininforRepository } from './repositories/sys-logininfor.repository';
import { RedisModule } from '~/ruoyi-share/redis/redis.module';

const providers = [SysLogininforService, SysLogininforRepository];

@Module({
  imports: [
    TypeOrmModule.forFeature([SysLogininfor]),
    RedisModule
  ],
  controllers: [],
  providers,
  exports: [SysLogininforService,SysLogininforRepository]
})
export class SysLogininforModule {}
