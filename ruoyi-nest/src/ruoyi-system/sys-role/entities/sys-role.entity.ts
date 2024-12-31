import { Expose } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, AfterLoad, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { SysDept } from '~/ruoyi-system/sys-dept/entities/sys-dept.entity';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Excel, ExcelType, ColumnType } from '~/ruoyi-share/annotation/Excel';

@Entity('sys_role')
export class SysRole extends BaseEntity {
    @PrimaryGeneratedColumn({ 
        name: 'role_id',
        comment: '角色ID' 
    })
    @Excel({
        name: "角色序号", 
        type: ExcelType.EXPORT, 
        cellType: ColumnType.NUMERIC, 
        prompt: "角色编号"
    })
    @ApiPropertyOptional({ description: '角色ID' })
    @IsOptional()
    @IsNumber()
    roleId: number;

    @Column({ 
        name: 'role_name',
        length: 30, 
        comment: '角色名称' 
    })
    @Excel({
        name: "角色名称"
    })
    @ApiPropertyOptional({ description: '角色名称' })
    @IsOptional()
    @IsString()
    roleName: string;

    @Column({ 
        name: 'role_key',
        length: 100, 
        comment: '角色权限字符串' 
    })
    @Excel({
        name: "角色权限"
    })
    @ApiPropertyOptional({ description: '角色权限字符串' })
    @IsOptional()
    @IsString()
    roleKey: string;

    @Column({ 
        name: 'role_sort',
        comment: '显示顺序' 
    })
    @Excel({
        name: "角色排序"
    })
    roleSort: number;

    @Column({ 
        name: 'data_scope',
        length: 1,
        default: '1',
        comment: '数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限）' 
    })
    @Excel({
        name: "数据范围",
        readConverterExp: "1=所有数据权限,2=自定义数据权限,3=本部门数据权限,4=本部门及以下数据权限,5=仅本人数据权限"
    })
    @ApiPropertyOptional({ description: '数据范围' })
    @IsOptional()
    @IsString()
    dataScope: string;

    @Column({ 
        name: 'menu_check_strictly',
        default: true,
        comment: '菜单树选择项是否关联显示' 
    })
    menuCheckStrictly: boolean;

    @Column({ 
        name: 'dept_check_strictly',
        default: true,
        comment: '部门树选择项是否关联显示' 
    })
    deptCheckStrictly: boolean;

    @Column({ 
        name: 'status',
        length: 1, 
        default: '0', 
        comment: '角色状态（0正常 1停用）' 
    })
    @Excel({
        name: "角色状态",
        readConverterExp: "0=正常,1=停用"
    })
    @ApiPropertyOptional({ description: '角色状态' })
    @IsOptional()
    @IsString()
    status: string;

    @Column({ 
        name: 'del_flag',
        length: 1, 
        default: '0', 
        comment: '删除标志（0代表存在 2代表删除）' 
    })
    delFlag: string;

    // 通过中间表关联到部门
    @ManyToMany(() => SysDept)
    @JoinTable({
        name: 'sys_role_dept',
        joinColumn: { name: 'role_id' },
        inverseJoinColumn: { name: 'dept_id' }
    })
    depts: SysDept[];

    @Column({
        name: 'remark',
        length: 500,
        nullable: true,
        comment: '备注'
    })
    remark: string;

    /** 用户是否存在此角色标识 默认不存在 */
    flag: boolean = false;
    @Expose()
    menuIds?: number[];
    @Expose()
    deptIds?: number[];
    @Expose()
    permissions?: string[];

    @Expose()   
    admin: boolean = false;

    @ApiPropertyOptional({ description: '开始时间' })
    @IsOptional()
    @IsString()
    beginTime?: string;

    @ApiPropertyOptional({ description: '结束时间' })
    @IsOptional()
    @IsString()
    endTime?: string;

    @ApiPropertyOptional({ description: '数据范围' })
    @IsOptional()
    @IsString()
    deptAlias?: string;

    @AfterLoad()
    afterLoad() {
        this.admin = this.roleId != null && 1 == this.roleId;
        this.deptIds = null;
        this.menuIds = null;
        this.permissions = null;
    }
}
