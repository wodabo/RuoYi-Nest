import { Injectable } from '@nestjs/common';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenTable } from '~/ruoyi-generator/gen-table/entities/gen-table.entity';
import { GenTableColumn } from '~/ruoyi-generator/gen-table-column/entities/gen-table-column.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';
import { plainToClass, plainToInstance } from 'class-transformer';

@Injectable()
export class GenTableRepository {

    constructor(
        @InjectRepository(GenTable)
        private readonly tableRepository: Repository<GenTable>,
        private readonly queryUtils: QueryUtils,
        private readonly sqlLoggerUtils: SqlLoggerUtils,    
        private readonly contextHolderUtils: ContextHolderUtils,
        private readonly dataSource: DataSource, 
    ) {}



    selectGenTableVo() {
        return this.tableRepository
            .createQueryBuilder('t')
            .select([
                't.tableId',
                't.tableName',
                't.tableComment',
                't.subTableName',
                't.subTableFkName',
                't.className',
                't.tplCategory',
                't.tplWebType',
                't.packageName',
                't.moduleName',
                't.businessName',
                't.functionName',
                't.functionAuthor',
                't.genType',
                't.genPath',
                't.options',
                't.createBy',
                't.createTime',
                't.updateBy',
                't.updateTime',
                't.remark'
            ])
    }
 
    async selectGenTableList(table: GenTable): Promise<[GenTable[],number]> {
        const queryBuilder = this.selectGenTableVo()

        if (table.tableName) {
            queryBuilder.andWhere('lower(t.tableName) LIKE lower(:tableName)', { tableName: `%${table.tableName}%` });
        }

        if (table.tableComment) {
            queryBuilder.andWhere('lower(t.tableComment) LIKE lower(:tableComment)', { tableComment: `%${table.tableComment}%` });
        }

        if (table.params?.beginTime && table.params?.endTime) {
            queryBuilder.andWhere('date_format(t.createTime,\'%Y%m%d\') BETWEEN date_format(:beginTime,\'%Y%m%d\') AND date_format(:endTime,\'%Y%m%d\')', { beginTime: table.params.beginTime, endTime: table.params.endTime });
        }

        this.sqlLoggerUtils.log(queryBuilder,'selectGenTableList');
        
        const [rows, len] = await this.queryUtils.executeQuery(queryBuilder, table);
        return [rows, len];
    }

    async selectDbTableList(table: GenTable): Promise<[GenTable[], number]> {
        const dataSource = this.dataSource;
        const params = [];
        let query = `
            SELECT 
                ist.table_name as tableName, 
                ist.table_comment as tableComment, 
                ist.create_time as createTime, 
                ist.update_time as updateTime 
            FROM information_schema.tables ist 
            WHERE ist.table_schema = (SELECT database()) 
            AND ist.table_name NOT LIKE 'qrtz_%' 
            AND ist.table_name NOT LIKE 'gen_%' 
            AND ist.table_name NOT IN (SELECT t.table_name FROM gen_table t)
        `;
        
        if (table.tableName) {
            query += ` AND lower(ist.table_name) LIKE lower(?)`;
            params.push(`%${table.tableName}%`);
        }
        
        if (table.tableComment) {
            query += ` AND lower(ist.table_comment) LIKE lower(?)`;
            params.push(`%${table.tableComment}%`);
        }
        
        if (table.params?.beginTime) {
            query += ` AND date_format(ist.create_time,'%Y%m%d') >= date_format(?,'%Y%m%d')`;
            params.push(table.params.beginTime);
        }
        
        if (table.params?.endTime) {
            query += ` AND date_format(ist.create_time,'%Y%m%d') <= date_format(?,'%Y%m%d')`;
            params.push(table.params.endTime);
        }
        
        query += ` ORDER BY ist.create_time DESC`;

        this.sqlLoggerUtils.log(null, 'selectDbTableList');

        const result = await dataSource.query(query, params);
   
        const rows = result.map(row => this.tableRepository.create(row));
        const total = rows.length;
        return [rows, total];
    }

    async selectDbTableListByNames(tableNames: string[]): Promise<GenTable[]> {
        const dataSource = this.dataSource;
        const params = [];
        let query = `
            SELECT 
                ist.table_name as tableName, 
                ist.table_comment as tableComment, 
                ist.create_time as createTime, 
                ist.update_time as updateTime 
            FROM information_schema.tables ist 
            WHERE ist.table_schema = (SELECT database()) 
            AND ist.table_name NOT LIKE 'qrtz_%' 
            AND ist.table_name NOT LIKE 'gen_%' 
            AND ist.table_name NOT IN (SELECT t.table_name FROM gen_table t)
            AND ist.table_name IN (${tableNames.map((_, index) => `?`).join(', ')})
        `;

        tableNames.forEach((tableName) => {
            params.push(tableName);
        });


        const result = await dataSource.query(query, params);

        this.sqlLoggerUtils.log(null, `selectDbTableListByNames`);

   
        const rows = result.map(row => this.tableRepository.create(row));
        return rows;
    }

    async selectGenTableByName(tableName: string): Promise<GenTable> {
        const queryBuilder = this.tableRepository.createQueryBuilder('t')
            .leftJoinAndMapMany('t.columns', 'gen_table_column', 'column', 't.tableId = column.tableId')
            .where('t.tableName = :tableName', { tableName })
            .orderBy('column.sort', 'ASC');

        this.sqlLoggerUtils.log(queryBuilder, 'selectGenTableByName');

        return queryBuilder.getOne();  
    }

    async selectGenTableById(tableId: number): Promise<GenTable> {
        const queryBuilder = this.tableRepository.createQueryBuilder('t')
            .select([
                't.tableId', 
                't.tableName', 
                't.tableComment', 
                't.subTableName', 
                't.subTableFkName', 
                't.className', 
                't.tplCategory', 
                't.tplWebType', 
                't.packageName', 
                't.moduleName', 
                't.businessName', 
                't.functionName', 
                't.functionAuthor', 
                't.genType', 
                't.genPath', 
                't.options', 
                't.remark',
                'c.columnId', 
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
                'c.sort'
            ])
            .leftJoinAndMapMany('t.columns', 'gen_table_column', 'c', 't.tableId = c.tableId') 
            .where('t.tableId = :tableId', { tableId })
            .orderBy('c.sort', 'ASC');

        this.sqlLoggerUtils.log(queryBuilder, 'selectGenTableById');
        
        const result = await queryBuilder.getOne();
    
        // 显式触发转换
        return plainToInstance(GenTable, result, {
            enableImplicitConversion: true
        });
    }
    async deleteGenTableById(tableId: number): Promise<number> {
        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.tableRepository.manager;

        const queryBuilder = entityManager.createQueryBuilder()
            .delete()
            .from(GenTable)
            .where('tableId = :tableId', { tableId });

        this.sqlLoggerUtils.log(queryBuilder, 'deleteGenTableById');

        const result = await queryBuilder.execute();
        return result.affected;
    }

    async deleteGenTableByIds(tableIds: number[]): Promise<number> {
        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.tableRepository.manager;
        const queryBuilder = entityManager.createQueryBuilder()
            .delete()
            .from(GenTable)
            .whereInIds(tableIds);

        this.sqlLoggerUtils.log(queryBuilder, 'deleteGenTableByIds');

        const result = await queryBuilder.execute();
        return result.affected;
    }

    async updateGenTable(table: GenTable): Promise<number> {
        const updateData: any = {
            updateTime: new Date()
        };
        if (table.tableName != null && table.tableName != '') {
            updateData.tableName = table.tableName;
        }
        if (table.tableComment != null && table.tableComment != '') {
            updateData.tableComment = table.tableComment;
        }
        if (table.subTableName != null && table.subTableName != '') {
            updateData.subTableName = table.subTableName;
        }
        if (table.subTableFkName != null && table.subTableFkName != '') {
            updateData.subTableFkName = table.subTableFkName;
        }
        if (table.className != null && table.className != '') {
            updateData.className = table.className;
        }
        if (table.functionAuthor != null && table.functionAuthor != '') {
            updateData.functionAuthor = table.functionAuthor;
        }
        if (table.genType != null && table.genType != '') {
            updateData.genType = table.genType;
        }
        if (table.genPath != null && table.genPath != '') {
            updateData.genPath = table.genPath;
        }
        if (table.tplCategory != null && table.tplCategory != '') {
            updateData.tplCategory = table.tplCategory;
        }
        if (table.tplWebType != null && table.tplWebType != '') {
            updateData.tplWebType = table.tplWebType;
        }
        if (table.packageName != null && table.packageName != '') {
            updateData.packageName = table.packageName;
        }
        if (table.moduleName != null && table.moduleName != '') {
            updateData.moduleName = table.moduleName;
        }
        if (table.businessName != null && table.businessName != '') {
            updateData.businessName = table.businessName;
        }
        if (table.functionName != null && table.functionName != '') {
            updateData.functionName = table.functionName;
        }
        if (table.options != null && table.options != '') {
            updateData.options = table.options;
        }
        if (table.updateBy != null && table.updateBy != '') {
            updateData.updateBy = table.updateBy;
        }
        if (table.remark != null) {
            updateData.remark = table.remark;
        }

        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.tableRepository.manager;

        const result = await entityManager.update(GenTable, table.tableId, updateData);
        return result.affected;
    }

    async insertGenTable(table: GenTable): Promise<number> {
        const insertObject: any = {
            createTime: new Date()
        };

        if (table.tableName != null && table.tableName != '') {
            insertObject.tableName = table.tableName;
        }
        if (table.tableComment != null && table.tableComment != '') {
            insertObject.tableComment = table.tableComment;
        }
        if (table.className != null && table.className != '') {
            insertObject.className = table.className;
        }
        if (table.tplCategory != null && table.tplCategory != '') {
            insertObject.tplCategory = table.tplCategory;
        }
        if (table.tplWebType != null && table.tplWebType != '') {
            insertObject.tplWebType = table.tplWebType;
        }
        if (table.packageName != null && table.packageName != '') {
            insertObject.packageName = table.packageName;
        }
        if (table.moduleName != null && table.moduleName != '') {
            insertObject.moduleName = table.moduleName;
        }
        if (table.businessName != null && table.businessName != '') {
            insertObject.businessName = table.businessName;
        }
        if (table.functionName != null && table.functionName != '') {
            insertObject.functionName = table.functionName;
        }
        if (table.functionAuthor != null && table.functionAuthor != '') {
            insertObject.functionAuthor = table.functionAuthor;
        }
        if (table.genType != null && table.genType != '') {
            insertObject.genType = table.genType;
        }
        if (table.genPath != null && table.genPath != '') {
            insertObject.genPath = table.genPath;
        }
        if (table.remark != null && table.remark != '') {
            insertObject.remark = table.remark;
        }
        if (table.createBy != null && table.createBy != '') {
            insertObject.createBy = table.createBy;
        }

        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.tableRepository.manager;

        const queryBuilder = entityManager.createQueryBuilder()
            .insert()
            .into(GenTable,Object.keys(insertObject))
            .values(insertObject);

        this.sqlLoggerUtils.log(queryBuilder, 'insertGenTable');

        const result = await queryBuilder.execute();

        table.tableId = result.raw.insertId;
        return result.raw.insertId;
    }
    async selectGenTableAll(): Promise<GenTable[]> {
        const queryBuilder = this.tableRepository.createQueryBuilder('t')
            .select('t.tableId, t.tableName, t.tableComment, t.subTableName, t.subTableFkName, t.className, t.tplCategory, t.tplWebType, t.packageName, t.moduleName, t.businessName, t.functionName, t.functionAuthor, t.options, t.remark, c.columnId, c.columnName, c.columnComment, c.columnType, c.tsType, c.tsField, c.isPk, c.isIncrement, c.isRequired, c.isInsert, c.isEdit, c.isList, c.isQuery, c.queryType, c.htmlType, c.dictType, c.sort')
            .leftJoinAndMapMany('t.columns', 'gen_table_column', 'c', 't.tableId = c.tableId')
            .orderBy('c.sort', 'ASC');

        this.sqlLoggerUtils.log(queryBuilder, 'selectGenTableAll');
        
        const rows = await queryBuilder.getMany();
        return rows;
    }
}
