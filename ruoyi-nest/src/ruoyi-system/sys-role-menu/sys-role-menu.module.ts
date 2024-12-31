import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuoYiShareModule } from '~/ruoyi-share/ruoyi-share.module';
import { SysRoleMenu } from './entities/sys-role-menu.entity';
import { SysRoleMenuRepository } from './repositories/sys-role-menu.repository';

const providers = [SysRoleMenuRepository];

@Module({
  imports: [
    RuoYiShareModule,
    TypeOrmModule.forFeature([SysRoleMenu])
  ],
  controllers: [],
  providers,
  exports: [SysRoleMenuRepository]
})
export class SysRoleMenuModule {}
