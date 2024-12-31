import { Injectable } from '@nestjs/common';
import { UtilException } from '~/ruoyi-share/exception/UtilException';

@Injectable()
export class SqlUtils
{
    /**
     * 定义常用的 sql关键字
     */
    private static SQL_REGEX = "and |extractvalue|updatexml|sleep|exec |insert |select |delete |update |drop |count |chr |mid |master |truncate |char |declare |or |union |like |+|/*|user()";

    /**
     * 仅支持字母、数字、下划线、空格、逗号、小数点（支持多个字段排序）
     */
    private static SQL_PATTERN = "[a-zA-Z0-9_\\ \\,\\.]+";

    /**
     * 限制orderBy最大长度
     */
    private static ORDER_BY_MAX_LENGTH = 500;

    /**
     * 检查字符，防止注入绕过
     */
    public escapeOrderBySql(value: string): string
    {
        if (value && !this.isValidOrderBySql(value))
        {
            throw new UtilException("参数不符合规范，不能进行查询");
        }
        if (value.length > SqlUtils.ORDER_BY_MAX_LENGTH)
        {
            throw new UtilException("参数已超过最大限制，不能进行查询");
        }
        return value;
    }

    /**
     * 验证 order by 语法是否符合规范
     */
    public isValidOrderBySql(value: string): boolean
    {
        return value.match(SqlUtils.SQL_PATTERN) !== null;
    }

    /**
     * SQL关键字检查
     */
    public filterKeyword(value: string): void
    {
        if (value.length === 0)
        {
            return;
        }
        const sqlKeywords = value.split(SqlUtils.SQL_REGEX);
        sqlKeywords.forEach((sqlKeyword) => {
            if (value.toLowerCase().indexOf(sqlKeyword.toLowerCase()) > -1)
            {
                throw new UtilException("参数存在SQL注入风险");
            }
        });
    }
}
