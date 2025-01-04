import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysJobLog } from './entities/sys-job-log.entity';
import { SysJobLogService } from './sys-job-log.service';
import { SysJobLogController } from './sys-job-log.controller';
import { SysJobLogRepository } from './repositories/sys-job-log.repository';

const providers = [SysJobLogService, SysJobLogRepository];
@Module({
  imports: [TypeOrmModule.forFeature([SysJobLog])],
  controllers: [SysJobLogController],
  providers,
  exports: [SysJobLogService, SysJobLogRepository],
})
export class SysJobLogModule {}
