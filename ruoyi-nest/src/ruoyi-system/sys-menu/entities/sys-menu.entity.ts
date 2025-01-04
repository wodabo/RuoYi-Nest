import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsNotEmpty,
  Length,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

@Entity('sys_menu')
export class SysMenu extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'menu_id',
    comment: '菜单ID',
  })
  menuId: number;

  @Column({
    name: 'menu_name',
    length: 50,
    comment: '菜单名称',
  })
  @ApiPropertyOptional({ description: '菜单名称' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '菜单名称不能为空' })
  @Length(0, 50, { message: '菜单名称长度不能超过50个字符' })
  menuName: string;

  @Column({
    name: 'parent_id',
    nullable: true,
    comment: '父菜单ID',
  })
  parentId: number;

  @Column({
    name: 'order_num',
    comment: '显示顺序',
  })
  @IsInt({ message: '显示顺序不能为空' })
  orderNum: number;

  @Column({
    name: 'path',
    length: 200,
    nullable: true,
    comment: '路由地址',
  })
  @Length(0, 200, { message: '路由地址不能超过200个字符' })
  path: string;

  @Column({
    name: 'component',
    length: 255,
    nullable: true,
    comment: '组件路径',
  })
  @Length(0, 255, { message: '组件路径不能超过255个字符' })
  component: string;

  @Column({
    name: 'query',
    length: 255,
    nullable: true,
    comment: '路由参数',
  })
  query: string;

  @Column({
    name: 'route_name',
    length: 255,
    nullable: true,
    comment: '路由名称',
  })
  routeName: string;

  @Column({
    name: 'is_frame',
    length: 1,
    default: '1',
    comment: '是否为外链（0是 1否）',
    transformer: {
      to: (value: string) => value,
      from: (value: number) => value.toString(),
    },
  })
  isFrame: string;

  @Column({
    name: 'is_cache',
    length: 1,
    default: '0',
    comment: '是否缓存（0缓存 1不缓存）',
  })
  isCache: string;

  @Column({
    name: 'menu_type',
    length: 1,
    comment: '菜单类型（M目录 C菜单 F按钮）',
  })
  @IsNotEmpty({ message: '菜单类型不能为空' })
  menuType: string;

  @Column({
    name: 'visible',
    length: 1,
    default: '0',
    comment: '显示状态（0显示 1隐藏）',
  })
  @ApiPropertyOptional({ description: '菜单可见性' })
  @IsOptional()
  @IsString()
  visible: string;

  @Column({
    name: 'status',
    length: 1,
    default: '0',
    comment: '菜单状态（0正常 1停用）',
  })
  @ApiPropertyOptional({ description: '菜单状态' })
  @IsOptional()
  @IsString()
  status: string;

  @Column({
    name: 'perms',
    length: 100,
    nullable: true,
    comment: '权限标识',
  })
  @Length(0, 100, { message: '权限标识长度不能超过100个字符' })
  perms: string;

  @Column({
    name: 'icon',
    length: 100,
    nullable: true,
    comment: '菜单图标',
  })
  icon: string;

  parentName: string;

  children: SysMenu[] = [];
}
