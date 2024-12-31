/**
 * 操作状态
 * 
 * @author ruoyi
 */
export enum BusinessStatus {
    /**
     * 成功
     */
    SUCCESS = 'SUCCESS',

    /**
     * 失败
     */
    FAIL = 'FAIL',
}

export const BusinessStatusMap = {
    [BusinessStatus.SUCCESS]: 0,
    [BusinessStatus.FAIL]: 1,
}
