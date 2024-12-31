import { Module } from '@nestjs/common';
import { SysJobModule } from './sys-job/sys-job.module';
import { SysJobLogModule } from './sys-job-log/sys-job-log.module';

@Module({
  imports: [SysJobModule, SysJobLogModule]
})
export class RuoYiQuartzModule {}
