import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysNotice } from '../entities/sys-notice.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';

@Injectable()
export class SysNoticeRepository {
  constructor(
    @InjectRepository(SysNotice)
    private readonly noticeRepository: Repository<SysNotice>,
    private readonly queryUtils: QueryUtils,
    private readonly sqlLoggerUtils: SqlLoggerUtils,
  ) {}

  private selectNoticeVo(): SelectQueryBuilder<SysNotice> {
    return this.noticeRepository
      .createQueryBuilder('n')
      .select([
        'n.noticeId',
        'n.noticeTitle',
        'n.noticeContent',
        'n.noticeType',
        'n.status',
        'n.createBy',
        'n.createTime',
        'n.updateBy',
        'n.updateTime',
        'n.remark',
      ]);
  }

  /**
   * 查询公告信息
   */
  async selectNoticeById(noticeId: number): Promise<SysNotice> {
    const queryBuilder = this.selectNoticeVo().where('n.noticeId = :noticeId', {
      noticeId,
    });

    this.sqlLoggerUtils.log(queryBuilder, 'selectNoticeById');
    return queryBuilder.getOne();
  }

  /**
   * 查询公告列表
   */
  async selectNoticeList(query: SysNotice): Promise<[SysNotice[], number]> {
    const queryBuilder = this.selectNoticeVo();

    if (query.noticeTitle) {
      queryBuilder.andWhere('n.noticeTitle LIKE :noticeTitle', {
        noticeTitle: `%${query.noticeTitle}%`,
      });
    }

    if (query.noticeType) {
      queryBuilder.andWhere('n.noticeType = :noticeType', {
        noticeType: query.noticeType,
      });
    }

    if (query.createBy) {
      queryBuilder.andWhere('n.createBy LIKE :createBy', {
        createBy: `%${query.createBy}%`,
      });
    }

    this.sqlLoggerUtils.log(queryBuilder, 'selectNoticeList');
    return this.queryUtils.executeQuery(queryBuilder, query);
  }

  /**
   * 新增公告
   */
  async insertNotice(notice: SysNotice): Promise<SysNotice> {
    const insertObj: any = {};
    if (notice.noticeTitle) insertObj.noticeTitle = notice.noticeTitle;
    if (notice.noticeType) insertObj.noticeType = notice.noticeType;
    if (notice.noticeContent) insertObj.noticeContent = notice.noticeContent;
    if (notice.status) insertObj.status = notice.status;
    if (notice.remark) insertObj.remark = notice.remark;
    if (notice.createBy) insertObj.createBy = notice.createBy;
    insertObj.createTime = new Date();

    const queryBuilder = this.noticeRepository
      .createQueryBuilder('n')
      .insert()
      .into(SysNotice)
      .values(insertObj);

    this.sqlLoggerUtils.log(queryBuilder, 'insertNotice');
    const result = await queryBuilder.execute();
    return this.noticeRepository.create({
      ...notice,
      noticeId: result.identifiers[0].noticeId,
    });
  }

  /**
   * 修改公告
   */
  async updateNotice(notice: SysNotice): Promise<boolean> {
    const updateData: any = {
      updateTime: new Date(), // 更新时间总是需要更新的
    };

    if (notice.noticeTitle) updateData.noticeTitle = notice.noticeTitle;
    if (notice.noticeType) updateData.noticeType = notice.noticeType;
    if (notice.noticeContent) updateData.noticeContent = notice.noticeContent;
    if (notice.status) updateData.status = notice.status;
    if (notice.remark) updateData.remark = notice.remark;
    if (notice.updateBy) updateData.updateBy = notice.updateBy;

    const queryBuilder = this.noticeRepository
      .createQueryBuilder('n')
      .update(SysNotice)
      .set(updateData)
      .where('noticeId = :noticeId', { noticeId: notice.noticeId });

    this.sqlLoggerUtils.log(queryBuilder, 'updateNotice');
    const result = await queryBuilder.execute();
    return result.affected > 0;
  }

  /**
   * 删除公告信息
   */
  async deleteNoticeById(noticeId: number): Promise<boolean> {
    const queryBuilder = this.noticeRepository
      .createQueryBuilder('n')
      .delete()
      .from(SysNotice)
      .where('noticeId = :noticeId', { noticeId });

    this.sqlLoggerUtils.log(queryBuilder, 'deleteNoticeById');
    const result = await queryBuilder.execute();
    return result.affected > 0;
  }

  /**
   * 批量删除公告信息
   */
  async deleteNoticeByIds(noticeIds: number[]): Promise<boolean> {
    const queryBuilder = this.noticeRepository
      .createQueryBuilder('n')
      .delete()
      .from(SysNotice)
      .whereInIds(noticeIds);

    this.sqlLoggerUtils.log(queryBuilder, 'deleteNoticeByIds');
    const result = await queryBuilder.execute();
    return result.affected > 0;
  }
}
