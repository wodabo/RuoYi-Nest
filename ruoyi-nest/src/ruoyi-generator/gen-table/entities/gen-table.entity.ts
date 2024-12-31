import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { IsNotEmpty } from 'class-validator';
import { GenTableColumn } from '~/ruoyi-generator/gen-table-column/entities/gen-table-column.entity';
import { Expose, Transform } from 'class-transformer';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { GenConstants } from '~/ruoyi-share/constant/GenConstants';
// 表结构
// 完整内容
// table_id
// 编号
// table_name
// 表名称
// table_comment
// 表描述
// sub_table_name
// 关联子表的表名
// sub_table_fk_name
// 子表关联的外键名
// class_name
// 实体类名称
// tpl_category
// 使用的模板（crud单表操作 tree树表操作）
// tpl_web_type
// 前端模板类型（element-ui模版 element-plus模版）
// package_name
// 生成包路径
// module_name
// 生成模块名
// business_name
// 生成业务名
// function_name
// 生成功能名
// function_author
// 生成功能作者
// gen_type
// 生成代码方式（0zip压缩包 1自定义路径）
// gen_path
// 生成路径（不填默认项目路径）
// options
@Entity('gen_table')
export class GenTable extends BaseEntity {
    /** 编号 */ 
    @PrimaryGeneratedColumn({
        name: 'table_id',
        comment: '编号'
    })
    tableId: number;

    /** 表名称 */
    @Column({
        name: 'table_name',
        length: 100,
        comment: '表名称'
    })
    @IsNotEmpty({ message: '表名称不能为空' })
    tableName: string;

    /** 表描述 */
    @Column({
        name: 'table_comment',
        length: 100,
        comment: '表描述'
    })
    @IsNotEmpty({ message: '表描述不能为空' })
    tableComment: string;

    /** 关联父表的表名 */
    @Column({
        name: 'sub_table_name',
        length: 100,
        nullable: true,
        comment: '关联父表的表名'
    })
    subTableName: string;

    /** 本表关联父表的外键名 */
    @Column({
        name: 'sub_table_fk_name',
        length: 100,
        nullable: true,
        comment: '本表关联父表的外键名'
    })
    subTableFkName: string;

    /** 实体类名称(首字母大写) */
    @Column({
        name: 'class_name',
        length: 100,
        comment: '实体类名称(首字母大写)'
    })
    @IsNotEmpty({ message: '实体类名称不能为空' })
    className: string;

    /** 使用的模板 */
    @Column({
        name: 'tpl_category',
        length: 100,
        comment: '使用的模板（crud单表操作 tree树表操作 sub主子表操作）'
    })
    tplCategory: string;

    /** 前端类型（element-ui模版 element-plus模版） */
    @Column({
        name: 'tpl_web_type',
        length: 100,
        comment: '前端类型（element-ui模版 element-plus模版）'
    })
    tplWebType: string;

    /** 生成包路径 */
    @Column({
        name: 'package_name',
        length: 100,
        comment: '生成包路径'
    })
    @IsNotEmpty({ message: '生成包路径不能为空' })
    packageName: string;

    /** 生成模块名 */
    @Column({
        name: 'module_name',
        length: 100,
        comment: '生成模块名'
    })
    @IsNotEmpty({ message: '生成模块名不能为空' })
    moduleName: string;

    /** 生成业务名 */
    @Column({
        name: 'business_name',
        length: 100,
        comment: '生成业务名'
    })
    @IsNotEmpty({ message: '生成业务名不能为空' })
    businessName: string;

    /** 生成功能名 */
    @Column({
        name: 'function_name',
        length: 100,
        comment: '生成功能名'
    })
    @IsNotEmpty({ message: '生成功能名不能为空' })
    functionName: string;

    /** 生成作者 */
    @Column({
        name: 'function_author',
        length: 100,
        comment: '生成作者'
    })
    @IsNotEmpty({ message: '作者不能为空' })
    functionAuthor: string;

    /** 生成代码方式 */
    @Column({
        name: 'gen_type',
        length: 1,
        comment: '生成代码方式（0zip压缩包 1自定义路径）'
    })
    genType: string;

    /** 生成路径 */
    @Column({
        name: 'gen_path',
        length: 200,
        nullable: true,
        comment: '生成路径（不填默认项目路径）'
    })
    genPath: string;

    /** 主键信息 */
    // @Column({ name: 'pk_column' })
    pkColumn: GenTableColumn;

    /** 子表信息 */
    subTable: GenTable;

    /** 表列信息 */
    columns: GenTableColumn[];

    /** 其它生成选项 */
    @Column({
        name: 'options',
        type: 'text',
        nullable: true,
        comment: '其它生成选项'
    })
    options: string;

    /** 树编码字段 */
    treeCode: string;

    /** 树父编码字段 */
    treeParentCode: string;

    /** 树名称字段 */
    treeName: string;

    /** 上级菜单ID字段 */
    parentMenuId: number;

    /** 上级菜单名称字段 */
    parentMenuName: string;
}