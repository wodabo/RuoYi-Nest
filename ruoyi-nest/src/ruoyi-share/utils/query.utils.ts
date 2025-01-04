import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PageDto } from '~/ruoyi-share/dto/page.dto';

@Injectable()
export class QueryUtils {
  /**
   * 通用查询方法
   * @param queryBuilder TypeORM查询构建器
   * @param pageParams 分页参数
   * @returns Promise<[T[], number] | T[]> 返回分页数据或全量数据
   */
  async executeQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    query?: any,
  ): Promise<[T[], number]> {
    // 处理排序
    if (query?.params?.orderByColumn) {
      const order = query.params.isAsc === 'desc' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`${query.params.orderByColumn}`, order);
    }

    // 判断是否需要分页
    if (query?.params?.pageNum && query?.params?.pageSize) {
      const skip = (query.params.pageNum - 1) * query.params.pageSize;
      queryBuilder.skip(skip).take(query.params.pageSize);

      // 执行分页查询
      const result = await queryBuilder.getManyAndCount();
      return result;
    }

    // 执行全量查询
    const rows = await queryBuilder.getMany();

    return [rows, rows.length];
  }
}
