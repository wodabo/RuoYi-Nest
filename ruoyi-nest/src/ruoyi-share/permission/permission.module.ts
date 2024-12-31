import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysPermissionService } from './sys-permission.service';
import { SysRoleModule } from '~/ruoyi-system/sys-role/sys-role.module';
import { SysMenuModule } from '~/ruoyi-system/sys-menu/sys-menu.module';
import { PermissionValidatorService } from './permission-validator.service';

const providers = [SysPermissionService,PermissionValidatorService];

@Module({
  imports: [
    SysRoleModule,
    SysMenuModule
  ],
  controllers: [],
  providers,
  exports: [SysPermissionService,PermissionValidatorService]
})
export class PermissionModule {}
