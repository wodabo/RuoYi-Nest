export class TableDataInfo<T = any> {
    /** 总记录数 */
     total: number;

    /** 列表数据 */
     rows: T[];

    /** 消息状态码 */
     code: number;

    /** 消息内容 */
     msg: string;

    /**
     * 分页
     * @param list 列表数据
     * @param total 总记录数
     */
    constructor(list?: T[], total?: number) {
        this.code = 200; // HttpStatus.SUCCESS
        this.msg = "查询成功";
        if (list && total) {
            this.rows = this.sortObject(list);
            this.total = total;
        }
    }

    private sortObject(obj: any): any {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }

        // 如果是数组，递归处理每个元素
        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObject(item));
        }

        // 获取所有键并排序
        const sortedKeys = Object.keys(obj).sort();
        const result = {};

        // 按排序后的键重建对象
        sortedKeys.forEach(key => {
            result[key] = obj[key];
        });

        return result;
    }

}