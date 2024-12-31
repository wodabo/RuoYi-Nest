import { GlobalException } from '../GlobalException';

/**
 * 用户信息异常类
 * 
 * @author ruoyi
 */
export class UserException extends GlobalException {
    constructor(code: string, args: any[] | null) {
        super('user');
        this.setMessage(code);
        if (args) {
            this.setDetailMessage(JSON.stringify(args));
        }
    }
}