/**
 * 任务调度通用常量
 * 
 * @author ruoyi
 */
export class ScheduleConstants {
    /** 任务类名 */
    public static readonly TASK_CLASS_NAME: string = "TASK_CLASS_NAME";

    /** 执行目标key */
    public static readonly TASK_PROPERTIES: string = "TASK_PROPERTIES";

    /** 默认 */
    public static readonly MISFIRE_DEFAULT: string = "0";

    /** 立即触发执行 */
    public static readonly MISFIRE_IGNORE_MISFIRES: string = "1";

    /** 触发一次执行 */
    public static readonly MISFIRE_FIRE_AND_PROCEED: string = "2";

    /** 不触发立即执行 */
    public static readonly MISFIRE_DO_NOTHING: string = "3";
}

/**
 * 任务状态
 */
export enum Status {
    /**
     * 正常
     */
    NORMAL = "0",
    /**
     * 暂停
     */
    PAUSE = "1"
}