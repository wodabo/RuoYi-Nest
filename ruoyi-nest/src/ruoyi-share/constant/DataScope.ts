/**
 * 数据权限常量信息
 *
 */
export class DataScope {
  /**
   * 全部数据权限
   */
  public static readonly DATA_SCOPE_ALL: string = '1';

  /**
   * 自定数据权限
   */
  public static readonly DATA_SCOPE_CUSTOM: string = '2';

  /**
   * 部门数据权限
   */
  public static readonly DATA_SCOPE_DEPT: string = '3';

  /**
   * 部门及以下数据权限
   */
  public static readonly DATA_SCOPE_DEPT_AND_CHILD: string = '4';

  /**
   * 仅本人数据权限
   */
  public static readonly DATA_SCOPE_SELF: string = '5';

  /**
   * 数据权限过滤关键字
   */
  public static readonly DATA_SCOPE: string = 'dataScope';
}
