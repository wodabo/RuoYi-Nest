import { DesensitizedType, getDesensitizer } from '../enums/DesensitizedType';

export class SensitiveUtils {
  /**
   * 脱敏用户信息
   */
  static desensitizeUser(user: any): any {
    if (!user) return user;

    const sensitiveFields = ['password', 'salt'];
    const desensitized = { ...user };

    sensitiveFields.forEach((field) => {
      const desensitizer = getDesensitizer(field as DesensitizedType);
      if (desensitizer) {
        if (desensitized.hasOwnProperty(field)) {
          desensitized[field] = desensitizer(desensitized[field]);
        }
      }
    });

    return desensitized;
  }

  /**
   * 脱敏用户列表
   */
  static desensitizeUserList(users: any[]): any[] {
    if (!users) return users;
    return users.map((user) => this.desensitizeUser(user));
  }
}
