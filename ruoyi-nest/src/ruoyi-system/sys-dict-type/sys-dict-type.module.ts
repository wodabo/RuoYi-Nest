import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysDictTypeService } from './sys-dict-type.service';
import { SysDictType } from './entities/sys-dict-type.entity';
import { SysDictTypeRepository } from './repositories/sys-dict-type.repository';
import { SysDictDataModule } from '~/ruoyi-system/sys-dict-data/sys-dict-data.module';

const providers = [SysDictTypeService, SysDictTypeRepository];

@Module({
  imports: [TypeOrmModule.forFeature([SysDictType]), SysDictDataModule],
  controllers: [],
  providers,
  exports: [SysDictTypeService],
})
export class SysDictTypeModule {}
