import { SetMetadata } from '@nestjs/common';
import { BusinessType } from '../enums/BusinessType';
import { OperatorType } from '../enums/OperatorType';

/**
 * 自定义操作日志记录注解
 *
 * @author ruoyi
 */
export interface LogOptions {
  /** 模块 */
  title?: string;

  /** 功能 */
  businessType?: BusinessType;

  /** 操作人类别 */
  operatorType?: OperatorType;

  /** 是否保存请求的参数 */
  isSaveRequestData?: boolean;

  /** 是否保存响应的参数 */
  isSaveResponseData?: boolean;

  /** 排除指定的请求参数 */
  excludeParamNames?: string[];
}

export const LOG_KEY = 'log';

export const Log = (
  options: LogOptions = {
    title: '',
    businessType: BusinessType.OTHER,
    operatorType: OperatorType.MANAGE,
    isSaveRequestData: true,
    isSaveResponseData: true,
    excludeParamNames: [],
  },
) => SetMetadata(LOG_KEY, options);
