import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysPostService } from './sys-post.service';
import { RuoYiShareModule } from '~/ruoyi-share/ruoyi-share.module';
import { SysPost } from './entities/sys-post.entity';
import { SysPostRepository } from './repositories/sys-post.repository';
import { SysUserPostModule } from '~/ruoyi-system/sys-user-post/sys-user-post.module';

const providers = [SysPostService, SysPostRepository];

@Module({
  imports: [
    RuoYiShareModule,
    TypeOrmModule.forFeature([SysPost]),
    SysUserPostModule,
  ],
  controllers: [],
  providers,
  exports: [SysPostService, SysPostRepository],
})
export class SysPostModule {}
