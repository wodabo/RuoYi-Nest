import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';

@Entity('sys_dict_data')
export class SysDictData extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'dict_code',
    comment: '字典编码',
  })
  dictCode: number;

  @Column({
    name: 'dict_sort',
    type: 'int',
    comment: '字典排序',
  })
  dictSort: number;

  @Column({
    name: 'dict_label',
    length: 100,
    comment: '字典标签',
  })
  dictLabel: string;

  @Column({
    name: 'dict_value',
    length: 100,
    comment: '字典键值',
  })
  dictValue: string;

  @Column({
    name: 'dict_type',
    length: 100,
    comment: '字典类型',
  })
  dictType: string;

  @Column({
    name: 'css_class',
    length: 100,
    nullable: true,
    comment: '样式属性（其他样式扩展）',
  })
  cssClass: string;

  @Column({
    name: 'list_class',
    length: 100,
    nullable: true,
    comment: '表格字典样式',
  })
  listClass: string;

  @Column({
    name: 'is_default',
    length: 1,
    comment: '是否默认（Y是 N否）',
  })
  isDefault: string;

  @Column({
    name: 'status',
    length: 1,
    comment: '状态（0正常 1停用）',
  })
  status: string;
}
