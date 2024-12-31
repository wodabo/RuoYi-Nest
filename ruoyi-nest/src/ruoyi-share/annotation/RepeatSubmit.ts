import { SetMetadata } from '@nestjs/common';

/**
 * 自定义注解防止表单重复提交
 * 
 * @author ruoyi
 */
export interface RepeatSubmitOptions {
    /**
     * 间隔时间(ms)，小于此时间视为重复提交
     */
    interval?: number;

    /**
     * 提示消息
     */
    message?: string;
}

export const REPEAT_SUBMIT_KEY = 'repeat_submit';

export const RepeatSubmit = (options: RepeatSubmitOptions = {
    interval: 5000,
    message: '不允许重复提交，请稍候再试'
}) => SetMetadata(REPEAT_SUBMIT_KEY, options);