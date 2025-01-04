import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { GenTableColumn } from './entities/gen-table-column.entity';
import { GenTableColumnRepository } from './repositories/gen-table-column.repository';

/**
 * GenTableColumnService is a service class that handles all operations related to generator table columns.
 * It is responsible for managing the lifecycle of generator table columns, including creation, update, deletion, and selection.
 */
@Injectable()
export class GenTableColumnService {
  private readonly logger = new Logger(GenTableColumnService.name);

  constructor(
    private readonly genTableColumnRepository: GenTableColumnRepository,
  ) {}

  /**
   * Selects a list of generator table columns by table ID.
   *
   * @param tableId The ID of the table to select columns for.
   * @returns A promise that resolves to an array of generator table columns.
   */
  async selectGenTableColumnListByTableId(
    tableId: number,
  ): Promise<[GenTableColumn[], number]> {
    return this.genTableColumnRepository.selectGenTableColumnListByTableId(
      tableId,
    );
  }

  /**
   * Inserts a new generator table column.
   *
   * @param genTableColumn The column to insert.
   * @returns A promise that resolves to the number of rows affected.
   */
  async insertGenTableColumn(genTableColumn: GenTableColumn): Promise<number> {
    return this.genTableColumnRepository.insertGenTableColumn(genTableColumn);
  }

  /**
   * Updates a generator table column.
   *
   * @param genTableColumn The column to update.
   * @returns A promise that resolves to the number of rows affected.
   */
  async updateGenTableColumn(genTableColumn: GenTableColumn): Promise<number> {
    return this.genTableColumnRepository.updateGenTableColumn(genTableColumn);
  }

  /**
   * Deletes generator table columns by their IDs.
   *
   * @param ids The IDs of the columns to delete.
   * @returns A promise that resolves to the number of rows affected.
   */
  async deleteGenTableColumnByIds(ids: number[]): Promise<number> {
    return this.genTableColumnRepository.deleteGenTableColumnByIds(ids);
  }
}
