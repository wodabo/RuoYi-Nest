import { Test, TestingModule } from '@nestjs/testing';
import { SysUserRoleController } from './sys-user-role.controller';
import { SysUserRoleService } from './sys-user-role.service';

describe('SysUserRoleController', () => {
  let controller: SysUserRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SysUserRoleController],
      providers: [SysUserRoleService],
    }).compile();

    controller = module.get<SysUserRoleController>(SysUserRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
