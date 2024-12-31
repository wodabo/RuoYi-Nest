// src/common/dto/page.dto.ts
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginBodyDto {
    /** 用户名 */
    username: string;

    /** 用户密码 */
    password: string;

    /** 验证码 */
    code?: string;

    /** 唯一标识 */
    uuid?: string;
}