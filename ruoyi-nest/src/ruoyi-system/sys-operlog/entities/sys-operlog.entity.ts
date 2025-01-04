import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Excel, ColumnType } from '~/ruoyi-share/annotation/Excel';
import * as dayjs from 'dayjs';

@Entity('sys_oper_log')
export class SysOperlog extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'oper_id',
    comment: '日志主键',
  })
  @Excel({
    name: '操作序号',
    cellType: ColumnType.NUMERIC,
  })
  @ApiPropertyOptional({ description: '日志主键' })
  @IsOptional()
  @IsNumber()
  operId?: number;

  @Column({
    name: 'title',
    length: 50,
    comment: '操作模块',
  })
  @Excel({
    name: '操作模块',
  })
  @ApiPropertyOptional({ description: '操作模块' })
  @IsOptional()
  @IsString()
  title?: string;

  @Column({
    name: 'business_type',
    type: 'int',
    comment: '业务类型（0其它 1新增 2修改 3删除）',
  })
  @Excel({
    name: '业务类型',
    readConverterExp:
      '0=其它,1=新增,2=修改,3=删除,4=授权,5=导出,6=导入,7=强退,8=生成代码,9=清空数据',
  })
  @ApiPropertyOptional({ description: '业务类型（0其它 1新增 2修改 3删除）' })
  @IsOptional()
  @IsNumber()
  businessType?: number;

  businessTypes: number[];

  @Column({
    name: 'method',
    length: 100,
    comment: '请求方法',
  })
  @Excel({
    name: '请求方法',
  })
  @ApiPropertyOptional({ description: '请求方法' })
  @IsOptional()
  @IsString()
  method?: string;

  @Column({
    name: 'request_method',
    length: 10,
    comment: '请求方式',
  })
  @Excel({
    name: '请求方式',
  })
  @ApiPropertyOptional({ description: '请求方式' })
  @IsOptional()
  @IsString()
  requestMethod?: string;

  @Column({
    name: 'operator_type',
    type: 'int',
    comment: '操作类别（0其它 1后台用户 2手机端用户）',
  })
  @Excel({
    name: '操作类别',
    readConverterExp: '0=其它,1=后台用户,2=手机端用户',
  })
  @ApiPropertyOptional({
    description: '操作类别（0其它 1后台用户 2手机端用户）',
  })
  @IsOptional()
  @IsNumber()
  operatorType?: number;

  @Column({
    name: 'oper_name',
    length: 50,
    comment: '操作人员',
  })
  @Excel({
    name: '操作人员',
  })
  @ApiPropertyOptional({ description: '操作人员' })
  @IsOptional()
  @IsString()
  operName?: string;

  @Column({
    name: 'dept_name',
    length: 50,
    comment: '部门名称',
  })
  @Excel({
    name: '部门名称',
  })
  @ApiPropertyOptional({ description: '部门名称' })
  @IsOptional()
  @IsString()
  deptName?: string;

  @Column({
    name: 'oper_url',
    length: 255,
    comment: '请求url',
  })
  @Excel({
    name: '请求地址',
  })
  @ApiPropertyOptional({ description: '请求url' })
  @IsOptional()
  @IsString()
  operUrl?: string;

  @Column({
    name: 'oper_ip',
    length: 15,
    comment: '操作地址',
  })
  @Excel({
    name: '操作地址',
  })
  @ApiPropertyOptional({ description: '操作地址' })
  @IsOptional()
  @IsString()
  operIp?: string;

  @Column({
    name: 'oper_location',
    length: 50,
    comment: '操作地点',
  })
  @Excel({
    name: '操作地点',
  })
  @ApiPropertyOptional({ description: '操作地点' })
  @IsOptional()
  @IsString()
  operLocation?: string;

  @Column({
    name: 'oper_param',
    length: 2000,
    comment: '请求参数',
  })
  @Excel({
    name: '请求参数',
  })
  @ApiPropertyOptional({ description: '请求参数' })
  @IsOptional()
  @IsString()
  operParam?: string;

  @Column({
    name: 'json_result',
    length: 2000,
    comment: '返回参数',
  })
  @Excel({
    name: '返回参数',
  })
  @ApiPropertyOptional({ description: '返回参数' })
  @IsOptional()
  @IsString()
  jsonResult?: string;

  @Column({
    name: 'status',
    type: 'int',
    comment: '操作状态（0正常 1异常）',
  })
  @Excel({
    name: '状态',
    readConverterExp: '0=正常,1=异常',
  })
  @ApiPropertyOptional({ description: '操作状态（0正常 1异常）' })
  @IsOptional()
  @IsNumber()
  status?: number;

  @Column({
    name: 'error_msg',
    length: 2000,
    comment: '错误消息',
  })
  @Excel({
    name: '错误消息',
  })
  @ApiPropertyOptional({ description: '错误消息' })
  @IsOptional()
  @IsString()
  errorMsg?: string;

  @CreateDateColumn({
    name: 'oper_time',
    comment: '操作时间',
    transformer: {
      to: (value: Date) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
      from: (value: string) => new Date(value),
    },
  })
  @Excel({
    name: '操作时间',
    width: 30,
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
  })
  @ApiPropertyOptional({ description: '操作时间' })
  @IsOptional()
  @IsDate()
  operTime?: Date;

  @Column({
    name: 'cost_time',
    type: 'bigint',
    comment: '消耗时间',
  })
  @Excel({
    name: '消耗时间',
    suffix: '毫秒',
  })
  @ApiPropertyOptional({ description: '消耗时间' })
  @IsOptional()
  @IsNumber()
  costTime?: number;
}
