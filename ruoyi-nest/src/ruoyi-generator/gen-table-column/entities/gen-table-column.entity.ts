import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { Expose, Transform, Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { GenConstants } from '~/ruoyi-share/constant/GenConstants';

@Entity('gen_table_column')
export class GenTableColumn extends BaseEntity {
  /** 编号 */
  @PrimaryGeneratedColumn({
    name: 'column_id',
    comment: '编号',
  })
  columnId: number;

  /** 归属表编号 */
  @Column({
    name: 'table_id',
    comment: '归属表编号',
  })
  tableId: number;

  /** 列名称 */
  @Column({
    name: 'column_name',
    length: 100,
    comment: '列名称',
  })
  columnName: string;

  /** 列描述 */
  @Column({
    name: 'column_comment',
    length: 100,
    comment: '列描述',
  })
  columnComment: string;

  /** 列类型 */
  @Column({
    name: 'column_type',
    length: 100,
    comment: '列类型',
  })
  columnType: string;

  /** TypeScript类型 */
  @Column({
    name: 'ts_type',
    length: 100,
    comment: 'TypeScript类型',
  })
  tsType: string;

  /** TypeScript字段名 */
  @Column({
    name: 'ts_field',
    length: 100,
    comment: 'TypeScript字段名',
  })
  @IsNotEmpty({ message: 'TypeScript属性不能为空' })
  tsField: string;

  /** 是否主键（1是） */
  @Column({
    name: 'is_pk',
    length: 1,
    comment: '是否主键（1是）',
  })
  isPk: string;

  /** 是否自增（1是） */
  @Column({
    name: 'is_increment',
    length: 1,
    comment: '是否自增（1是）',
  })
  isIncrement: string;

  /** 是否必填（1是） */
  @Column({
    name: 'is_required',
    length: 1,
    comment: '是否必填（1是）',
  })
  isRequired: string;

  /** 是否为插入字段（1是） */
  @Column({
    name: 'is_insert',
    length: 1,
    comment: '是否为插入字段（1是）',
  })
  isInsert: string;

  /** 是否编辑字段（1是） */
  @Column({
    name: 'is_edit',
    length: 1,
    comment: '是否编辑字段（1是）',
  })
  isEdit: string;

  /** 是否列表字段（1是） */
  @Column({
    name: 'is_list',
    length: 1,
    comment: '是否列表字段（1是）',
  })
  isList: string;

  /** 是否查询字段（1是） */
  @Column({
    name: 'is_query',
    length: 1,
    comment: '是否查询字段（1是）',
  })
  isQuery: string;

  /** 查询方式 */
  @Column({
    name: 'query_type',
    length: 100,
    comment:
      '查询方式（EQ等于、NE不等于、GT大于、LT小于、LIKE模糊、BETWEEN范围）',
  })
  queryType: string;

  /** 显示类型 */
  @Column({
    name: 'html_type',
    length: 100,
    comment:
      '显示类型（input文本框、textarea文本域、select下拉框、checkbox复选框、radio单选框、datetime日期控件、image图片上传控件、upload文件上传控件、editor富文本控件）',
  })
  htmlType: string;

  /** 字典类型 */
  @Column({
    name: 'dict_type',
    length: 100,
    comment: '字典类型',
  })
  dictType: string;

  /** 排序 */
  @Column({
    name: 'sort',
    comment: '排序',
  })
  sort: number;

  /** 首字母大写的TypeScript字段名 */
  @Expose()
  @Transform(({ obj }) => {
    return obj.tsField ? StringUtils.capitalize(obj.tsField) : null;
  })
  captsField: string;

  @Column({
    name: 'remark',
    comment: '备注',
    select: false, // 这里设置为 false，使其在查询时默认不被选中
  })
  override remark: string;
}
