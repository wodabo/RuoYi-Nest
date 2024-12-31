
export class PageUtil {
    static startPage(pageNum: number, pageSize: number) {
        return {
            skip: (pageNum - 1) * pageSize,
            take: pageSize
        };
    }

    static getPageInfo(total: number, pageNum: number, pageSize: number) {
        return {
            total,
            pageNum,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    }




}

