import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import {
  IsNotEmpty,
  IsEmail,
  Length,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { Expose } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

@Entity('sys_dept')
export class SysDept extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'dept_id',
    comment: '部门ID',
  })
  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @IsString()
  deptId: number;

  @Column({
    name: 'parent_id',
    comment: '父部门ID',
  })
  @ApiPropertyOptional({ description: '父部门ID' })
  @IsOptional()
  @IsString()
  parentId: number;

  @Column({
    name: 'ancestors',
    length: 50,
    comment: '祖级列表',
  })
  ancestors: string;

  @Column({
    name: 'dept_name',
    length: 30,
    comment: '部门名称',
  })
  @ApiPropertyOptional({ description: '部门名称' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '部门名称不能为空' })
  @Length(0, 30, { message: '部门名称长度不能超过30个字符' })
  deptName: string;

  @Column({
    name: 'order_num',
    comment: '显示顺序',
  })
  @IsInt({ message: '显示顺序不能为空' })
  orderNum: number;

  @Column({
    name: 'leader',
    length: 20,
    nullable: true,
    comment: '负责人',
  })
  leader: string;

  @Column({
    name: 'phone',
    length: 11,
    nullable: true,
    comment: '联系电话',
  })
  @Length(0, 11, { message: '联系电话长度不能超过11个字符' })
  phone: string;

  @Column({
    name: 'email',
    length: 50,
    nullable: true,
    comment: '邮箱',
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @Length(0, 50, { message: '邮箱长度不能超过50个字符' })
  email: string;

  @Column({
    name: 'status',
    length: 1,
    default: '0',
    comment: '部门状态:0正常,1停用',
  })
  @ApiPropertyOptional({ description: '部门状态（0正常 1停用）' })
  @IsOptional()
  @IsString()
  status: string;

  @Column({
    name: 'del_flag',
    length: 1,
    default: '0',
    comment: '删除标志（0代表存在 2代表删除）',
  })
  @ApiPropertyOptional({ description: '删除标志（0代表存在 2代表删除）' })
  @IsOptional()
  @IsString()
  delFlag: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsString()
  beginTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: '角色ID列表' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds?: number[];

  @ApiPropertyOptional({ description: '别名' })
  @IsOptional()
  @IsString()
  deptAlias?: string;

  @Expose()
  parentName: string;

  @Expose()
  remark: string;

  children: SysDept[] = [];

  @OneToMany(() => SysUser, (user) => user.dept)
  users: SysUser[];

  @AfterLoad()
  afterLoad() {
    this.parentName = null;
    this.remark = null;
  }
}
