import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Excel, ColumnType } from '~/ruoyi-share/annotation/Excel';

@Entity('sys_config')
export class SysConfig extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'config_id',
        comment: '参数主键'
    })
    @Excel({
        name: "参数主键", 
        cellType: ColumnType.NUMERIC
    })
    @ApiPropertyOptional({ description: '参数主键' })
    @IsOptional()
    @IsNumber()
    configId?: number;

    @Column({
        name: 'config_name',
        length: 100,
        comment: '参数名称'
    })
    @Excel({
        name: "参数名称"
    })
    @ApiPropertyOptional({ description: '参数名称' })
    @IsOptional()
    @IsString()
    configName?: string;

    @Column({
        name: 'config_key', 
        length: 100,
        comment: '参数键名'
    })
    @Excel({
        name: "参数键名"
    })
    @ApiPropertyOptional({ description: '参数键名' })
    @IsOptional()
    @IsString()
    configKey?: string;

    @Column({
        name: 'config_value',
        length: 500,
        comment: '参数键值'
    })
    @Excel({
        name: "参数键值"
    })
    @ApiPropertyOptional({ description: '参数键值' })
    @IsOptional()
    @IsString()
    configValue?: string;

    @Column({
        name: 'config_type',
        length: 1,
        comment: '系统内置（Y是 N否）'
    })
    @Excel({
        name: "系统内置", 
        readConverterExp: "Y=是,N=否"
    })
    @ApiPropertyOptional({ description: '系统内置（Y是 N否）' })
    @IsOptional()
    @IsString()
    configType?: string;

 
}
