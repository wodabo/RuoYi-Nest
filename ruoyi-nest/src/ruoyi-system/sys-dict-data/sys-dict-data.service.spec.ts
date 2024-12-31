import { Test, TestingModule } from '@nestjs/testing';
import { SysDictDataService } from './sys-dict-data.service';

describe('SysDictDataService', () => {
  let service: SysDictDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SysDictDataService],
    }).compile();

    service = module.get<SysDictDataService>(SysDictDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
