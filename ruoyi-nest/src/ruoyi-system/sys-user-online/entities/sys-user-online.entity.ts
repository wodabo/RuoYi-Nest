import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Excel, ColumnType } from '~/ruoyi-share/annotation/Excel';

export class SysUserOnline {

    tokenId?: string;

   
    deptName?: string;

    userName?: string;

    ipaddr?: string;

    loginLocation?: string;

    browser?: string;


    os?: string;

  
    loginTime?: number;

   
}
