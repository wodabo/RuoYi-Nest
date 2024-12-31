import { MessageUtils } from '~/ruoyi-share/utils/message.utils';
import { UserException } from './UserException';

/**
 * 验证码失效异常类
 * 
 * @author ruoyi
 */
export class CaptchaExpireException extends UserException {
    constructor() {
        super(MessageUtils.message('user.jcaptcha.expire'), null);
    }
}