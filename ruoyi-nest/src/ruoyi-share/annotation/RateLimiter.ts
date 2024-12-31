import { SetMetadata } from '@nestjs/common';
import { LimitType } from '../enums/LimitType';
import { CacheConstants } from '../constant/CacheConstants';

/**
 * 限流注解
 * 
 * @author ruoyi
 */
export interface RateLimiterOptions {
    /**
     * 限流key
     */
    key?: string;

    /**
     * 限流时间,单位秒
     */
    time?: number;

    /**
     * 限流次数
     */
    count?: number;

    /**
     * 限流类型
     */
    limitType?: LimitType;
}

export const RATE_LIMITER_KEY = 'rate_limiter';

export const RateLimiter = (options: RateLimiterOptions = {
    key: CacheConstants.RATE_LIMIT_KEY,
    time: 60,
    count: 100,
    limitType: LimitType.DEFAULT
}) => SetMetadata(RATE_LIMITER_KEY, options);