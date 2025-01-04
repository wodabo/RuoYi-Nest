// src/common/dto/page.dto.ts
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PageDto {
  /** 当前记录起始索引 */
  @ApiProperty({ description: '页码', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageNum?: number = 1;

  /** 每页显示记录数 */
  @ApiProperty({ description: '每页数量', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number = 10;

  /** 排序列 */
  @ApiProperty({ description: '排序列', required: false })
  @IsString()
  @IsOptional()
  orderByColumn?: string;

  /** 排序的方向desc或者asc */
  @ApiProperty({
    description: '排序方向(asc/desc)',
    default: 'asc',
    required: false,
  })
  @IsString()
  @IsOptional()
  isAsc?: string = 'asc';
}
