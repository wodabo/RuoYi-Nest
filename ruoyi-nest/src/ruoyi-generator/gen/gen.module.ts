import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenTable } from '../gen-table/entities/gen-table.entity';
import { GenController} from './gen.controller';

import { GenTableModule } from '../gen-table/gen-table.module';
import { GenTableColumnModule } from '../gen-table-column/gen-table-column.module';


const providers = [];
@Module({
  imports: [
    GenTableModule,
    GenTableColumnModule,
  ],
  controllers: [GenController],
  providers,
  exports: []
})
export class GenModule {}
