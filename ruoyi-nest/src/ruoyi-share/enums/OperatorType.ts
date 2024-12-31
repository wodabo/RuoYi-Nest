/**
 * 操作人类别
 * 
 * @author ruoyi
 */
export enum OperatorType {
    /**
     * 其它
     */
    OTHER = 'OTHER',

    /**
     * 后台用户
     */
    MANAGE = 'MANAGE',

    /**
     * 手机端用户
     */
    MOBILE = 'MOBILE'
}

export const OperatorTypeMap = {
    [OperatorType.OTHER]: 0,
    [OperatorType.MANAGE]: 1,
    [OperatorType.MOBILE]: 2,
}
