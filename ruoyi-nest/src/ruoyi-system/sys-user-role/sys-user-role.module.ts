import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuoYiShareModule } from '~/ruoyi-share/ruoyi-share.module';
import { SysUserRole } from './entities/sys-user-role.entity';
import { SysUserRoleRepository } from './repositories/sys-user-role.repository';

const providers = [SysUserRoleRepository];

@Module({
  imports: [
    RuoYiShareModule,
    TypeOrmModule.forFeature([SysUserRole])
  ],
  controllers: [],
  providers,
  exports: [SysUserRoleRepository]
})
export class SysUserRoleModule {}
