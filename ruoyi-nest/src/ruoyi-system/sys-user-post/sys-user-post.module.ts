import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuoYiShareModule } from '~/ruoyi-share/ruoyi-share.module';
import { SysUserPost } from './entities/sys-user-post.entity';
import { SysUserPostRepository } from './repositories/sys-user-post.repository';

const providers = [SysUserPostRepository];

@Module({
  imports: [RuoYiShareModule, TypeOrmModule.forFeature([SysUserPost])],
  controllers: [],
  providers,
  exports: [SysUserPostRepository],
})
export class SysUserPostModule {}
