import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenTableColumn } from './entities/gen-table-column.entity';
import { GenTableColumnService } from './gen-table-column.service';
import { GenTableColumnRepository } from './repositories/gen-table-column.repository';

const providers = [GenTableColumnService, GenTableColumnRepository];
@Module({
  imports: [TypeOrmModule.forFeature([GenTableColumn])],
  controllers: [],
  providers,
  exports: [GenTableColumnService, GenTableColumnRepository],
})
export class GenTableColumnModule {}
