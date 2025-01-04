import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterLoad,
  JoinTable,
  ManyToMany,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { Expose, Transform } from 'class-transformer';
import { ColumnType, Excel, ExcelType } from '~/ruoyi-share/annotation/Excel';
import { Excels } from '~/ruoyi-share/annotation/Excels';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as dayjs from 'dayjs';

@Entity('sys_dict_type')
export class SysDictType extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'dict_id',
    comment: '字典主键',
  })
  @Excel({
    name: '字典主键',
    type: ExcelType.EXPORT,
    cellType: ColumnType.NUMERIC,
    prompt: '字典编号',
  })
  @ApiPropertyOptional({ description: '字典ID' })
  @IsOptional()
  dictId: number;

  @Column({
    name: 'dict_name',
    length: 100,
    comment: '字典名称',
  })
  @Excel({
    name: '字典名称',
  })
  @ApiPropertyOptional({ description: '字典名称' })
  @IsOptional()
  @IsString()
  dictName: string;

  @Column({
    name: 'dict_type',
    length: 100,
    comment: '字典类型',
  })
  @Excel({
    name: '字典类型',
  })
  @ApiPropertyOptional({ description: '字典类型' })
  @IsOptional()
  @IsString()
  dictType: string;

  @Column({
    name: 'status',
    length: 1,
    comment: '状态（0正常 1停用）',
  })
  @Excel({
    name: '状态',
    readConverterExp: '0=正常,1=停用',
  })
  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status: string;

  @Column({
    name: 'remark',
    comment: '备注',
  })
  remark: string;
}
