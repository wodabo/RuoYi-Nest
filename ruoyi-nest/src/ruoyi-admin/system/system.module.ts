import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysLoginController } from '~/ruoyi-admin/system/sys-login/sys-login.controller';
import { SysDictDataController } from '~/ruoyi-admin/system/sys-dict-data/sys-dict-data.controller';
import { SysDictTypeController } from '~/ruoyi-admin/system/sys-dict-type/sys-dict-type.controller';
import { SysNoticeController } from '~/ruoyi-admin/system/sys-notice/sys-notice.controller';
import { SysConfigController } from '~/ruoyi-admin/system/sys-config/sys-config.controller';
import { SysDeptController } from '~/ruoyi-admin/system/sys-dept/sys-dept.controller';
import { SysRoleController } from '~/ruoyi-admin/system/sys-role/sys-role.controller';
import { SysMenuController } from '~/ruoyi-admin/system/sys-menu/sys-menu.controller';
import { SysPostController } from '~/ruoyi-admin/system/sys-post/sys-post.controller';
import { SysRegisterController } from '~/ruoyi-admin/system/sys-register/sys-register.controller';
import { SysLoginService } from '~/ruoyi-admin/system/sys-login/sys-login.service';
import { SysRegisterService } from '~/ruoyi-admin/system/sys-register/sys-register.service';
import { AuthModule } from '~/ruoyi-framework/auth/auth.module';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { SysUserModule } from '~/ruoyi-system/sys-user/sys-user.module';
import { PermissionModule } from '~/ruoyi-share/permission/permission.module';
import { SysMenuModule } from '~/ruoyi-system/sys-menu/sys-menu.module';
import { SysDictDataModule } from '~/ruoyi-system/sys-dict-data/sys-dict-data.module';
import { SysDictTypeModule } from '~/ruoyi-system/sys-dict-type/sys-dict-type.module';
import { SysUserController } from '~/ruoyi-admin/system/sys-user/sys-user.controller';
import { SysIndexController } from '~/ruoyi-admin/system/sys-index/sys-index.controller';
import { SysDeptModule } from '~/ruoyi-system/sys-dept/sys-dept.module';
import { SysConfigModule } from '~/ruoyi-system/sys-config/sys-config.module';
import { SysNoticeModule } from '~/ruoyi-system/sys-notice/sys-notice.module';
import { RedisModule } from '~/ruoyi-share/redis/redis.module';
import { SysPostModule } from '~/ruoyi-system/sys-post/sys-post.module';
import { SysRoleModule } from '~/ruoyi-system/sys-role/sys-role.module';
import { SysUserPostModule } from '~/ruoyi-system/sys-user-post/sys-user-post.module';
import { SysUserRoleModule } from '~/ruoyi-system/sys-user-role/sys-user-role.module';
import { SysRoleMenuModule } from '~/ruoyi-system/sys-role-menu/sys-role-menu.module';

const providers = [SysLoginService, SysRegisterService];

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([SysUser]),
    SysUserModule,
    PermissionModule,
    SysMenuModule,
    SysDictDataModule,
    SysDictTypeModule,
    SysDeptModule,
    SysConfigModule,
    SysNoticeModule,
    RedisModule,
    SysPostModule,
    SysRoleModule,
    SysUserPostModule,
    SysUserRoleModule,
    SysRoleMenuModule,
  ],
  controllers: [
    SysLoginController,
    SysDictDataController,
    SysDictTypeController,
    SysUserController,
    SysConfigController,
    SysNoticeController,
    SysDeptController,
    SysRoleController,
    SysMenuController,
    SysPostController,
    SysRegisterController,
    SysIndexController,
  ],
  providers,
  exports: [],
})
export class SystemModule {}
