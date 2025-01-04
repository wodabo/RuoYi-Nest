// src/common/dto/page.dto.ts
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LoginBodyDto } from './login-body.dto';
export class RegisterBodyDto extends LoginBodyDto {}
