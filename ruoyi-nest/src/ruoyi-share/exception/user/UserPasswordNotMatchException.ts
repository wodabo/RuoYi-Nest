import { MessageUtils } from '~/ruoyi-share/utils/message.utils';
import { UserException } from './UserException';

/**
 * 用户密码不正确或不符合规范异常类
 *
 * @author ruoyi
 */
export class UserPasswordNotMatchException extends UserException {
  constructor() {
    super(MessageUtils.message('user.password.not.match'), null);
  }
}
