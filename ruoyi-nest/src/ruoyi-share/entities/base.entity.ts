import { 
    CreateDateColumn, 
    UpdateDateColumn, 
    Column, 
    PrimaryGeneratedColumn 
} from 'typeorm';

import * as dayjs from 'dayjs';
import { Exclude, Transform } from 'class-transformer';

export abstract class BaseEntity {
    @Column({ 
        name: 'create_by',
        length: 64, 
        nullable: true, 
        comment: '创建者',
        select: false
    })
    createBy?: string;

    @CreateDateColumn({ 
        name: 'create_time',
        comment: '创建时间',
        select: false,
        transformer: {
            from(value: string): string {
                return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : null;
            },
            to(value: Date): Date {
                return value;
            },
        }
    })
    createTime?: Date;

    @Column({ 
        name: 'update_by',
        length: 64, 
        nullable: true, 
        comment: '更新者',
        select: false
    })
    updateBy?: string;

    @UpdateDateColumn({ 
        name: 'update_time',
        comment: '更新时间',
        select: false,
        transformer: {
            from(value: string): string {
                return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : null;
            },
            to(value: Date): Date {
                return value;
            },
        }
    })
    updateTime?: Date;

    @Column({ 
        name: 'remark',
        comment: '备注',
        select: false,
        nullable: true
    })
    remark?: string;

    params?: any;
}