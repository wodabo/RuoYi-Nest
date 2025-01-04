import { SetMetadata } from '@nestjs/common';

/**
 * 匿名访问不鉴权注解
 *
 * @author ruoyi
 */
export const ANONYMOUS_KEY = 'anonymous';

export const Anonymous = () => SetMetadata(ANONYMOUS_KEY, true);
