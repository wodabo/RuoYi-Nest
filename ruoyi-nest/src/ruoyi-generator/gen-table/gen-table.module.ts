import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenTable } from './entities/gen-table.entity';
import { GenTableService } from './gen-table.service';
import { GenTableRepository } from './repositories/gen-table.repository';

import { GenTableColumnModule } from '../gen-table-column/gen-table-column.module';

import { GenConfigModule } from '~/ruoyi-generator/gen-config/gen-config.module';



const providers = [GenTableService, GenTableRepository];
@Module({
  imports: [
    TypeOrmModule.forFeature([GenTable]),
    GenTableColumnModule,
    GenConfigModule,
  ],
  controllers: [],
  providers,
  exports: [GenTableService, GenTableRepository]
})
export class GenTableModule {}
