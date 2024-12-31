/**
 * 脱敏类型
 *
 * @author ruoyi
 */
export enum DesensitizedType {
    /**
     * 姓名，第2位星号替换
     */
    USERNAME = 'USERNAME',

    /**
     * 密码，全部字符都用*代替
     */
    PASSWORD = 'PASSWORD',

    /**
     * 身份证，中间10位星号替换
     */
    ID_CARD = 'ID_CARD',

    /**
     * 手机号，中间4位星号替换
     */
    PHONE = 'PHONE',

    /**
     * 电子邮箱，仅显示第一个字母和@后面的地址显示，其他星号替换
     */
    EMAIL = 'EMAIL',

    /**
     * 银行卡号，保留最后4位，其他星号替换
     */
    BANK_CARD = 'BANK_CARD',

    /**
     * 车牌号码，包含普通车辆、新能源车辆
     */
    CAR_LICENSE = 'CAR_LICENSE'
}

export class DesensitizedUtil {
    private static desensitizers = new Map<DesensitizedType, (s: string) => string>([
        [DesensitizedType.USERNAME, (s: string) => s.replace(/([\S])\S([\S]*)/, '$1*$2')],
        [DesensitizedType.PASSWORD, (s: string) => '*'.repeat(s.length)],
        [DesensitizedType.ID_CARD, (s: string) => s.replace(/(\d{4})\d{10}(\d{3}[Xx]|\d{4})/, '$1** **** ****$2')],
        [DesensitizedType.PHONE, (s: string) => s.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')],
        [DesensitizedType.EMAIL, (s: string) => s.replace(/(^.)[^@]*(@.*$)/, '$1****$2')],
        [DesensitizedType.BANK_CARD, (s: string) => s.replace(/\d{15}(\d{3})/, '**** **** **** **** $1')],
        [DesensitizedType.CAR_LICENSE, (s: string) => s.replace(/^([\u4e00-\u9fa5]{1}[A-Z]{1})([A-Z0-9]{4})([A-Z0-9]{0,2})$/, '$1****$3')]
    ]);

    static desensitize(type: DesensitizedType, value: string): string {
        const desensitizer = this.desensitizers.get(type);
        if (!desensitizer) {
            throw new Error(`Unsupported desensitized type: ${type}`);
        }
        return desensitizer(value);
    }
}