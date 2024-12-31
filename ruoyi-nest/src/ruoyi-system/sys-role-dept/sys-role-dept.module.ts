import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysRoleDept } from './entities/sys-role-dept.entity';
import { SysRoleDeptRepository } from './repositories/sys-role-dept.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SysRoleDept])
  ],
  controllers: [],
  providers: [SysRoleDeptRepository],
  exports: [SysRoleDeptRepository]
})
export class SysRoleDeptModule {}
