import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('sys_user_post')
export class SysUserPost {
  @PrimaryColumn({
    name: 'user_id',
    comment: '用户ID',
  })
  userId: number;

  @PrimaryColumn({
    name: 'post_id',
    comment: '岗位ID',
  })
  postId: number;
}
