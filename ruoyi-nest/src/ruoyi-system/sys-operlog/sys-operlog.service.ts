import { Injectable } from '@nestjs/common';
import { SysOperlogRepository } from './repositories/sys-operlog.repository';
import { SysOperlog } from './entities/sys-operlog.entity';

@Injectable()
export class SysOperlogService {
  constructor(
    private readonly operLogRepository: SysOperlogRepository,
  ) {}

  async insertOperlog(operLog: SysOperlog): Promise<void> {
    await this.operLogRepository.insertOperlog(operLog);
  }

  async selectOperLogList(operLog: SysOperlog): Promise<[SysOperlog[], number]> {
    return this.operLogRepository.selectOperLogList(operLog);
  }

  async deleteOperLogByIds(operIds: number[]): Promise<number> {
    return this.operLogRepository.deleteOperLogByIds(operIds);
  }

  async selectOperLogById(operId: number): Promise<SysOperlog> {
    return this.operLogRepository.selectOperLogById(operId);
  }

  async cleanOperLog(): Promise<void> {
    await this.operLogRepository.cleanOperLog();
  }
}
