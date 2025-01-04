import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysJob } from './entities/sys-job.entity';
import { SysJobController } from './sys-job.controller';
import { SysJobService } from './sys-job.service';
import { SysJobRepository } from './repositories/sys-job.repository';

const providers = [SysJobService, SysJobRepository];
@Module({
  imports: [TypeOrmModule.forFeature([SysJob])],
  controllers: [SysJobController],
  providers,
  exports: [SysJobService, SysJobRepository],
})
export class SysJobModule {}
