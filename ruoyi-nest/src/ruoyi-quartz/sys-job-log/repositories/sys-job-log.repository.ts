import { Injectable } from '@nestjs/common';
import { Repository, DataSource, SelectQueryBuilder, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SensitiveUtils } from '~/ruoyi-share/utils/sensitive.utils';
import { DataScopeUtils } from '~/ruoyi-share/utils/data-scope.utils';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';
import { SysJobLog } from '~/ruoyi-quartz/sys-job-log/entities/sys-job-log.entity';

@Injectable()
export class SysJobLogRepository {

    constructor(
        @InjectRepository(SysJobLog)
        private readonly jobLogRepository: Repository<SysJobLog>,
        private readonly queryUtils: QueryUtils,
        private readonly dataScopeUtils: DataScopeUtils,
        private readonly sqlLoggerUtils: SqlLoggerUtils,    
        private readonly securityUtils: SecurityUtils,
        private readonly contextHolderUtils: ContextHolderUtils
    ) {}



    selectJobLogVo() {
        return this.jobLogRepository
            .createQueryBuilder('jobLog')
            .select([
                'jobLog.jobLogId',
                'jobLog.jobName',
                'jobLog.jobGroup',
                'jobLog.invokeTarget',
                'jobLog.jobMessage',
                'jobLog.status',
                'jobLog.exceptionInfo',
                'jobLog.createTime'
            ])
    }
 
    async selectJobLogList(jobLog: SysJobLog): Promise<[SysJobLog[],number]> {
        const queryBuilder = this.selectJobLogVo()

        if (jobLog.jobName != null && jobLog.jobName != '') {
            queryBuilder.andWhere('jobLog.jobName LIKE :jobName', { jobName: `%${jobLog.jobName}%` });
        }

        if (jobLog.jobGroup != null && jobLog.jobGroup != '') {
            queryBuilder.andWhere('jobLog.jobGroup = :jobGroup', { jobGroup: jobLog.jobGroup });
        }

        if (jobLog.status != null && jobLog.status != '') {
            queryBuilder.andWhere('jobLog.status = :status', { status: jobLog.status });
        }

        if (jobLog.invokeTarget != null && jobLog.invokeTarget != '') {
            queryBuilder.andWhere('jobLog.invokeTarget LIKE :invokeTarget', { invokeTarget: `%${jobLog.invokeTarget}%` });
        }

        this.sqlLoggerUtils.log(queryBuilder,'selectJobLogList');
        
        const [rows, len] = await this.queryUtils.executeQuery(queryBuilder, jobLog);
        return [rows, len];
    }

    async selectJobLogAll(): Promise<SysJobLog[]> {
        const queryBuilder = this.selectJobLogVo()

        this.sqlLoggerUtils.log(queryBuilder,'selectJobLogAll');
        
        const rows = await queryBuilder.getMany();
        return rows;
    }

    async selectJobLogById(jobLogId: number): Promise<SysJobLog> {
        const queryBuilder = this.selectJobLogVo()
            .where('jobLog.jobLogId = :jobLogId', { jobLogId });

        this.sqlLoggerUtils.log(queryBuilder,'selectJobLogById');
        
        return queryBuilder.getOne();
    }

    async deleteJobLogById(jobLogId: number): Promise<number> {
        const queryBuilder = this.jobLogRepository.createQueryBuilder()
            .delete()
            .from(SysJobLog)
            .where('jobLogId = :jobLogId', { jobLogId });

        this.sqlLoggerUtils.log(queryBuilder, 'deleteJobLogById');

        const result = await queryBuilder.execute();
        return result.affected;
    }

    async deleteJobLogByIds(jobLogIds: number[]): Promise<number> {
        const queryBuilder = this.jobLogRepository.createQueryBuilder()
            .delete()
            .from(SysJobLog)
            .whereInIds(jobLogIds);

        this.sqlLoggerUtils.log(queryBuilder, 'deleteJobLogByIds');

        const result = await queryBuilder.execute();
        return result.affected;
    }

    async insertJobLog(jobLog: SysJobLog): Promise<number> {
        const insertObject: any = {
            createTime: new Date()
        };

        if (jobLog.jobLogId != null && jobLog.jobLogId != 0) {  
            insertObject.jobLogId = jobLog.jobLogId;
        }
        if (jobLog.jobName != null && jobLog.jobName != '') {
            insertObject.jobName = jobLog.jobName;
        }
        if (jobLog.jobGroup != null && jobLog.jobGroup != '') {
            insertObject.jobGroup = jobLog.jobGroup;
        }
        if (jobLog.invokeTarget != null && jobLog.invokeTarget != '') {
            insertObject.invokeTarget = jobLog.invokeTarget;
        }
        if (jobLog.jobMessage != null && jobLog.jobMessage != '') {
            insertObject.jobMessage = jobLog.jobMessage;
        }
        if (jobLog.status != null && jobLog.status != '') {
            insertObject.status = jobLog.status;
        }
        if (jobLog.exceptionInfo != null && jobLog.exceptionInfo != '') {
            insertObject.exceptionInfo = jobLog.exceptionInfo;
        }

        const queryBuilder = this.jobLogRepository.createQueryBuilder()
            .insert()
            .into(SysJobLog)
            .values(insertObject);

        this.sqlLoggerUtils.log(queryBuilder, 'insertJobLog');

        const result = await queryBuilder.execute();
        return result.raw.insertId;
    }

    async cleanJobLog(): Promise<void> {
        this.jobLogRepository.clear()

        this.sqlLoggerUtils.log(null, 'cleanJobLog');

    }


}
