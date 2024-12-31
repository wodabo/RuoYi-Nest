import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysNoticeService } from './sys-notice.service';
import { SysNotice } from './entities/sys-notice.entity';
import { SysNoticeRepository } from './repositories/sys-notice.repository';

const providers = [SysNoticeService, SysNoticeRepository];

@Module({
  imports: [
    TypeOrmModule.forFeature([SysNotice])
  ],
  controllers: [],
  providers,
  exports: [SysNoticeService]
})
export class SysNoticeModule {}
