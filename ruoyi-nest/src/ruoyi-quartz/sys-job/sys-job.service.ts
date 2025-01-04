import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { SysJob } from './entities/sys-job.entity';
import { SysJobRepository } from './repositories/sys-job.repository';
import {
  ScheduleConstants,
  Status,
} from '~/ruoyi-share/constant/ScheduleConstants';
import { ScheduleUtils } from '~/ruoyi-share/utils/schedule.utils';
import { Transactional } from '~/ruoyi-share/annotation/Transactional';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';
import { CronUtils } from '~/ruoyi-share/utils/cron.utils';

/**
 * SysJobService is a service class that handles all operations related to system jobs.
 * It is responsible for managing the lifecycle of system jobs, including creation, update, deletion, and execution.
 * This service also provides methods for checking the validity of cron expressions and managing job schedules.
 */
@Injectable()
export class SysJobService implements OnModuleInit {
  private readonly logger = new Logger(SysJobService.name);

  constructor(
    private readonly jobRepository: SysJobRepository,
    private readonly scheduleUtils: ScheduleUtils,
    private readonly contextHolderUtils: ContextHolderUtils,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  /**
   * This method is called when the module is initialized. It is responsible for initializing the scheduler by clearing all existing jobs and then re-adding all jobs from the database.
   */
  async onModuleInit() {
    const jobList = await this.jobRepository.selectJobAll();
    for (const job of jobList) {
      await this.scheduleUtils.createScheduleJob(job);
    }
  }

  /**
   * Selects a list of system jobs based on the provided job object.
   *
   * @param job The job object to filter by.
   * @returns A promise that resolves to an array of system jobs and the total count.
   */
  async selectJobList(job: SysJob): Promise<[SysJob[], number]> {
    return this.jobRepository.selectJobList(job);
  }

  /**
   * Selects a system job by its ID.
   *
   * @param jobId The ID of the job to select.
   * @returns A promise that resolves to the selected system job.
   */
  async selectJobById(jobId: number): Promise<SysJob> {
    return this.jobRepository.selectJobById(jobId);
  }

  /**
   * Pauses a system job.
   *
   * @param job The job to pause.
   * @returns A promise that resolves to the number of rows affected.
   */
  @Transactional()
  async pauseJob(job: SysJob): Promise<number> {
    job.status = Status.PAUSE;
    const rows = await this.jobRepository.updateJob(job);
    if (rows > 0) {
      await this.scheduleUtils.pauseJob(
        this.scheduleUtils.getJobKey(job.jobId, job.jobGroup),
      );
    }
    return rows;
  }

  /**
   * Resumes a system job.
   *
   * @param job The job to resume.
   * @returns A promise that resolves to the number of rows affected.
   */
  @Transactional()
  async resumeJob(job: SysJob): Promise<number> {
    job.status = Status.NORMAL;
    const rows = await this.jobRepository.updateJob(job);
    if (rows > 0) {
      await this.scheduleUtils.resumeJob(
        this.scheduleUtils.getJobKey(job.jobId, job.jobGroup),
      );
    }
    return rows;
  }

  /**
   * Deletes a system job.
   *
   * @param job The job to delete.
   * @returns A promise that resolves to the number of rows affected.
   */
  @Transactional()
  async deleteJob(job: SysJob): Promise<number> {
    const rows = await this.jobRepository.deleteJobById(job.jobId);
    if (rows > 0) {
      await this.scheduleUtils.deleteJob(
        this.scheduleUtils.getJobKey(job.jobId, job.jobGroup),
      );
    }
    return rows;
  }

  /**
   * Deletes system jobs by their IDs.
   *
   * @param jobIds The IDs of the jobs to delete.
   */
  @Transactional()
  async deleteJobByIds(jobIds: number[]): Promise<void> {
    for (const jobId of jobIds) {
      const job = await this.selectJobById(jobId);
      await this.deleteJob(job);
    }
  }

  /**
   * Changes the status of a system job.
   *
   * @param job The job to change the status of.
   * @returns A promise that resolves to the number of rows affected.
   */
  @Transactional()
  async changeStatus(job: SysJob): Promise<number> {
    return job.status === Status.NORMAL
      ? this.resumeJob(job)
      : this.pauseJob(job);
  }

  /**
   * Runs a system job immediately.
   *
   * @param job The job to run.
   * @returns A promise that resolves to a boolean indicating if the job was successfully run.
   */
  @Transactional()
  async run(job: SysJob): Promise<boolean> {
    let result = false;
    const jobId = job.jobId;
    const jobGroup = job.jobGroup;
    const properties = await this.selectJobById(jobId);
    // 参数
    const dataMap = new Map<string, any>();
    dataMap.set(ScheduleConstants.TASK_PROPERTIES, properties);
    const jobKey = this.scheduleUtils.getJobKey(jobId, jobGroup);
    if (await this.scheduleUtils.checkExists(jobKey)) {
      result = true;
      await this.scheduleUtils.triggerJob(jobKey, dataMap);
    }
    return result;
  }

  /**
   * Updates a scheduler job.
   *
   * @param job The job to update.
   * @param jobGroup The job group of the job.
   */
  private async updateSchedulerJob(
    job: SysJob,
    jobGroup: string,
  ): Promise<void> {
    const jobId = job.jobId;
    const jobKey = this.scheduleUtils.getJobKey(jobId, jobGroup);
    if (await this.scheduleUtils.checkExists(jobKey)) {
      await this.scheduleUtils.deleteJob(jobKey);
    }
    await this.scheduleUtils.createScheduleJob(job);
  }

  /**
   * Updates a system job.
   *
   * @param job The job to update.
   * @returns A promise that resolves to the number of rows affected.
   */
  @Transactional()
  async updateJob(job: SysJob): Promise<number> {
    const properties = await this.selectJobById(job.jobId);
    const rows = await this.jobRepository.updateJob(job);
    if (rows > 0) {
      this.updateSchedulerJob(job, properties.jobGroup);
    }
    return rows;
  }

  /**
   * Inserts a new system job.
   *
   * @param job The job to insert.
   * @returns A promise that resolves to the number of rows affected.
   */
  @Transactional()
  async insertJob(job: SysJob): Promise<number> {
    job.status = Status.PAUSE;
    const rows = await this.jobRepository.insertJob(job);
    if (rows > 0) {
      await this.scheduleUtils.createScheduleJob(job);
    }
    return rows;
  }

  /**
   * Checks if a cron expression is valid.
   *
   * @param cronExpression The cron expression to check.
   * @returns A boolean indicating if the cron expression is valid.
   */
  public checkCronExpressionIsValid(cronExpression: string): boolean {
    return CronUtils.checkCronExpressionIsValid(cronExpression);
  }
}
