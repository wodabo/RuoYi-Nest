import { Injectable } from '@nestjs/common';
import { Repository, In, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysUserPost } from '../entities/sys-user-post.entity';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';

@Injectable()
export class SysUserPostRepository {
    constructor(
        @InjectRepository(SysUserPost)
        private readonly userPostRepository: Repository<SysUserPost>,
        private readonly sqlLoggerUtils: SqlLoggerUtils,
        private readonly contextHolderUtils: ContextHolderUtils
    ) {}

    /**
     * 通过用户ID删除用户和岗位关联
     * 
     * @param userId 用户ID
     * @return 结果
     */
    async deleteUserPostByUserId(userId: number): Promise<number> {
        const queryBuilder = this.userPostRepository.createQueryBuilder()
            .delete()
            .from(SysUserPost)
            .where('userId = :userId', { userId });

        this.sqlLoggerUtils.log(queryBuilder, 'deleteUserPostByUserId');
        const result = await queryBuilder.execute();
        return result.affected;
    }

    /**
     * 通过岗位ID查询岗位使用数量
     * 
     * @param postId 岗位ID
     * @return 结果
     */
    async countUserPostById(postId: number): Promise<number> {
        const queryBuilder = this.userPostRepository.createQueryBuilder('up')
            .where('up.postId = :postId', { postId });

        this.sqlLoggerUtils.log(queryBuilder, 'countUserPostById');
        return queryBuilder.getCount();
    }

    /**
     * 批量删除用户和岗位关联
     * 
     * @param userIds 需要删除的数据ID
     * @return 结果
     */
    async deleteUserPost(userIds: number[]): Promise<number> {
        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.userPostRepository.manager;
        const queryBuilder = entityManager.createQueryBuilder()
            .delete()
            .from(SysUserPost)
            .where('userId IN (:...userIds)', { userIds });

        this.sqlLoggerUtils.log(queryBuilder, 'deleteUserPost');
        const result = await queryBuilder.execute();
        return result.affected;
    }

    /**
     * 批量新增用户岗位信息
     * 
     * @param userPostList 用户岗位列表
     * @return 结果
     */
    async batchUserPost(userPostList: SysUserPost[]): Promise<number> {
        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.userPostRepository.manager;
        const queryBuilder = entityManager.createQueryBuilder()
            .insert()
            .into(SysUserPost)
            .values(userPostList);

        this.sqlLoggerUtils.log(queryBuilder, 'batchUserPost');
        const result = await queryBuilder.execute();
        return result.identifiers.length;
    }
}
