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

@Entity('sys_job_log')
export class SysJobLog extends BaseEntity {
    /** 日志ID */
    @PrimaryGeneratedColumn('increment',{
        name: 'job_log_id',
        comment: '日志ID',
    })
    @Excel({
        name: "日志序号", 
        type: ExcelType.EXPORT, 
        cellType: ColumnType.NUMERIC, 
        prompt: "日志编号"
    })
    @ApiPropertyOptional({ description: '日志ID' })
    @IsOptional()
    jobLogId: number;

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

    /** 日志信息 */
    @Column({ 
        name: 'job_message',
        length: 500, 
        comment: '日志信息' 
    })
    @Excel({
        name: "日志信息"
    })
    jobMessage: string;

    /** 执行状态（0正常 1失败） */
    @Column({ 
        name: 'status',
        length: 1, 
        comment: '执行状态（0正常 1失败）' 
    })
    @Excel({
        name: "执行状态",
        readConverterExp: "0=正常,1=失败"
    })
    @ApiPropertyOptional({ description: '执行状态' })
    @IsOptional()
    @IsString()
    status: string;

    /** 异常信息 */
    @Column({ 
        name: 'exception_info',
        length: 2000, 
        comment: '异常信息' 
    })
    @Excel({
        name: "异常信息"
    })
    exceptionInfo: string;

    /** 开始时间 */
    @Column({ 
        name: 'start_time',
        type: 'timestamp', 
        comment: '开始时间' 
    })
    startTime: Date;

    /** 停止时间 */
    @Column({ 
        name: 'stop_time',
        type: 'timestamp', 
        comment: '停止时间' 
    })
    stopTime: Date;
}