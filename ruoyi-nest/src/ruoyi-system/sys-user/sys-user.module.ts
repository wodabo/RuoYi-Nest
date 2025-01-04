import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysUserService } from './sys-user.service';

import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { SysUserRepository } from '~/ruoyi-system/sys-user/repositories/sys-user.repository';
import { SysUserRoleModule } from '~/ruoyi-system/sys-user-role/sys-user-role.module';
import { SysUserPostModule } from '~/ruoyi-system/sys-user-post/sys-user-post.module';
import { SysRoleModule } from '~/ruoyi-system/sys-role/sys-role.module';
import { SysPostModule } from '~/ruoyi-system/sys-post/sys-post.module';
import { SysConfigModule } from '~/ruoyi-system/sys-config/sys-config.module';
import { SysDeptModule } from '~/ruoyi-system/sys-dept/sys-dept.module';

const providers = [SysUserService, SysUserRepository];
@Module({
  imports: [
    SysUserRoleModule,
    SysUserPostModule,
    TypeOrmModule.forFeature([SysUser]),
    SysRoleModule,
    SysPostModule,
    SysConfigModule,
    SysDeptModule,
  ],
  controllers: [],
  providers,
  exports: [SysUserService, SysUserRepository],
})
export class SysUserModule {}
