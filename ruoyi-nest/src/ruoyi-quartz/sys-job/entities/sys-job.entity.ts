import { Entity, Column, PrimaryGeneratedColumn, AfterLoad, JoinTable, ManyToMany, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { Expose, Transform } from 'class-transformer';
import { SysRole } from '~/ruoyi-system/sys-role/entities/sys-role.entity';
import { SysDept } from '~/ruoyi-system/sys-dept/entities/sys-dept.entity';
import * as dayjs from 'dayjs';
import { ColumnType, Excel, ExcelType } from '~/ruoyi-share/annotation/Excel';
import { Excels } from '~/ruoyi-share/annotation/Excels';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CronUtils } from '~/ruoyi-share/utils/cron.utils';

@Entity('sys_job')
export class SysJob extends BaseEntity {
    /** 任务ID */
    @PrimaryGeneratedColumn('increment',{        
        name: 'job_id',
        comment: '任务ID',
    })
    @Excel({
        name: "任务序号", 
        type: ExcelType.EXPORT, 
        cellType: ColumnType.NUMERIC, 
        prompt: "任务编号"
    })
    @ApiPropertyOptional({ description: '任务ID' })
    @IsOptional()
    jobId:number;

    /** 任务名称 */
    @Column({ 
        name: 'job_name',
        length: 64, 
        comment: '任务名称' 
    })
    @Excel({
        name: "任务名称"
    })
    @ApiPropertyOptional({ description: '任务名称' })
    @IsOptional()
    @IsString()
    jobName: string;

    /** 任务组名 */
    @Column({ 
        name: 'job_group',
        length: 64, 
        comment: '任务组名' 
    })
    @Excel({
        name: "任务组名"
    })
    jobGroup: string;

    /** 调用目标字符串 */
    @Column({ 
        name: 'invoke_target',
        length: 500, 
        comment: '调用目标字符串' 
    })
    @Excel({
        name: "调用目标字符串"
    })
    invokeTarget: string;

    /** cron执行表达式 */
    @Column({ 
        name: 'cron_expression',
        length: 255, 
        comment: 'cron执行表达式' 
    })
    @Excel({
        name: "执行表达式 "
    })
    cronExpression: string;

    /** cron计划策略 */
    @Column({ 
        name: 'misfire_policy',
        length: 1, 
        default: '0', 
        comment: 'cron计划策略' 
    })
    @Excel({
        name: "计划策略 ",
        readConverterExp: "0=默认,1=立即触发执行,2=触发一次执行,3=不触发立即执行"
    })
    misfirePolicy: string;

    /** 是否并发执行（0允许 1禁止） */
    @Column({ 
        name: 'concurrent',
        length: 1, 
        comment: '是否并发执行（0允许 1禁止）' 
    })
    @Excel({
        name: "并发执行",
        readConverterExp: "0=允许,1=禁止"
    })
    concurrent: string;

    /** 任务状态（0正常 1暂停） */
    @Column({ 
        name: 'status',
        length: 1, 
        default: '0', 
        comment: '任务状态（0正常 1暂停）' 
    })
    @Excel({
        name: "任务状态",
        readConverterExp: "0=正常,1=暂停"
    })
    @ApiPropertyOptional({ description: '任务状态' })
    @IsOptional()
    @IsString()
    status: string;


    @Expose()
    @Transform(({ obj }) => {
        if(obj.cronExpression){ 
            return CronUtils.getNextExecution(obj.cronExpression);
        }
        return null;
    })
    nextValidTime?: Date;

    // @AfterLoad()
    // afterLoad() {
    //     this.nextValidTime = dayjs(this.cronExpression).format('YYYY-MM-DD HH:mm:ss');
    // }
}