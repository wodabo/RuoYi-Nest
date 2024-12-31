import { Injectable } from '@nestjs/common';
import { Repository, DataSource, SelectQueryBuilder, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenTableColumn } from '~/ruoyi-generator/gen-table-column/entities/gen-table-column.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SensitiveUtils } from '~/ruoyi-share/utils/sensitive.utils';
import { DataScopeUtils } from '~/ruoyi-share/utils/data-scope.utils';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';

@Injectable()
export class GenTableColumnRepository {

    constructor(
        @InjectRepository(GenTableColumn)
        private readonly columnRepository: Repository<GenTableColumn>,
        private readonly sqlLoggerUtils: SqlLoggerUtils,    
        private readonly contextHolderUtils: ContextHolderUtils,
        private readonly queryUtils: QueryUtils 
    ) {}



    selectGenTableColumnVo() {
        return this.columnRepository
            .createQueryBuilder('c')
            .select([
                'c.columnId',
                'c.tableId',
                'c.columnName',
                'c.columnComment',
                'c.columnType',
                'c.tsType',
                'c.tsField',
                'c.isPk',
                'c.isIncrement',
                'c.isRequired',
                'c.isInsert',
                'c.isEdit',
                'c.isList',
                'c.isQuery',
                'c.queryType',
                'c.htmlType',
                'c.dictType',
                'c.sort',
                'c.createBy',
                'c.createTime',
                'c.updateBy',
                'c.updateTime'
            ])
    }
 
    async selectGenTableColumnListByTableId(tableId: number): Promise<[GenTableColumn[], number]> {
        const queryBuilder = this.selectGenTableColumnVo()
            .where('c.tableId = :tableId', { tableId })
            .orderBy('c.sort', 'ASC');

        this.sqlLoggerUtils.log(queryBuilder,'selectGenTableColumnListByTableId');
        
        const [rows, total] = await this.queryUtils.executeQuery(queryBuilder);
        
        return [rows, total];
    }

    async selectDbTableColumnsByName(tableName: string): Promise<GenTableColumn[]> {
        const query = `
            SELECT 
                column_name as columnName, 
                CASE WHEN (is_nullable = 'no' && column_key != 'PRI') THEN '1' ELSE '0' END AS isRequired, 
                CASE WHEN column_key = 'PRI' THEN '1' ELSE '0' END AS isPk, 
                ordinal_position AS sort, 
                column_comment as columnComment, 
                CASE WHEN extra = 'auto_increment' THEN '1' ELSE '0' END AS isIncrement, 
                data_type AS columnType 
            FROM information_schema.columns 
            WHERE table_schema = (SELECT database()) 
            AND table_name = ? 
            ORDER BY ordinal_position
        `;
        const params = [tableName];

        this.sqlLoggerUtils.log(null, 'selectDbTableColumnsByName');

        const result = await this.columnRepository.query(query, params);

        const rows = result.map((row: any) => this.columnRepository.create(row));

        return rows;
    }

    async insertGenTableColumn(column: GenTableColumn): Promise<number> {
        const insertObject: any = {
            createTime: new Date()
        };

        if (column.tableId != null && column.tableId != 0) {
            insertObject.tableId = column.tableId;
        }
        if (column.columnName != null && column.columnName != '') {
            insertObject.columnName = column.columnName;
        }
        if (column.columnComment != null && column.columnComment != '') {
            insertObject.columnComment = column.columnComment;
        }
        if (column.columnType != null && column.columnType != '') {
            insertObject.columnType = column.columnType;
        }
        if (column.tsType != null && column.tsType != '') {
            insertObject.tsType = column.tsType;
        }
        if (column.tsField != null && column.tsField != '') {
            insertObject.tsField = column.tsField;
        }
        if (column.isPk != null && column.isPk != '') {
            insertObject.isPk = column.isPk;
        }
        if (column.isIncrement != null && column.isIncrement != '') {
            insertObject.isIncrement = column.isIncrement;
        }
        if (column.isRequired != null && column.isRequired != '') {
            insertObject.isRequired = column.isRequired;
        }
        if (column.isInsert != null && column.isInsert != '') {
            insertObject.isInsert = column.isInsert;
        }
        if (column.isEdit != null && column.isEdit != '') {
            insertObject.isEdit = column.isEdit;
        }
        if (column.isList != null && column.isList != '') {
            insertObject.isList = column.isList;
        }
        if (column.isQuery != null && column.isQuery != '') {
            insertObject.isQuery = column.isQuery;
        }
        if (column.queryType != null && column.queryType != '') {
            insertObject.queryType = column.queryType;
        }
        if (column.htmlType != null && column.htmlType != '') {
            insertObject.htmlType = column.htmlType;
        }
        if (column.dictType != null && column.dictType != '') {
            insertObject.dictType = column.dictType;
        }
        if (column.sort != null) {
            insertObject.sort = column.sort;
        }
        if (column.createBy != null && column.createBy != '') {
            insertObject.createBy = column.createBy;
        }

        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.columnRepository.manager;

        const queryBuilder = entityManager.createQueryBuilder()
            .insert()
            .into(GenTableColumn,Object.keys(insertObject))
            .values(insertObject);

        this.sqlLoggerUtils.log(queryBuilder, 'insertGenTableColumn');

        const result = await queryBuilder.execute();
        return result.raw.insertId;
    }

    async updateGenTableColumn(column: GenTableColumn): Promise<number> {
        const updateData: any = {
            updateTime: new Date()
        };
        if (column.columnComment != null) {
            updateData.columnComment = column.columnComment;
        }
        if (column.tsType != null) {
            updateData.tsType = column.tsType;
        }
        if (column.tsField != null) {
            updateData.tsField = column.tsField;
        }
        if (column.isInsert != null) {
            updateData.isInsert = column.isInsert;
        }
        if (column.isEdit != null) {
            updateData.isEdit = column.isEdit;
        }
        if (column.isList != null) {
            updateData.isList = column.isList;
        }
        if (column.isQuery != null) {
            updateData.isQuery = column.isQuery;
        }
        if (column.isRequired != null) {
            updateData.isRequired = column.isRequired;
        }
        if (column.queryType != null) {
            updateData.queryType = column.queryType;
        }
        if (column.htmlType != null) {
            updateData.htmlType = column.htmlType;
        }
        if (column.dictType != null) {
            updateData.dictType = column.dictType;
        }
        if (column.sort != null) {
            updateData.sort = column.sort;
        }
        if (column.updateBy != null) {
            updateData.updateBy = column.updateBy;
        }

        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.columnRepository.manager;

        const result = await entityManager.update(GenTableColumn, column.columnId, updateData);
        return result.affected;
    }

    async deleteGenTableColumnByIds(tableIds: number[]): Promise<number> {
        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.columnRepository.manager;
        const queryBuilder = entityManager.createQueryBuilder('c')
            .delete()
            .from(GenTableColumn)
            .where('c.tableId IN (:tableIds)')
            .setParameter('tableIds', tableIds);

        this.sqlLoggerUtils.log(queryBuilder, 'deleteGenTableColumnByIds');

        const result = await queryBuilder.execute();
        return result.affected;
    }

    async deleteGenTableColumns(columns: GenTableColumn[]): Promise<number> {
        const queryBuilder = this.columnRepository.createQueryBuilder('c')
            .delete()
            .from(GenTableColumn)
            .where('c.columnId IN (:columnIds)')
            .setParameter('columnIds', columns.map(column => column.columnId));

        this.sqlLoggerUtils.log(queryBuilder, 'deleteGenTableColumns');

        const result = await queryBuilder.execute();
        return result.affected;
    }
}
