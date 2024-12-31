import { StringUtils } from "./string.utils"


export class HbsRepositoryRenderUtils {

    public static renderHeader(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        const tableNameWithMiddleLine = context.tableName.replace(/_/g, '-')
        return `
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ${context.ClassName} } from '~/${context.packageName}/${tableNameWithMiddleLine}/entities/${tableNameWithMiddleLine}.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';

/**
 * ${context.functionName}Repository接口
 * 文件路径 ${tableNameWithMiddleLine}/repositories/${tableNameWithMiddleLine}.repository.ts
 * 
 * @author ${context.author}
 * @date ${context.datetime}
 *
 */
        `
    }

    public static renderConstructor(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        return `
    constructor(
        @InjectRepository(${context.ClassName})
        private readonly ${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository: Repository<${context.ClassName}>,
        private readonly queryUtils: QueryUtils,
        private readonly sqlLoggerUtils: SqlLoggerUtils
    ) {}
        `
    }

    public static renderSelectVo(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        const indent = ' '.repeat(16);  // 16个空格的缩进     
        return `
    private select${ClassNameWithoutSysPrefix}Vo(): SelectQueryBuilder<${context.ClassName}> {
        return this.${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository.createQueryBuilder('${alias}')
            .select([
                ${
                    context.columns.map((column,index) => {
                        if(index === 0){
                            return `'${alias}.${column.tsField}'`
                        }
                        return `${indent}'${alias}.${column.tsField}'`
                    }).join(',\n')
                }       
            ])
    }
        `
    }

    public static renderSelectById(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        return `
    /**
     * 查询${context.ClassName}信息
     */
    async select${ClassNameWithoutSysPrefix}ById(${context.pkColumn.tsField}: number): Promise<${context.ClassName}> {
        const queryBuilder = this.select${ClassNameWithoutSysPrefix}Vo()
            .where('${alias}.${context.pkColumn.tsField} = :${context.pkColumn.tsField}', { ${context.pkColumn.tsField} });

        this.sqlLoggerUtils.log(queryBuilder, 'select${ClassNameWithoutSysPrefix}ById');
        return queryBuilder.getOne();
    }
        `
    }

    public static renderSelectList(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        return `
    /**
     * 查询${context.ClassName}列表
     */
    async select${ClassNameWithoutSysPrefix}List(query: ${context.ClassName}): Promise<[${context.ClassName}[], number]> {
        const queryBuilder = this.select${ClassNameWithoutSysPrefix}Vo();
        ${
            context.columns.map(column => {
                let andWhereStatement = ''
                if(column.queryType === 'LIKE'){
                    andWhereStatement = `queryBuilder.andWhere('${alias}.${column.tsField} LIKE :${column.tsField}Like', { ${column.tsField}Like: '%' + query.${column.tsField} + '%' });`
                }else{
                    andWhereStatement = `queryBuilder.andWhere('${alias}.${column.tsField} = :${column.tsField}', { ${column.tsField}: query.${column.tsField} });`
                }
                return `
        if (query.${column.tsField}) {
            ${andWhereStatement}
        }
                `
            }).join('\n')
        }

        this.sqlLoggerUtils.log(queryBuilder, 'select${ClassNameWithoutSysPrefix}List');
        return this.queryUtils.executeQuery(queryBuilder, query);
    }
        `
    }

    public static renderInsert(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        return `
    /**
     * 新增${context.className}
     */
    async insert${ClassNameWithoutSysPrefix}(${context.className}: ${context.ClassName}): Promise<number> {
        const insertObj: any = {};
        ${
        context.columns.map(column => {
            let condition = `${context.className}.${column.tsField} != null`

            if(column.tsType === 'number'){
                condition = `${context.className}.${column.tsField} != null && ${context.className}.${column.tsField} != ${column.tsType === 'number' ? '0' : "''"}`
            }else if(column.tsType === 'string'){
                condition = `${context.className}.${column.tsField} != null && ${context.className}.${column.tsField} != ${column.tsType === 'number' ? '0' : "''"}`
            } 
            
            return `
        if (${condition}) {
            insertObj.${column.tsField} = ${context.className}.${column.tsField};
        }`
        }).join('\n')
        }
        const queryBuilder = this.${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository.createQueryBuilder()
            .insert()
            .into(${context.ClassName},Object.keys(insertObj))
            .values(insertObj);

        this.sqlLoggerUtils.log(queryBuilder, 'insert${ClassNameWithoutSysPrefix}');
        const result = await queryBuilder.execute();
        return result.identifiers[0].${context.pkColumn.tsField}
    }
        `
    }

    public static renderUpdate(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        return `
    /**
     * 修改${context.className}
     */
    async update${ClassNameWithoutSysPrefix}(${context.className}: ${context.ClassName}): Promise<boolean> {
        const updateData: any = {};
        ${
            context.columns.map(column => {
                let condition = `${context.className}.${column.tsField} != null`

                if(column.tsType === 'number'){
                    condition = `${context.className}.${column.tsField} != null && ${context.className}.${column.tsField} != ${column.tsType === 'number' ? '0' : "''"}`
                }else if(column.tsType === 'string'){
                    condition = `${context.className}.${column.tsField} != null && ${context.className}.${column.tsField} != ${column.tsType === 'number' ? '0' : "''"}`
                } 
                
            return `
        if (${condition}) {
            updateData.${column.tsField} = ${context.className}.${column.tsField};
        }`
        }).join('\n')
        }
        const queryBuilder = this.${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository.createQueryBuilder()
            .update(${context.ClassName})
            .set(updateData)
            .where('${context.pkColumn.tsField} = :${context.pkColumn.tsField}', { ${context.pkColumn.tsField}: ${context.className}.${context.pkColumn.tsField} });

        this.sqlLoggerUtils.log(queryBuilder, 'update${ClassNameWithoutSysPrefix}');
        const result = await queryBuilder.execute();
        return result.affected > 0;
    }
        `
    }

    public static renderDeleteByIds(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        return `
    /**
     * 删除${context.ClassName}信息
     */
    async delete${ClassNameWithoutSysPrefix}ByIds(${context.pkColumn.tsField}s: number[]): Promise<boolean> {
        const queryBuilder = this.${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository.createQueryBuilder()
            .delete()
            .from(${context.ClassName})
            .whereInIds(${context.pkColumn.tsField}s);

        this.sqlLoggerUtils.log(queryBuilder, 'delete${ClassNameWithoutSysPrefix}ByIds');
        const result = await queryBuilder.execute();
        return result.affected > 0;
    }
        `
        
    }
}