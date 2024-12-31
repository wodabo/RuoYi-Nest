import { SetMetadata } from '@nestjs/common';
import { DesensitizedType } from '../enums/DesensitizedType';

/**
 * 数据脱敏注解
 *
 * @author ruoyi
 */
export interface SensitiveOptions {
    /**
     * 脱敏类型
     */
    desensitizedType: DesensitizedType;
}

export const SENSITIVE_KEY = 'sensitive';

export const Sensitive = (options: SensitiveOptions) => SetMetadata(SENSITIVE_KEY, options);