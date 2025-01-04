import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';

@Entity('sys_notice')
export class SysNotice extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'notice_id',
    comment: '公告ID',
  })
  noticeId: number;

  @Column({
    name: 'notice_title',
    length: 50,
    comment: '公告标题',
  })
  noticeTitle: string;

  @Column({
    name: 'notice_type',
    length: 1,
    comment: '公告类型（1通知 2公告）',
  })
  noticeType: string;

  @Column({
    name: 'notice_content',
    type: 'longblob',
    comment: '公告内容',
    transformer: {
      from: (value: Buffer) => value?.toString('utf8'),
      to: (value: string) => value,
    },
  })
  noticeContent: string;

  @Column({
    name: 'status',
    length: 1,
    comment: '公告状态（0正常 1关闭）',
  })
  status: string;
}
