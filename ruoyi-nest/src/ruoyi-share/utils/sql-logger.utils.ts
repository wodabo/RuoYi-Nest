import {
  Logger,
  QueryRunner,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  DeleteQueryBuilder,
  InsertQueryBuilder,
} from 'typeorm';
import * as SqlString from 'sqlstring';

export class SqlLoggerUtils {
  private convertParamToString(param: any): string {
    if (param === null) return 'NULL';
    if (param === undefined) return 'NULL';
    if (typeof param === 'string') return `'${param}'`;
    if (param instanceof Date) return `'${param.toISOString()}'`;
    return String(param);
  }
  log(
    queryBuilder?:
      | SelectQueryBuilder<any>
      | UpdateQueryBuilder<any>
      | DeleteQueryBuilder<any>
      | InsertQueryBuilder<any>,
    methodName?: string,
  ) {
    if (!queryBuilder) return;
    const query = queryBuilder.getQueryAndParameters();
    const [sql, parameters] = query;

    const formattedSql = SqlString.format(sql.toLowerCase(), parameters);

    console.log('\n==================== SQL 执行信息 ====================');
    console.log('SQL:', methodName, '\n', formattedSql);
    if (parameters?.length) {
      console.log('参数:', parameters);
    }
  }
}
