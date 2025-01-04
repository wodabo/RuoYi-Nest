import { Injectable } from '@nestjs/common';
import { SysLogininforRepository } from './repositories/sys-logininfor.repository';
import { SysLogininfor } from './entities/sys-logininfor.entity';

@Injectable()
export class SysLogininforService {
  constructor(private readonly logininforRepository: SysLogininforRepository) {}

  async insertLogininfor(logininfor: SysLogininfor): Promise<void> {
    await this.logininforRepository.insertLogininfor(logininfor);
  }

  async selectLogininforList(
    query: SysLogininfor,
  ): Promise<[SysLogininfor[], number]> {
    return this.logininforRepository.selectLogininforList(query);
  }

  async deleteLogininforByIds(infoIds: number[]): Promise<number> {
    return this.logininforRepository.deleteLogininforByIds(infoIds);
  }

  async cleanLogininfor(): Promise<void> {
    await this.logininforRepository.cleanLogininfor();
  }
}
