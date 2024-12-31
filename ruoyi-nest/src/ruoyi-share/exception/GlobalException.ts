/**
 * 全局异常
 * 
 * @author ruoyi
 */
export class GlobalException extends Error {
    private detailMessage: string;

    /**
     * 空构造方法，避免反序列化问题
     */
    constructor();
    constructor(message: string);
    constructor(message?: string) {
        super(message);
    }

    getDetailMessage(): string {
        return this.detailMessage;
    }

    setDetailMessage(detailMessage: string): GlobalException {
        this.detailMessage = detailMessage;
        return this;
    }

    getMessage(): string {
        return this.message;
    }

    setMessage(message: string): GlobalException {
        this.message = message;
        return this;
    }
}