import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { Expose, Transform } from 'class-transformer';
import { ColumnType, Excel, ExcelType } from '~/ruoyi-share/annotation/Excel';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('sys_post')
export class SysPost extends BaseEntity {
    @PrimaryGeneratedColumn({ 
        name: 'post_id',
        comment: '岗位ID' 
    })
    @Excel({
        name: "岗位序号", 
        type: ExcelType.EXPORT, 
        cellType: ColumnType.NUMERIC, 
        prompt: "岗位编号"
    })
    @ApiPropertyOptional({ description: '岗位ID' })
    @IsOptional()
    postId: number;

    @Column({ 
        name: 'post_code',
        length: 64, 
        comment: '岗位编码' 
    })
    @Excel({
        name: "岗位编码"
    })
    @ApiPropertyOptional({ description: '岗位编码' })
    @IsOptional()
    @IsString()
    postCode: string;

    @Column({ 
        name: 'post_name',
        length: 50, 
        comment: '岗位名称' 
    })
    @Excel({
        name: "岗位名称"
    })
    @ApiPropertyOptional({ description: '岗位名称' })
    @IsOptional()
    @IsString()
    postName: string;

    @Column({ 
        name: 'post_sort',
        comment: '显示顺序' 
    })
    @Excel({
        name: "岗位排序"
    })
    @ApiPropertyOptional({ description: '显示顺序' })
    @IsOptional()
    @IsNumber()
    postSort: number;

    @Column({ 
        name: 'status',
        length: 1, 
        default: '0', 
        comment: '状态（0正常 1停用）' 
    })
    @Excel({
        name: "状态",
        readConverterExp: "0=正常,1=停用"
    })
    @ApiPropertyOptional({ description: '状态' })
    @IsOptional()
    @IsString()
    status: string;

    @Column({
        name: 'remark',
        length: 500,
        nullable: true,
        comment: '备注'
    })
    remark: string;

    @Expose()
    flag: boolean;

    @AfterLoad()
    afterLoad() {
        this.flag = true; // Assuming the flag should be set to true after loading
    }
}
