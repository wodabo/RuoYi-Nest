import 'reflect-metadata';

export enum ExcelType {
  ALL = 0,
  EXPORT = 1,
  IMPORT = 2,
}

export enum ColumnType {
  NUMERIC = 0,
  STRING = 1,
  IMAGE = 2,
  TEXT = 3,
}

// excel.interface.ts
export interface ExcelOptions {
  /**
   * 导出时在excel中排序
   */
  sort?: number;

  /**
   * 导出到Excel中的名字
   */
  name?: string;

  /**
   * 日期格式, 如: yyyy-MM-dd
   */
  dateFormat?: string;

  /**
   * 字典类型
   */
  dictType?: string;

  /**
   * 读取内容转表达式 (如: 0=男,1=女,2=未知)
   */
  readConverterExp?: string;

  /**
   * 分隔符
   */
  separator?: string;

  /**
   * BigDecimal 精度
   */
  scale?: number;

  /**
   * BigDecimal 舍入规则
   */
  roundingMode?: number;

  /**
   * 列高度
   */
  height?: number;

  /**
   * 列宽度
   */
  width?: number;

  /**
   * 文字后缀
   */
  suffix?: string;

  /**
   * 默认值
   */
  defaultValue?: string;

  /**
   * 提示信息
   */
  prompt?: string;

  /**
   * 下拉选项
   */
  combo?: string[];

  /**
   * 是否从字典读数据到combo
   */
  comboReadDict?: boolean;

  /**
   * 是否需要合并单元格
   */
  needMerge?: boolean;

  /**
   * 是否导出数据
   */
  isExport?: boolean;

  /**
   * 关联属性
   */
  targetAttr?: string;

  /**
   * 是否自动统计
   */
  isStatistics?: boolean;

  /**
   * 单元格类型
   */
  cellType?: ColumnType;

  /**
   * 表头背景色
   */
  headerBackgroundColor?: string;

  /**
   * 表头字体颜色
   */
  headerColor?: string;

  /**
   * 单元格背景色
   */
  backgroundColor?: string;

  /**
   * 单元格字体颜色
   */
  color?: string;

  /**
   * 对齐方式
   */
  align?: 'left' | 'center' | 'right';

  /**
   * 自定义处理器
   */
  handler?: new () => ExcelHandlerAdapter;

  /**
   * 处理器参数
   */
  args?: string[];

  /**
   * 字段类型
   */
  type?: ExcelType;
}

export interface ExcelHandlerAdapter {
  format(value: any, args: string[]): any;
}

export function Excel(options: ExcelOptions = {}) {
  return function (target: any, propertyKey: string) {
    // 设置默认值
    const defaultOptions: ExcelOptions = {
      sort: Number.MAX_VALUE,
      width: 16,
      height: 14,
      type: ExcelType.ALL,
      cellType: ColumnType.STRING,
      isExport: true,
      align: 'center',
      scale: -1,
      ...options,
    };

    // 保存元数据
    if (!Reflect.hasMetadata('excel', target.constructor)) {
      Reflect.defineMetadata('excel', [], target.constructor);
    }

    const excelFields = Reflect.getMetadata('excel', target.constructor) || [];
    excelFields.push({
      property: propertyKey,
      options: defaultOptions,
    });

    Reflect.defineMetadata('excel', excelFields, target.constructor);
  };
}
