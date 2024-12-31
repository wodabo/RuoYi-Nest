import { UserException } from './UserException';

/**
 * 用户不存在异常类
 * 
 * @author ruoyi
 */
export class UserNotExistsException extends UserException {
    constructor() {
        super('user.not.exists', null);
    }
}