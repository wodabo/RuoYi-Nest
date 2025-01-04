import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysMenuService } from './sys-menu.service';
import { RuoYiShareModule } from '~/ruoyi-share/ruoyi-share.module';
import { SysMenu } from './entities/sys-menu.entity';
import { SysMenuRepository } from './repositories/sys-menu.repository';
import { SysRoleModule } from '~/ruoyi-system/sys-role/sys-role.module';
import { SysRoleMenuModule } from '~/ruoyi-system/sys-role-menu/sys-role-menu.module';

const providers = [SysMenuService, SysMenuRepository];

@Module({
  imports: [
    RuoYiShareModule,
    TypeOrmModule.forFeature([SysMenu]),
    SysRoleModule,
    SysRoleMenuModule,
  ],
  controllers: [],
  providers,
  exports: [SysMenuService],
})
export class SysMenuModule {}
