/**
 * 工具类异常
 * 
 * @author ruoyi
 */
export class UtilException extends Error {
    constructor(messageOrError: string | Error, error?: Error) {
        if (messageOrError instanceof Error) {
            super(messageOrError.message);
            this.stack = messageOrError.stack;
        } else if (error) {
            super(messageOrError);
            this.stack = error.stack;
        } else {
            super(messageOrError);
        }
        this.name = 'UtilException';
    }
}