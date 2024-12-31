import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Excel, ColumnType } from '~/ruoyi-share/annotation/Excel';
import * as dayjs from 'dayjs';

@Entity('sys_logininfor')
export class SysLogininfor extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'info_id',
        comment: '访问记录ID'
    })
    @Excel({
        name: "序号", 
        cellType: ColumnType.NUMERIC
    })
    @ApiPropertyOptional({ description: '访问记录ID' })
    @IsOptional()
    @IsNumber()
    infoId?: number;

    @Column({
        name: 'user_name',
        length: 50,
        comment: '用户账号'
    })
    @Excel({
        name: "用户账号"
    })
    @ApiPropertyOptional({ description: '用户账号' })
    @IsOptional()
    @IsString()
    userName?: string;

    @Column({
        name: 'status',
        length: 1,
        comment: '登录状态 0成功 1失败'
    })
    @Excel({
        name: "登录状态", 
        readConverterExp: "0=成功,1=失败"
    })
    @ApiPropertyOptional({ description: '登录状态 0成功 1失败' })
    @IsOptional()
    @IsString()
    status?: string;

    @Column({
        name: 'ipaddr',
        length: 15,
        comment: '登录IP地址'
    })
    @Excel({
        name: "登录地址"
    })
    @ApiPropertyOptional({ description: '登录IP地址' })
    @IsOptional()
    @IsString()
    ipaddr?: string;

    @Column({
        name: 'login_location',
        length: 100,
        comment: '登录地点'
    })
    @Excel({
        name: "登录地点"
    })
    @ApiPropertyOptional({ description: '登录地点' })
    @IsOptional()
    @IsString()
    loginLocation?: string;

    @Column({
        name: 'browser',
        length: 100,
        comment: '浏览器类型'
    })
    @Excel({
        name: "浏览器"
    })
    @ApiPropertyOptional({ description: '浏览器类型' })
    @IsOptional()
    @IsString()
    browser?: string;

    @Column({
        name: 'os',
        length: 100,
        comment: '操作系统'
    })
    @Excel({
        name: "操作系统"
    })
    @ApiPropertyOptional({ description: '操作系统' })
    @IsOptional()
    @IsString()
    os?: string;

    @Column({
        name: 'msg',
        length: 500,
        comment: '提示消息'
    })
    @Excel({
        name: "提示消息"
    })
    @ApiPropertyOptional({ description: '提示消息' })
    @IsOptional()
    @IsString()
    msg?: string;

    @Column({
        name: 'login_time',
        type: 'datetime',
        comment: '访问时间',
        transformer: {
            from: (value: Date) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
            to: (value: string) => new Date(value)
        }
    })
    @Excel({
        name: "访问时间",
        width: 30,
        dateFormat: "yyyy-MM-dd HH:mm:ss"
    })
    @ApiPropertyOptional({ description: '访问时间' })
    @IsOptional()
    loginTime?: Date;
}
