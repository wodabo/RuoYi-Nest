import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysPost } from '../entities/sys-post.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';

@Injectable()
export class SysPostRepository {
  constructor(
    @InjectRepository(SysPost)
    private readonly postRepository: Repository<SysPost>,
    private readonly queryUtils: QueryUtils,
    private readonly sqlLoggerUtils: SqlLoggerUtils,
  ) {}

  private selectPostVo(): SelectQueryBuilder<SysPost> {
    return this.postRepository
      .createQueryBuilder('p')
      .select([
        'p.postId',
        'p.postCode',
        'p.postName',
        'p.postSort',
        'p.status',
        'p.createBy',
        'p.createTime',
        'p.remark',
      ]);
  }

  async selectPostList(query: SysPost): Promise<[SysPost[], number]> {
    const queryBuilder = this.selectPostVo();

    if (query.postCode) {
      queryBuilder.andWhere('p.postCode LIKE :postCode', {
        postCode: `%${query.postCode}%`,
      });
    }
    if (query.postName) {
      queryBuilder.andWhere('p.postName LIKE :postName', {
        postName: `%${query.postName}%`,
      });
    }
    if (query.status) {
      queryBuilder.andWhere('p.status = :status', { status: query.status });
    }

    this.sqlLoggerUtils.log(queryBuilder, 'selectPostList');
    return this.queryUtils.executeQuery(queryBuilder, query);
  }

  async selectPostAll(): Promise<SysPost[]> {
    const queryBuilder = this.selectPostVo();
    this.sqlLoggerUtils.log(queryBuilder, 'selectPostAll');
    return queryBuilder.getMany();
  }

  async selectPostById(postId: number): Promise<SysPost> {
    const queryBuilder = this.selectPostVo().where('p.postId = :postId', {
      postId,
    });

    this.sqlLoggerUtils.log(queryBuilder, 'selectPostById');
    return queryBuilder.getOne();
  }

  async selectPostListByUserId(userId: number): Promise<number[]> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('p')
      .select('p.postId')
      .leftJoin('sys_user_post', 'up', 'up.post_id = p.post_id')
      .leftJoin('sys_user', 'u', 'u.user_id = up.user_id')
      .where('u.user_id = :userId', { userId });

    this.sqlLoggerUtils.log(queryBuilder, 'selectPostListByUserId');
    const posts = await queryBuilder.getRawMany();

    return posts.map((post) => parseInt(post.p_post_id));
  }

  async selectPostsByUserName(userName: string): Promise<SysPost[]> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('p')
      .select(['p.postId', 'p.postName', 'p.postCode'])
      .leftJoin('sys_user_post', 'up', 'up.post_id = p.post_id')
      .leftJoin('sys_user', 'u', 'u.user_id = up.user_id')
      .where('u.user_name = :userName', { userName });

    this.sqlLoggerUtils.log(queryBuilder, 'selectPostsByUserName');
    return queryBuilder.getMany();
  }

  async checkPostNameUnique(postName: string): Promise<SysPost> {
    const queryBuilder = this.selectPostVo().where('p.postName = :postName', {
      postName,
    });

    this.sqlLoggerUtils.log(queryBuilder, 'checkPostNameUnique');
    return queryBuilder.getOne();
  }

  async checkPostCodeUnique(postCode: string): Promise<SysPost> {
    const queryBuilder = this.selectPostVo().where('p.postCode = :postCode', {
      postCode,
    });

    this.sqlLoggerUtils.log(queryBuilder, 'checkPostCodeUnique');
    return queryBuilder.getOne();
  }

  async updatePost(post: SysPost): Promise<number> {
    const queryBuilder = this.postRepository
      .createQueryBuilder()
      .update(SysPost)
      .set({
        postCode: post.postCode,
        postName: post.postName,
        postSort: post.postSort,
        status: post.status,
        remark: post.remark,
        updateBy: post.updateBy,
        updateTime: new Date(),
      })
      .where('postId = :postId', { postId: post.postId });

    this.sqlLoggerUtils.log(queryBuilder, 'updatePost');
    const result = await queryBuilder.execute();
    return result.affected;
  }

  async insertPost(post: SysPost): Promise<number> {
    const queryBuilder = this.postRepository
      .createQueryBuilder()
      .insert()
      .into(SysPost)
      .values({
        postId: post.postId,
        postCode: post.postCode,
        postName: post.postName,
        postSort: post.postSort,
        status: post.status,
        remark: post.remark,
        createBy: post.createBy,
        createTime: new Date(),
      });

    this.sqlLoggerUtils.log(queryBuilder, 'insertPost');
    const result = await queryBuilder.execute();
    return result.identifiers[0].postId;
  }

  async deletePostById(postId: number): Promise<number> {
    const queryBuilder = this.postRepository
      .createQueryBuilder()
      .delete()
      .from(SysPost)
      .where('postId = :postId', { postId });

    this.sqlLoggerUtils.log(queryBuilder, 'deletePostById');
    const result = await queryBuilder.execute();
    return result.affected;
  }

  async deletePostByIds(postIds: number[]): Promise<number> {
    const queryBuilder = this.postRepository
      .createQueryBuilder()
      .delete()
      .from(SysPost)
      .where('postId IN (:...postIds)', { postIds });

    this.sqlLoggerUtils.log(queryBuilder, 'deletePostByIds');
    const result = await queryBuilder.execute();
    return result.affected;
  }
}
