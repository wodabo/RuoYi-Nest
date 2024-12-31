import { Module } from '@nestjs/common';
import { SysUserModule } from './sys-user/sys-user.module';
import { SysRoleModule } from './sys-role/sys-role.module';
import { SysPostModule } from './sys-post/sys-post.module';
import { SysDeptModule } from './sys-dept/sys-dept.module';
import { SysMenuModule } from './sys-menu/sys-menu.module';
import { SysUserRoleModule } from './sys-user-role/sys-user-role.module';
import { SysDictDataModule } from './sys-dict-data/sys-dict-data.module';
import { SysDictTypeModule } from './sys-dict-type/sys-dict-type.module';
import { SysRoleDeptModule } from './sys-role-dept/sys-role-dept.module';
import { SysConfigModule } from './sys-config/sys-config.module';
import { SysNoticeModule } from './sys-notice/sys-notice.module';
@Module({
  imports: [
    SysUserModule,
    SysRoleModule,
    SysPostModule,
    SysDeptModule,
    SysMenuModule,
    SysUserRoleModule,
    SysDictDataModule,
    SysDictTypeModule,
    SysRoleDeptModule,
    SysConfigModule,
    SysNoticeModule,
  ]
})
export class RuoYiSystemModule {}
