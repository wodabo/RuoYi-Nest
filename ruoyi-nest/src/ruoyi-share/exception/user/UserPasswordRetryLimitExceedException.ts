import { UserException } from './UserException';

/**
 * 用户错误最大次数异常类
 *
 * @author ruoyi
 */
export class UserPasswordRetryLimitExceedException extends UserException {
  constructor(retryLimitCount: number, lockTime: number) {
    super('user.password.retry.limit.exceed', [retryLimitCount, lockTime]);
  }
}
