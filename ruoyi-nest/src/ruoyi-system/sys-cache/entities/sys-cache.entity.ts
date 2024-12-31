import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Excel, ColumnType } from '~/ruoyi-share/annotation/Excel';

export class SysCache {

  
    cacheName?: string;

    cacheKey?: string;


    cacheValue?: string;

    remark?: string;

    constructor(cacheName: string, cacheKey: string, cacheValue: string);
    constructor(cacheName: string, remark: string);
    constructor(cacheName: string, arg2: string, arg3?: string) {
        this.cacheName = cacheName;
        if (arg3) {
            this.cacheName = this.cacheName.replace(":", "");
            this.cacheKey = arg2.replace(cacheName, "");
            this.cacheValue = arg3;
        } else {
            this.cacheName = cacheName;
            this.remark = arg2;
        }
    }

 
}
