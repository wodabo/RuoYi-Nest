import { Injectable } from '@nestjs/common';
import { SysNoticeRepository } from './repositories/sys-notice.repository';
import { SysNotice } from './entities/sys-notice.entity';

@Injectable()
export class SysNoticeService {
  constructor(
    private readonly noticeRepository: SysNoticeRepository,
  ) {}

  async selectNoticeById(noticeId: number): Promise<SysNotice> {
    return this.noticeRepository.selectNoticeById(noticeId);
  }

  async selectNoticeList(query: SysNotice): Promise<[SysNotice[], number]> {  
    return this.noticeRepository.selectNoticeList(query);
  }

  async insertNotice(notice: SysNotice): Promise<SysNotice> {  
    return this.noticeRepository.insertNotice(notice);
  }

  async updateNotice(notice: SysNotice): Promise<boolean> {
    return this.noticeRepository.updateNotice(notice);
  }

  async deleteNoticeById(noticeId: number): Promise<boolean> {
    return this.noticeRepository.deleteNoticeById(noticeId);
  }

  async deleteNoticeByIds(noticeIds: number[]): Promise<boolean> {
    return this.noticeRepository.deleteNoticeByIds(noticeIds);
  }
}
