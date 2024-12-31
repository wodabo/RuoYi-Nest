import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { Excel, ExcelType, ColumnType } from '~/ruoyi-share/annotation/Excel';
import { Excels } from '~/ruoyi-share/annotation/Excels';
import 'reflect-metadata';
import * as dayjs from 'dayjs';

@Injectable()
export class ExcelUtils {

  /**
   * 导出Excel
   */
  async exportExcel(res: Response, list: any[], sheetName: string, clazz: any) {
    // 创建工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);


    // 获取类的元数据
    const excelFields = (Reflect.getMetadata('excel', clazz) || [])
      .filter(field => field.options.isExport); // 过滤掉导入类型的字段

    // 设置表头
    const headers = excelFields.map(field => {
      return {
        header: field.options.name,
        key: field.options.targetAttr || field.property,
        width: field.options.width
      };
    });

    worksheet.columns = headers;

    // 添加数据
    list.forEach(item => {
      const row = {};
      excelFields.forEach(field => {
        let value;
        if (field.options.targetAttr) {
          // 处理嵌套对象的属性
          const props = field.property.split('.');
          let obj = item;
          for (const prop of props) {
            obj = obj?.[prop];
          }
          value = obj?.[field.options.targetAttr];
        } else {
          value = item[field.property];
        }
        
        // 处理不同的列类型
        if (field.options.cellType === ColumnType.NUMERIC) {
          row[field.options.targetAttr || field.property] = Number(value);
        } else if (field.options.dateFormat && value) {
          row[field.options.targetAttr || field.property] = dayjs(value).format(field.options.dateFormat);
        } else if (field.options.readConverterExp) {
          row[field.options.targetAttr || field.property] = this.convertByExp(value, field.options.readConverterExp);
        } else {
          row[field.options.targetAttr || field.property] = value;
        }
      });
      worksheet.addRow(row);
    });

    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + encodeURIComponent(sheetName) + '.xlsx'
    );

    // 写入响应
    await workbook.xlsx.write(res);
  }

  /**
   * 解析导出值 0=男,1=女,2=未知
   */
  private convertByExp(propertyValue: string, converterExp: string): string {
    if (!propertyValue || !converterExp) {
      return propertyValue;
    }

    const convertSource = converterExp.split(',');
    for (const item of convertSource) {
      const [key, value] = item.split('=');
      if (key === propertyValue) {
        return value;
      }
    }
    return propertyValue;
  }

  /**
   * 导入Excel
   */
  async importExcel(buffer: Buffer, clazz: any): Promise<any[]> {
    // 创建工作簿
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    // 获取第一个工作表
    const worksheet = workbook.worksheets[0];

    // 获取类的元数据
    const excelFields = (Reflect.getMetadata('excel', clazz) || [])
      .filter(field => field.options.type !== ExcelType.EXPORT); // 过滤掉导出类型的字段

    // 获取表头映射
    const headerMap = new Map<number, any>();
    const headers: any = worksheet.getRow(1).values;
    excelFields.forEach(field => {
      const columnIndex = headers.indexOf(field.options.name);
      if (columnIndex > 0) {
        headerMap.set(columnIndex, field);
      }
    });

    const results = [];

    // 从第二行开始读取数据
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (this.isRowEmpty(row)) {
        continue;
      }

      const item = new clazz();
      headerMap.forEach((field, columnIndex) => {
        let value:any = row.getCell(columnIndex).value;

        // 处理超链接对象
        if (value && typeof value === 'object' && value.text) {
          value = value.text;
        }

        // 处理不同的列类型
        if (field.options.cellType === ColumnType.NUMERIC) {
          value = Number(value);
        } else if (field.options.dateFormat && value) {
          value = dayjs(value).toDate();
        } else if (field.options.readConverterExp) {
          value = this.reverseByExp(value, field.options.readConverterExp);
        }

        if (field.options.targetAttr) {
          // 处理嵌套对象的属性
          const props = field.property.split('.');
          let obj = item;
          for (let i = 0; i < props.length - 1; i++) {
            if (!obj[props[i]]) {
              obj[props[i]] = {};
            }
            obj = obj[props[i]];
          }
          obj[field.options.targetAttr] = value;
        } else {
          item[field.property] = value;
        }
      });

      results.push(item);
    }

    return results;
  }

  /**
   * 反向解析值 男=0,女=1,未知=2
   */
  private reverseByExp(propertyValue: string, converterExp: string): string {
    if (!propertyValue || !converterExp) {
      return propertyValue;
    }

    const convertSource = converterExp.split(',');
    for (const item of convertSource) {
      const [key, value] = item.split('=');
      if (value === propertyValue) {
        return key;
      }
    }
    return propertyValue;
  }

  /**
   * 判断是否是空行
   */
  private isRowEmpty(row: ExcelJS.Row): boolean {
    if (!row) {
      return true;
    }
    const values:any = row.values;
    return values.every(value => !value);
  }
}
