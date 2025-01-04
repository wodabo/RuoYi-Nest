import { CronJob } from 'cron';

export class CronUtils {
  /**
   * 转换 Quartz cron 为 Node cron
   */
  public static convertQuartzToNodeCron(quartzCron: string): string {
    // Quartz: 秒 分 时 日 月 周 [年]
    // Node:   秒 分 时 日 月 周
    const parts = quartzCron.split(' ');

    // 处理星期数字
    if (parts[5] !== '?') {
      parts[5] = parts[5]
        .replace(/7/g, '0') // 周日
        .replace(/1/g, '0') // 周一改为1
        .replace(/2/g, '1')
        .replace(/3/g, '2')
        .replace(/4/g, '3')
        .replace(/5/g, '4')
        .replace(/6/g, '5');
    } else {
      parts[5] = '*'; // 将 ? 转换为 *
    }

    // 移除年份字段
    parts.length = 6;

    return parts.join(' ');
  }

  /**
   * 校验cron表达式是否有效
   */
  public static checkCronExpressionIsValid(cronExpression: string): boolean {
    try {
      new CronJob(CronUtils.convertQuartzToNodeCron(cronExpression), () => {});
      return true;
    } catch (e) {
      return false;
    }
  }

  // 获取任务下次执行时间
  public static getNextExecution(cronExpression: string): Date {
    if (cronExpression) {
      const job = new CronJob(
        CronUtils.convertQuartzToNodeCron(cronExpression),
        () => {},
      );
      return job.nextDate().toJSDate();
    }
    return null;
  }
}
