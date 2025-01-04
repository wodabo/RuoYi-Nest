import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysDeptService } from './sys-dept.service';

import { SysDept } from './entities/sys-dept.entity';
import { SysDeptRepository } from './repositories/sys-dept.repository';
import { SysRoleDeptModule } from '~/ruoyi-system/sys-role-dept/sys-role-dept.module';
import { SysRoleModule } from '~/ruoyi-system/sys-role/sys-role.module';
import { SysUserService } from '~/ruoyi-system/sys-user/sys-user.service';
import { SysUserRepository } from '~/ruoyi-system/sys-user/repositories/sys-user.repository';
import { SysUser } from '../sys-user/entities/sys-user.entity';
import { SysUserRoleModule } from '~/ruoyi-system/sys-user-role/sys-user-role.module';
import { SysUserPostModule } from '~/ruoyi-system/sys-user-post/sys-user-post.module';
import { SysPostModule } from '~/ruoyi-system/sys-post/sys-post.module';
import { SysConfigModule } from '~/ruoyi-system/sys-config/sys-config.module';

const providers = [
  SysDeptService,
  SysDeptRepository,
  SysUserService,
  SysUserRepository,
];

@Module({
  imports: [
    SysRoleDeptModule,
    TypeOrmModule.forFeature([SysDept, SysUser]),
    SysRoleModule,
    SysUserRoleModule,
    SysUserPostModule,
    SysPostModule,
    SysConfigModule,
  ],
  controllers: [],
  providers,
  exports: [SysDeptService],
})
export class SysDeptModule {}
