import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysDictDataService } from './sys-dict-data.service';
import { SysDictData } from './entities/sys-dict-data.entity';
import { SysDictDataRepository } from './repositories/sys-dict-data.repository';

const providers = [SysDictDataService, SysDictDataRepository];

@Module({
  imports: [TypeOrmModule.forFeature([SysDictData])],
  controllers: [],
  providers,
  exports: [SysDictDataService, SysDictDataRepository],
})
export class SysDictDataModule {}
