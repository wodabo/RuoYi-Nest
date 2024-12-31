/**
 * 业务操作类型
 * 
 * @author ruoyi
 */
export enum BusinessType {
    /**
     * 其它
     */
    OTHER = 'OTHER',

    /**
     * 新增
     */
    INSERT = 'INSERT',

    /**
     * 修改
     */
    UPDATE = 'UPDATE',

    /**
     * 删除
     */
    DELETE = 'DELETE',

    /**
     * 授权
     */
    GRANT = 'GRANT',

    /**
     * 导出
     */
    EXPORT = 'EXPORT',

    /**
     * 导入
     */
    IMPORT = 'IMPORT',

    /**
     * 强退
     */
    FORCE = 'FORCE',

    /**
     * 生成代码
     */
    GENCODE = 'GENCODE',
    
    /**
     * 清空数据
     */
    CLEAN = 'CLEAN'
}

export const BusineesTypeMap = {   
    [BusinessType.OTHER]: 0,
    [BusinessType.INSERT]: 1,
    [BusinessType.UPDATE]: 2,
    [BusinessType.DELETE]: 3,
    [BusinessType.GRANT]: 4,
    [BusinessType.EXPORT]: 5,
    [BusinessType.IMPORT]: 6,
    [BusinessType.FORCE]: 7,
    [BusinessType.GENCODE]: 8,
    [BusinessType.CLEAN]: 9,
}
