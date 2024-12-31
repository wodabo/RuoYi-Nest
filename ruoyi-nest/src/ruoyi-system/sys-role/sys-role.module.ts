import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysRoleService } from './sys-role.service';
import { RuoYiShareModule } from '~/ruoyi-share/ruoyi-share.module';
import { SysRole } from './entities/sys-role.entity';
import { SysRoleRepository } from './repositories/sys-role.repository';
import { SysRoleMenuModule } from '~/ruoyi-system/sys-role-menu/sys-role-menu.module';
import { SysUserRoleModule } from '~/ruoyi-system/sys-user-role/sys-user-role.module';
import { SysRoleDeptModule } from '~/ruoyi-system/sys-role-dept/sys-role-dept.module';

const providers = [SysRoleService, SysRoleRepository];

@Module({
  imports: [
    RuoYiShareModule,
    TypeOrmModule.forFeature([SysRole]),
    SysRoleMenuModule,
    SysUserRoleModule,
    SysRoleDeptModule
  ],
  controllers: [],
  providers,
  exports: [SysRoleService,SysRoleRepository]
})
export class SysRoleModule {}
