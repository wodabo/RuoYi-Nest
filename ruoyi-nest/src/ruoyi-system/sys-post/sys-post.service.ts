import { Injectable } from '@nestjs/common';
import { SysPostRepository } from './repositories/sys-post.repository';
import { SysPost } from '~/ruoyi-system/sys-post/entities/sys-post.entity';
import { UserConstants } from '~/ruoyi-share/constant/UserConstants';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { SysUserPostRepository } from '../sys-user-post/repositories/sys-user-post.repository';

@Injectable()
export class SysPostService {
  constructor(
    private readonly postRepository: SysPostRepository,
    private readonly userPostRepository: SysUserPostRepository,
  ) {}

  /**
   * 查询岗位信息集合
   */
  async selectPostList(query: SysPost): Promise<[SysPost[], number]> {
    return this.postRepository.selectPostList(query);
  }

  /**
   * 查询所有岗位
   *
   * @returns 岗位列表
   */
  async selectPostAll(): Promise<SysPost[]> {
    return this.postRepository.selectPostAll();
  }

  /**
   * 通过岗位ID查询岗位信息
   *
   * @param postId 岗位ID
   * @return 角色对象信息
   */
  async selectPostById(postId: number): Promise<SysPost> {
    return this.postRepository.selectPostById(postId);
  }

  /**
   * 根据用户ID获取岗位选择框列表
   *
   * @param userId 用户ID
   * @return 选中岗位ID列表
   */
  async selectPostListByUserId(userId: number): Promise<number[]> {
    return this.postRepository.selectPostListByUserId(userId);
  }

  /**
   * 校验岗位名称是否唯一
   *
   * @param post 岗位信息
   * @return 结果
   */
  async checkPostNameUnique(post: SysPost): Promise<boolean> {
    const postId = post.postId ? post.postId : -1;
    const info = await this.postRepository.checkPostNameUnique(post.postName);
    if (info && info.postId !== postId) {
      return UserConstants.NOT_UNIQUE;
    }
    return UserConstants.UNIQUE;
  }

  /**
   * 校验岗位编码是否唯一
   *
   * @param post 岗位信息
   * @return 结果
   */
  async checkPostCodeUnique(post: SysPost): Promise<boolean> {
    const postId = post.postId ? post.postId : -1;
    const info = await this.postRepository.checkPostCodeUnique(post.postCode);
    if (info && info.postId !== postId) {
      return UserConstants.NOT_UNIQUE;
    }
    return UserConstants.UNIQUE;
  }

  /**
   * 通过岗位ID查询岗位使用数量
   *
   * @param postId 岗位ID
   * @return 结果
   */
  async countUserPostById(postId: number): Promise<number> {
    return this.userPostRepository.countUserPostById(postId);
  }

  /**
   * 删除岗位信息
   *
   * @param postId 岗位ID
   * @return 结果
   */
  async deletePostById(postId: number): Promise<number> {
    return this.postRepository.deletePostById(postId);
  }

  /**
   * 批量删除岗位信息
   *
   * @param postIds 需要删除的岗位ID
   * @return 结果
   */
  async deletePostByIds(postIds: number[]): Promise<number> {
    for (const postId of postIds) {
      const post = await this.selectPostById(postId);
      if ((await this.countUserPostById(postId)) > 0) {
        throw new ServiceException(`${post.postName}已分配,不能删除`);
      }
    }
    return this.postRepository.deletePostByIds(postIds);
  }

  /**
   * 新增保存岗位信息
   *
   * @param post 岗位信息
   * @return 结果
   */
  async insertPost(post: SysPost): Promise<number> {
    return this.postRepository.insertPost(post);
  }

  /**
   * 修改保存岗位信息
   *
   * @param post 岗位信息
   * @return 结果
   */
  async updatePost(post: SysPost): Promise<number> {
    return this.postRepository.updatePost(post);
  }
}
