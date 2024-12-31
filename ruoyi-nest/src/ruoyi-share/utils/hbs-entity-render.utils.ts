import { GenTableEntityUtils } from "./gen-table-entity.utils"
import { StringUtils } from "./string.utils"


export class HbsEntityRenderUtils { 

    public static renderHeader(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        const tableNameWithMiddleLine = context.tableName.replace(/_/g, '-')
        return `
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { ColumnType, Excel, ExcelType } from '~/ruoyi-share/annotation/Excel';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
${
GenTableEntityUtils.isCrud(context.table) ? `import { BaseEntity } from '~/ruoyi-share/entities/base.entity';` : `import { TreeEntity } from '~/ruoyi-share/entities/tree.entity';`
}


/**
 * ${context.functionName}对象 ${tableNameWithMiddleLine}
 * 文件路径 ${tableNameWithMiddleLine}/entities/${tableNameWithMiddleLine}.entity.ts
 * 
 * @author ${context.author}
 * @date ${context.datetime}
 */
        `
    }
    public static renderClass(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        const tableNameWithMiddleLine = context.tableName.replace(/_/g, '-')
        const BaseEntity = GenTableEntityUtils.isCrud(context.table) ? 'BaseEntity' : 'TreeEntity'
        return `
    @Entity('${context.tableName}')
    export class ${context.ClassName} extends ${BaseEntity} {
        /** ${context.pkColumn.columnComment} */
        @PrimaryGeneratedColumn('increment', {        
            name: '${context.pkColumn.tsField.replace(/([A-Z])/g, '_$1').toLowerCase()}',
            comment: '${context.pkColumn.columnComment}',
        })
        @Excel({
            name: "${context.pkColumn.columnComment}", 
            type: ExcelType.EXPORT, 
            cellType: ColumnType.NUMERIC, 
            prompt: "${context.pkColumn.columnComment}"
        })
        @ApiPropertyOptional({ description: '${context.pkColumn.columnComment}' })
        @IsOptional()
        ${context.pkColumn.tsField}: ${context.pkColumn.tsType};

        ${
            context.columns
            .filter(column => !GenTableEntityUtils.isSuperColumn(column, context.tsField))
            .filter(column => column.tsField !== context.pkColumn.tsField)
            .map(column => {
                return `
        /** ${column.columnComment} */        
        @Column({ 
            name: '${column.tsField.replace(/([A-Z])/g, '_$1').toLowerCase()}',
            comment: '${column.columnComment}' 
        })
        @Excel({
            name: "${column.columnComment}"
        })
        @ApiPropertyOptional({ description: "${column.columnComment}" })
        @IsOptional()
        @IsString()
        ${column.tsField}: ${column.tsType};            
                `
            }).join('\n')
        }
    }
        `
    }

}