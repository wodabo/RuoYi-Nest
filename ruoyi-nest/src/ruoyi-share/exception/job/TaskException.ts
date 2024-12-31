/**
 * 计划策略异常
 * 
 * @author ruoyi
 */
export enum TaskCode {
    TASK_EXISTS = 'TASK_EXISTS',
    NO_TASK_EXISTS = 'NO_TASK_EXISTS', 
    TASK_ALREADY_STARTED = 'TASK_ALREADY_STARTED',
    UNKNOWN = 'UNKNOWN',
    CONFIG_ERROR = 'CONFIG_ERROR',
    TASK_NODE_NOT_AVAILABLE = 'TASK_NODE_NOT_AVAILABLE'
}

export class TaskException extends Error {
    private code: TaskCode;

    constructor(message: string, code: TaskCode, nestedEx?: Error) {
        super(message);
        if (nestedEx) {
            this.stack = nestedEx.stack;
        }
        this.code = code;
    }

    getCode(): TaskCode {
        return this.code;
    }
}