/**
 * 用户状态
 *
 * @author ruoyi
 */
export class UserStatus {
  static readonly OK = new UserStatus('0', '正常');
  static readonly DISABLE = new UserStatus('1', '停用');
  static readonly DELETED = new UserStatus('2', '删除');

  private constructor(
    private readonly code: string,
    private readonly info: string,
  ) {}

  getCode(): string {
    return this.code;
  }

  getInfo(): string {
    return this.info;
  }
}
