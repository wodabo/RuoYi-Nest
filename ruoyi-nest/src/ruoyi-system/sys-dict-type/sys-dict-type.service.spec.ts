import { Test, TestingModule } from '@nestjs/testing';
import { SysDictTypeService } from './sys-dict-type.service';

describe('SysDictTypeService', () => {
  let service: SysDictTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SysDictTypeService],
    }).compile();

    service = module.get<SysDictTypeService>(SysDictTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
