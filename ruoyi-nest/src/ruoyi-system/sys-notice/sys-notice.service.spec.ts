import { Test, TestingModule } from '@nestjs/testing';
import { SysNoticeService } from './sys-notice.service';

describe('SysNoticeService', () => {
  let service: SysNoticeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SysNoticeService],
    }).compile();

    service = module.get<SysNoticeService>(SysNoticeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
