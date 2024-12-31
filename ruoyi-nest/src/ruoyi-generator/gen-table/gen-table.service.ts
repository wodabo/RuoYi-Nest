import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { GenTable } from './entities/gen-table.entity';
import { GenTableRepository } from './repositories/gen-table.repository';
import { GenConstants } from '~/ruoyi-share/constant/GenConstants';
import { Transactional } from '~/ruoyi-share/annotation/Transactional';
import { GenTableColumnRepository } from '../gen-table-column/repositories/gen-table-column.repository';
import { GenUtils } from '~/ruoyi-share/utils/gen.utils';
import { GenConfigService } from '../gen-config/gen-config.service';
import { Constants } from '~/ruoyi-share/constant/Constants';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';
import { HbsUtils } from '~/ruoyi-share/utils/hbs.utils';
import { GenTableEntityUtils } from '~/ruoyi-share/utils/gen-table-entity.utils';
import { GenTableColumnEntityUtils } from '~/ruoyi-share/utils/gen-table-column-entity.utils';
import { FileUtils } from '~/ruoyi-share/utils/file.utils';
import { FileUploadUtils } from '~/ruoyi-share/utils/file-upload.utils';

/**
 * GenTableService 是一个服务类，负责处理与系统表相关的所有操作。
 * 它负责管理系统表的生命周期，包括创建、更新、删除和执行。
 * 该服务还提供了检查表结构的有效性和管理表模式的方法。
 */
@Injectable()
export class GenTableService {
    private readonly logger = new Logger(GenTableService.name);

    constructor(
        private readonly genTableRepository: GenTableRepository,
        private readonly genTableColumnRepository: GenTableColumnRepository,
        private readonly genUtils: GenUtils,   
        private readonly contextHolderUtils: ContextHolderUtils,
        private readonly dataSource: DataSource,
        private readonly hbsUtils: HbsUtils,
        private readonly fileUtils: FileUtils,
        private readonly fileUploadUtils: FileUploadUtils
    ) {}

    /**
     * 通过ID选择一个系统表。
     * 
     * @param id 要选择的表的ID。
     * @returns 选择的系统表。
     */
    async selectGenTableById(id: number): Promise<GenTable> {
        const genTable = await this.genTableRepository.selectGenTableById(id);
        this.setTableFromOptions(genTable);
        return genTable;
    }

   

    /**
     * 根据提供的表对象选择系统表的列表。
     * 
     * @param genTable 要按照其过滤的表对象。
     * @returns 一个解析为系统表数组的承诺。
     */
    async selectGenTableList(genTable: GenTable): Promise<[GenTable[], number]> {
        return this.genTableRepository.selectGenTableList(genTable);
    }

    /**
     * 根据提供的表对象选择数据库表的列表。
     * 
     * @param genTable 要按照其过滤的表对象。
     * @returns 一个解析为数据库表数组的承诺。
     */
    async selectDbTableList(genTable: GenTable): Promise<[GenTable[], number]> {
        return this.genTableRepository.selectDbTableList(genTable);
    }

    /**
     * 根据表的名称选择数据库表的列表。
     * 
     * @param tableNames 要选择的表的名称。
     * @returns 一个解析为数据库表数组的承诺。
     */
    async selectDbTableListByNames(tableNames: string[]): Promise<GenTable[]> {
        return this.genTableRepository.selectDbTableListByNames(tableNames);
    }

    /**
     * 选择所有系统表。
     * 
     * @returns 一个解析为所有系统表数组的承诺。
     */
    async selectGenTableAll(): Promise<GenTable[]> {
        return this.genTableRepository.selectGenTableAll();
    }

    /**
     * 更新一个系统表。
     * 
     * @param genTable 要更新的表。
     */
    @Transactional()
    async updateGenTable(genTable: GenTable): Promise<void> {
        const options = JSON.stringify(genTable.params);
        genTable.options = options;
        await this.genTableRepository.updateGenTable(genTable);
        for (const column of genTable.columns) {
            await this.genTableColumnRepository.updateGenTableColumn(column);
        }
    }

    /**
     * 通过ID删除系统表。
     * 
     * @param tableIds 要删除的表的ID。
     */
    @Transactional()
    async deleteGenTableByIds(tableIds: number[]): Promise<void> {
        await this.genTableRepository.deleteGenTableByIds(tableIds);
        await this.genTableColumnRepository.deleteGenTableColumnByIds(tableIds);
    }

    /**
     * 导入表结构。
     * 
     * @param tableList 要导入的表的列表。
     * @param operName 操作者的名称。
     */
    @Transactional()
    async importGenTable(tableList: GenTable[], operName: string): Promise<void> {
        for (const table of tableList) {
            const tableName = table.tableName;  
            this.genUtils.initTable(table, operName);
            await this.genTableRepository.insertGenTable(table);
            const genTableColumns = await this.genTableColumnRepository.selectDbTableColumnsByName(tableName);
            for (const column of genTableColumns) {
                this.genUtils.initColumnField(column, table);
                await this.genTableColumnRepository.insertGenTableColumn(column);
            }
        }
    }

    /**
     * 预览表的代码。
     * 
     * @param tableId 要预览的表的ID。
     * @returns 一个模板名称到其渲染代码的映射。
     */
    /**
     * 预览表的代码。
     * 
     * @param tableId 要预览的表的ID。
     * @returns 一个模板名称到其渲染代码的映射。
     */
    async previewCode(tableId: number): Promise<Map<string, string>> {
        // 创建一个映射，用于存储每个模板的渲染代码。
        const dataMap = new Map<string, string>();
        
        // 查询表信息。
        const table = await this.genTableRepository.selectGenTableById(tableId);

        // 设置主表和子表的信息。
        this.setSubTable(table);
        
        // 设置主键列的信息。
        this.setPkColumn(table);
        
        // 初始化Velocity模板引擎。
        // 为表准备Velocity上下文。
        const context = this.hbsUtils.prepareContext(table);
        
        // 获取要渲染的模板列表。
        const templates = this.hbsUtils.getTemplateList(table.tplCategory, table.tplWebType);
        
        // 渲染每个模板，并将渲染的代码存储在映射中。
        for (const template of templates) {
            const renderedCode = await this.hbsUtils.renderFile(template, context);
            dataMap.set(template, renderedCode);
        }
        
        // 返回渲染代码的映射。
        return dataMap;
    }

    /**
     * 生成表的代码并下载。
     * 
     * @param tableName 要生成代码的表的名称。
     * @returns 生成的代码作为字节数组。
     */
    async downloadCode(tableNames: string[]): Promise<Buffer> {
        let result = []
        for (const tableName of tableNames) {
            const fileList = await this.generatorCode(tableName,true);
            result = result.concat(fileList)
        }
        return this.fileUtils.fileListToZip(result)
    }

    /**
     * 生成表的代码并保存到自定义路径。
     * 
     * @param tableName 要生成代码的表的名称。
     */
    async generatorCode(tableName: string,isDownload?:boolean): Promise<Array<{path: string, content: string}>> {
        const table = await this.genTableRepository.selectGenTableByName(tableName);
        
        this.genUtils.initTable(table, '');

        
        // 创建一个映射，用于存储每个模板的渲染代码。

        // 查询表信息。
        // 设置主表和子表的信息。
        this.setSubTable(table);
        
        // 设置主键列的信息。
        this.setPkColumn(table);
        
        // 初始化Velocity模板引擎。
        // 为表准备Velocity上下文。
        const context = this.hbsUtils.prepareContext(table);
        
        // 获取要渲染的模板列表。
        const templates = this.hbsUtils.getTemplateList(table.tplCategory, table.tplWebType);
        
        const fileList = []
        // 渲染每个模板，并将渲染的代码存储在映射中。
        for (const template of templates) {
            const renderedCode = await this.hbsUtils.renderFile(template, context);

            const fileName = template.slice(template.lastIndexOf('/') + 1,template.lastIndexOf('.'))


            // 小驼峰转成中划线且小写

            if(fileName.endsWith('.ts')){
                
                let folderName = ''

                if(fileName.endsWith('entity.ts')){
                    folderName = 'entities/'
                }

                if(fileName.endsWith('repository.ts')){
                    folderName = 'repositories/'
                }
                const className = table.className.replace(/([A-Z])/g, '-$1').toLowerCase();
                const path = `${className}/${folderName}${className}.${fileName}`
                
                fileList.push({path: path, content: renderedCode})
            }else{
           

                let prefix = ''
                const extension = fileName.slice(fileName.lastIndexOf('.'))

                let path = ''


                if(fileName === 'sql'){
                    path = `${table.businessName}Menu.sql`
                }else{
                    if(fileName === 'index.vue'){
                        path = `views/${table.moduleName}/${table.businessName}/index${extension}`
                    }else if(fileName === 'api.js'){
                        path = `api/${table.moduleName}/${table.businessName}${extension}`
                    }
                }

                fileList.push({path: path, content: renderedCode})
            }

        
       
        }

        if(isDownload){
            return fileList
        }

        const {resolve} = require('path')
        const fs = require('fs')
        // 写文件到指定路径
        for (const file of fileList) {
          // 获取绝对路径文件
     

            if(file.path.endsWith('.ts')){
                const fileName = file.path.slice(file.path.lastIndexOf('/') + 1)
                const path  = file.path.slice(0,file.path.lastIndexOf('/'))
                
                const className = table.className.replace(/([A-Z])/g, '-$1').toLowerCase();


                if(file.path.endsWith('controller.ts')){
                    const controllerPath = resolve(process.cwd(),'src/','ruoyi-admin',table.moduleName,className)

                    const absPath = await this.fileUploadUtils.getAbsoluteFile(controllerPath, fileName);

                    const writeStream = fs.createWriteStream(absPath);
                    writeStream.write(file.content);
                    writeStream.end();
                }else{
                    const otherPath = resolve(process.cwd(),'src/',table.packageName,path)
                    const absPath = await this.fileUploadUtils.getAbsoluteFile(otherPath, fileName);
                    const writeStream = fs.createWriteStream(absPath);
                    writeStream.write(file.content);
                    writeStream.end();
                }
            }

        }
    }

    /**
     * 与数据库同步表。
     * 
     * @param tableName 要同步的表的名称。
     */
    @Transactional()
    async synchDb(tableName: string): Promise<void> {
        const table = await this.genTableRepository.selectGenTableByName(tableName);
        const tableColumns = table.columns;
        const tableColumnMap = tableColumns.reduce((map, obj) => (map[obj.columnName] = obj, map), {});
        const dbTableColumns = await this.genTableColumnRepository.selectDbTableColumnsByName(tableName);
        if (!dbTableColumns) {
            throw new ServiceException("Failed to synchronize data, original table structure does not exist");
        }
        const dbTableColumnNames = dbTableColumns.map(column => column.columnName);
        for (const column of dbTableColumns) {
            this.genUtils.initColumnField(column, table);
            if (tableColumnMap.hasOwnProperty(column.columnName)) {
                const prevColumn = tableColumnMap[column.columnName];
                column.columnId = prevColumn.columnId;
                if (GenTableColumnEntityUtils.isList(prevColumn)) {    
                    column.dictType = prevColumn.dictType;
                    column.queryType = prevColumn.queryType;
                }
                if (GenTableColumnEntityUtils.isRequired(prevColumn) && !GenTableColumnEntityUtils.isPk(column)
                        && (GenTableColumnEntityUtils.isInsert(prevColumn) || GenTableColumnEntityUtils.isEdit(prevColumn))
                        && (GenTableColumnEntityUtils.isUsableColumn(prevColumn) || !GenTableColumnEntityUtils.isSuperColumn(prevColumn))) {
                    column.isRequired = prevColumn.isRequired;
                    column.htmlType = prevColumn.htmlType;
                }
                await this.genTableColumnRepository.updateGenTableColumn(column);
            } else {
                await this.genTableColumnRepository.insertGenTableColumn(column);
            }
        }
        const delColumns = tableColumns.filter(column => !dbTableColumnNames.includes(column.columnName));
        if (delColumns) {
            await this.genTableColumnRepository.deleteGenTableColumns(delColumns);
        }
    }

    /**
     * 批量生成表的代码并下载。
     * 
     * @param tableNames 要生成代码的表的名称。
     * @returns 生成的代码作为字节数组。
     */
    // async downloadCode(tableNames: string[]): Promise<Buffer> {
    //     const outputStream = new ByteArrayOutputStream();
    //     const zip = new ZipOutputStream(outputStream);
    //     for (const tableName of tableNames) {
    //         await this.generatorCode(tableName, zip);
    //     }
    //     IOUtils.closeQuietly(zip);
    //     return outputStream.toByteArray();
    // }

    /**
     * 验证表的编辑。
     * 
     * @param genTable 要验证的表。
     */
    async validateEdit(genTable: GenTable): Promise<void> {
        if (GenConstants.TPL_TREE === genTable.tplCategory) {
            const paramsObj = JSON.parse(genTable.options);
            if (!paramsObj[GenConstants.TREE_CODE]) {
                throw new ServiceException("Tree code field cannot be empty");
            } else if (!paramsObj[GenConstants.TREE_PARENT_CODE]) {
                throw new ServiceException("Tree parent code field cannot be empty");
            } else if (!paramsObj[GenConstants.TREE_NAME]) {
                throw new ServiceException("Tree name field cannot be empty");
            } else if (GenConstants.TPL_SUB === genTable.tplCategory) {
                if (!genTable.subTableName) {
                    throw new ServiceException("Sub table name cannot be empty");
                } else if (!genTable.subTableFkName) {
                    throw new ServiceException("Sub table foreign key name cannot be empty");
                }
            }
        }
    }

    /**
     * 设置表的主键列。
     * 
     * @param table 要为其设置主键列的表。
     */
    public async setPkColumn(table: GenTable): Promise<void> {
        for (const column of table.columns) {
            if (GenTableColumnEntityUtils.isPk(column)) {  
                table.pkColumn = column;
                break;
            }
        }
        if (!table.pkColumn) {
            table.pkColumn = table.columns[0];
        }
        if (GenConstants.TPL_SUB === table.tplCategory) {
            for (const column of table.subTable.columns) {
                if (GenTableColumnEntityUtils.isPk(column)) {
                    table.subTable.pkColumn = column;
                    break;
                }
            }
            if (!table.subTable.pkColumn) {
                table.subTable.pkColumn = table.subTable.columns[0];
            }
        }
    }

    /**
     * 设置表的子表。
     * 
     * @param table 要为其设置子表的表。
     */
    public async setSubTable(table: GenTable): Promise<void> {
        const subTableName = table.subTableName;
        if (subTableName) {
            table.subTable = await this.genTableRepository.selectGenTableByName(subTableName);
        }
    }

    /**
     * 设置代码生成其他选项的值。
     * 
     * @param genTable 要设置的生成对象。
     */
    public async setTableFromOptions(genTable: GenTable): Promise<void> {
        const paramsObj = JSON.parse(genTable.options);
        if (paramsObj) {
            const treeCode = paramsObj[GenConstants.TREE_CODE];   
            const treeParentCode = paramsObj[GenConstants.TREE_PARENT_CODE];
            const treeName = paramsObj[GenConstants.TREE_NAME];
            const parentMenuId = paramsObj[GenConstants.PARENT_MENU_ID];
            const parentMenuName = paramsObj[GenConstants.PARENT_MENU_NAME];

            genTable.treeCode = treeCode;
            genTable.treeParentCode = treeParentCode;
            genTable.treeName = treeName;
            genTable.parentMenuId = parentMenuId;
            genTable.parentMenuName = parentMenuName;
        }
    }

 
    /**
     * 获取代码生成路径。
     * 
     * @param table 业务表信息。
     * @param template 模板文件路径。
     * @return 生成路径。
     */
    // public static getGenPath(table: GenTable, template: string): string {
    //     let genPath = table.genPath;
    //     if (genPath === "/") {             
    //         return System.getProperty("user.dir") + File.separator + "src" + File.separator + VelocityUtils.getFileName(template, table);
    //     }
    //     return genPath + File.separator + VelocityUtils.getFileName(template, table);
    // }
}