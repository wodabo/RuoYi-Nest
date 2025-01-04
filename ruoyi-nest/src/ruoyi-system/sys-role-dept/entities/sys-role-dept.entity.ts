import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sys_role_dept')
export class SysRoleDept {
  @PrimaryGeneratedColumn({
    name: 'role_id',
    comment: '角色ID',
  })
  roleId: number;

  @Column({
    name: 'dept_id',
    comment: '部门ID',
  })
  deptId: number;
}
