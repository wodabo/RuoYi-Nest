import { Excel, ExcelOptions } from './Excel';

/**
 * Excel注解集
 *
 * @author ruoyi
 */
export function Excels(excels: ExcelOptions[]) {
  return function (target: any, propertyKey: string) {
    excels.forEach((options) => {
      Excel(options)(target, propertyKey);
    });
  };
}
