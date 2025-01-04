import { GenConstants } from '~/ruoyi-share/constant/GenConstants';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { GenTableColumn } from '~/ruoyi-generator/gen-table-column/entities/gen-table-column.entity';

export class GenTableColumnEntityUtils {
  static isPk(obj: any): boolean {
    return obj.isPk === '1';
  }

  static isIncrement(obj: any): boolean {
    return obj.isIncrement === '1';
  }

  static isRequired(obj: any): boolean {
    return obj.isRequired === '1';
  }

  static isInsert(obj: any): boolean {
    return obj.isInsert === '1';
  }

  static isEdit(obj: any): boolean {
    return obj.isEdit === '1';
  }

  static isList(obj: any): boolean {
    return obj.isList === '1';
  }

  static isQuery(obj: any): boolean {
    return obj.isQuery === '1';
  }

  static isSuperColumn(obj: any): boolean {
    return GenConstants.BASE_ENTITY.some(
      (d) => d.toLowerCase() === obj.tsField.toLowerCase(),
    );
  }

  static isUsableColumn(obj: any): boolean {
    return GenConstants.BASE_ENTITY.some(
      (d) => d.toLowerCase() === obj.tsField.toLowerCase(),
    );
  }

  static readConverterExp(obj: GenTableColumn): string {
    const remarks = StringUtils.substringBetween(obj.columnComment, '（', '）');
    if (StringUtils.isNotEmpty(remarks)) {
      const sb: string[] = [];
      for (const value of remarks.split(' ')) {
        if (StringUtils.isNotEmpty(value)) {
          const startStr = value.substring(0, 1);
          const endStr = value.substring(1);
          sb.push(`${startStr}=${endStr}`);
        }
      }
      return sb.join(',');
    }
    return obj.columnComment;
  }
}
