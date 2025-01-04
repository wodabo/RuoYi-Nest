/**
 * 脱敏类型
 *
 * @author ruoyi
 */
export enum DesensitizedType {
  /**
   * 姓名，第2位星号替换
   */
  USERNAME = 'username',

  /**
   * 密码，全部字符都用*代替
   */
  PASSWORD = 'password',

  /**
   * 身份证，中间10位星号替换
   */
  ID_CARD = 'idCard',

  /**
   * 手机号，中间4位星号替换
   */
  PHONE = 'phone',

  /**
   * 电子邮箱，仅显示第一个字母和@后面的地址显示，其他星号替换
   */
  EMAIL = 'email',

  /**
   * 银行卡号，保留最后4位，其他星号替换
   */
  BANK_CARD = 'bankCard',

  /**
   * 车牌号码，包含普通车辆、新能源车辆
   */
  CAR_LICENSE = 'carLicense',
}

/**
 * 脱敏处理函数
 */
export const desensitizers = new Map<DesensitizedType, (s: string) => string>([
  [
    DesensitizedType.USERNAME,
    (s: string) => s.replace(/([\S])\S([\S]*)/, '$1*$2'),
  ],
  [DesensitizedType.PASSWORD, (s: string) => '*'.repeat(s.length)],
  [
    DesensitizedType.ID_CARD,
    (s: string) =>
      s.replace(/(\d{4})\d{10}(\d{3}[Xx]|\d{4})/, '$1** **** ****$2'),
  ],
  [
    DesensitizedType.PHONE,
    (s: string) => s.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
  ],
  [
    DesensitizedType.EMAIL,
    (s: string) => s.replace(/(^.)[^@]*(@.*$)/, '$1****$2'),
  ],
  [
    DesensitizedType.BANK_CARD,
    (s: string) => s.replace(/\d{15}(\d{3})/, '**** **** **** **** $1'),
  ],
  [
    DesensitizedType.CAR_LICENSE,
    (s: string) =>
      s.replace(/^([A-Z])([A-Z0-9]{3})([A-Z0-9]{2})([A-Z0-9]+)$/, '$1$2****$4'),
  ],
]);

/**
 * 获取脱敏处理函数
 * @param type 脱敏类型
 * @returns 脱敏处理函数
 */
export function getDesensitizer(type: DesensitizedType): (s: string) => string {
  return desensitizers.get(type) || ((s: string) => s);
}
