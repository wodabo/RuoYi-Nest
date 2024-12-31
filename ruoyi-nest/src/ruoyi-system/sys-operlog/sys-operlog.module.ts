import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysOperlogService } from './sys-operlog.service'; 
import { SysOperlog } from './entities/sys-operlog.entity';
import { SysOperlogRepository } from './repositories/sys-operlog.repository';
import { RedisModule } from '~/ruoyi-share/redis/redis.module';

const providers = [SysOperlogService, SysOperlogRepository];

@Module({
  imports: [
    TypeOrmModule.forFeature([SysOperlog]),
    RedisModule
  ],
  controllers: [],
  providers,
  exports: [SysOperlogService,SysOperlogRepository]
})
export class SysOperlogModule {}
