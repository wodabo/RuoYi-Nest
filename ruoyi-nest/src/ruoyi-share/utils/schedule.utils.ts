import { Injectable } from '@nestjs/common';
import { SysJob } from '~/ruoyi-quartz/sys-job/entities/sys-job.entity';
import { ScheduleConstants, Status } from '~/ruoyi-share/constant/ScheduleConstants';
import { TaskException } from '~/ruoyi-share/exception/job/TaskException';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronUtils } from '~/ruoyi-share/utils/cron.utils';

@Injectable()
export class ScheduleUtils {

    private joinDataMap: Map<string, any> = new Map<string, any>();

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry
    ) { }


    /**
     * 获取任务触发键
     */
    public getJobKey(jobId: number, jobGroup: string): string {
        return `${ScheduleConstants.TASK_CLASS_NAME}${jobId}:${jobGroup}`;
    }

    /**
     * 检查任务是否存在
     */
    public checkExists(jobKey: string): boolean {
        return this.schedulerRegistry.doesExist('cron', jobKey);
    }

    

    /**
     * 创建定时任务
     */
    public async createScheduleJob(job: SysJob): Promise<void> {
        const jobKey = this.getJobKey(job.jobId, job.jobGroup);

        // 放入参数，运行时的方法可以获取
        const dataMap = new Map<string, any>();
        dataMap.set(ScheduleConstants.TASK_PROPERTIES,job);
        this.joinDataMap.set(jobKey,dataMap);

        // 判断是否存在
        if (this.schedulerRegistry.doesExist('cron', jobKey)) {
            // 防止创建时存在数据问题 先移除，然后在执行创建操作
            this.schedulerRegistry.deleteCronJob(jobKey);
        }
        // 判断任务是否过期
        if (CronUtils.getNextExecution(job.cronExpression)) {


            // 创建任务
            const cronJob = new CronJob(
                CronUtils.convertQuartzToNodeCron(job.cronExpression),
                () => {
                    try {
                        // 任务执行逻辑
                    } catch (error) {
                        console.error(`任务执行失败: ${job.jobName}`, error);
                    }
                },
                // null,
                // false,
                // 'Asia/Shanghai',  // 指定时区
                // undefined,
                // false,
                // this.handleCronScheduleMisfirePolicy.bind(this, job)  // 处理错过执行
            );
            this.schedulerRegistry.addCronJob(jobKey, cronJob);
            cronJob.start();


        }



        // 暂停任务
        if (job.status === Status.PAUSE) {
            this.schedulerRegistry.getCronJob(jobKey).stop();
        }


    }
    
      /**
     * 处理错过的执行
     */
      private handleCronScheduleMisfirePolicy(job: SysJob): void {
        switch (job.misfirePolicy) {
            case ScheduleConstants.MISFIRE_DEFAULT:
                break;
            case ScheduleConstants.MISFIRE_IGNORE_MISFIRES:
                // this.executeJob(job);
                break;
            case ScheduleConstants.MISFIRE_FIRE_AND_PROCEED:
                // this.executeJob(job);
                break;
            case ScheduleConstants.MISFIRE_DO_NOTHING:
                break;
            default:
                throw new Error(`The task misfire policy '${job.misfirePolicy}' cannot be used in cron schedule tasks`);
        }
    }

    /**
     * 暂停任务
     */
    public async pauseJob(jobKey: string): Promise<void> {
        const job = this.schedulerRegistry.getCronJob(jobKey);
        job.stop();
    }

    /**
     * 恢复任务
     */
    public async resumeJob(jobKey: string): Promise<void> {
        const job = this.schedulerRegistry.getCronJob(jobKey);
        job.start();
    }

    /**
     * 删除任务
     */
    public async deleteJob(jobKey: string): Promise<void> {
        this.schedulerRegistry.deleteCronJob(jobKey);
    }

    /**
     * 触发任务
     */
    public async triggerJob(jobKey: string, dataMap?: Map<string, any>): Promise<void> {
        try {
            const job = this.schedulerRegistry.getCronJob(jobKey);
            if(dataMap){
                this.joinDataMap.set(jobKey,dataMap);
            }
            // 立即执行任务
            job.fireOnTick();
    
        } catch (error) {
            console.error(`触发任务失败: ${jobKey}`, error);
            throw error;
        }
    }
 
}
