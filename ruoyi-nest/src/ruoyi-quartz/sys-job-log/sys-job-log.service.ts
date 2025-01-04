import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { SysJobLog } from '~/ruoyi-quartz/sys-job-log/entities/sys-job-log.entity';
import { SysJobLogRepository } from '~/ruoyi-quartz/sys-job-log/repositories/sys-job-log.repository';

@Injectable()
export class SysJobLogService {
  private readonly logger = new Logger(SysJobLogService.name);

  constructor(private readonly jobLogRepository: SysJobLogRepository) {}

  async selectJobLogList(jobLog: SysJobLog): Promise<[SysJobLog[], number]> {
    return this.jobLogRepository.selectJobLogList(jobLog);
  }

  async selectJobLogById(jobLogId: number): Promise<SysJobLog> {
    return this.jobLogRepository.selectJobLogById(jobLogId);
  }

  async addJobLog(jobLog: SysJobLog): Promise<void> {
    await this.jobLogRepository.insertJobLog(jobLog);
  }

  async deleteJobLogByIds(logIds: number[]): Promise<void> {
    await this.jobLogRepository.deleteJobLogByIds(logIds);
  }

  async deleteJobLogById(jobId: number): Promise<void> {
    await this.jobLogRepository.deleteJobLogById(jobId);
  }

  async cleanJobLog(): Promise<void> {
    await this.jobLogRepository.cleanJobLog();
  }
}
