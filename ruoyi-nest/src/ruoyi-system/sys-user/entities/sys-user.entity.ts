import { Entity, Column, PrimaryGeneratedColumn, AfterLoad, JoinTable, ManyToMany, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '~/ruoyi-share/entities/base.entity';
import { Expose, Transform } from 'class-transformer';
import { SysRole } from '~/ruoyi-system/sys-role/entities/sys-role.entity';
import { SysDept } from '~/ruoyi-system/sys-dept/entities/sys-dept.entity';
import * as dayjs from 'dayjs';
import { ColumnType, Excel, ExcelType } from '~/ruoyi-share/annotation/Excel';
import { Excels } from '~/ruoyi-share/annotation/Excels';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('sys_user')
export class SysUser extends BaseEntity {
    /** 用户ID */
    @PrimaryGeneratedColumn('increment',{        
        name: 'user_id',
        comment: '用户ID',
    })
    @Excel({
        name: "用户序号", 
        type: ExcelType.EXPORT, 
        cellType: ColumnType.NUMERIC, 
        prompt: "用户编号"
    })
    @ApiPropertyOptional({ description: '用户ID' })
    @IsOptional()
    userId:number;

    /** 用户账号 */
    @Column({ 
        name: 'user_name',
        length: 30, 
        unique: true, 
        comment: '用户账号' 
    })
    @Excel({
        name: "登录名称"
    })
    @ApiPropertyOptional({ description: '用户名称' })
    @IsOptional()
    @IsString()
    userName: string;

    /** 用户昵称 */
    @Column({ 
        name: 'nick_name',
        length: 30, 
        comment: '用户昵称' 
    })
    @Excel({
        name: "用户名称"
    })
    nickName: string;

    /** 用户邮箱 */
    @Column({ 
        name: 'email',
        length: 50, 
        nullable: true, 
        comment: '用户邮箱' 
    })
    @Excel({
        name: "用户邮箱"
    })
    email: string;

    /** 手机号码 */
    @Column({ 
        name: 'phonenumber',
        length: 11, 
        nullable: true, 
        comment: '手机号码' 
    })
    @Excel({
        name: "手机号码",
        cellType: ColumnType.TEXT
    })
    @ApiPropertyOptional({ description: '手机号码' })
    @IsOptional()
    @IsString()
    phonenumber: string;

    /** 用户性别 */
    @Column({ 
        name: 'sex',
        length: 1, 
        comment: '用户性别（0男 1女 2未知）',
        default: '0'
    })
    @Excel({
        name: "用户性别",
        readConverterExp: "0=男,1=女,2=未知"
    })
    sex: string;

    /** 用户头像 */
    @Column({ 
        name: 'avatar',
        length: 100,
        nullable: true,
        comment: '头像地址' 
    })
    avatar: string;

    /** 密码 */
    @Column({ 
        name: 'password',
        length: 100, 
        comment: '密码' 
    })
    password: string;

    /** 帐号状态（0正常 1停用） */
    @Column({ 
        name: 'status',
        length: 1, 
        default: '0', 
        comment: '帐号状态（0正常 1停用）' 
    })
    @Excel({
        name: "帐号状态",
        readConverterExp: "0=正常,1=停用"
    })
    @ApiPropertyOptional({ description: '状态' })
    @IsOptional()
    @IsString()
    status: string;

    /** 删除标志（0代表存在 2代表删除） */
    @Column({ 
        name: 'del_flag',
        length: 1, 
        default: '0', 
        comment: '删除标志（0代表存在 2代表删除）' 
    })
    delFlag: string;

    /** 最后登录IP */
    @Column({ 
        name: 'login_ip', 
        length: 128, 
        nullable: true, 
        comment: '最后登录IP' 
    })
    @Excel({
        name: "最后登录IP",
        type: ExcelType.EXPORT
    })
    loginIp: string;

    /** 最后登录时间 */
    @Column({ 
        name: 'login_date', 
        nullable: true, 
        comment: '最后登录时间',
        type: 'datetime',
        transformer: {
            from(value: string): string {
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
            },
            to(value: Date): Date {
                return value
            },
        }
    })
    @Excel({
        name: "最后登录时间",
        width: 30,
        dateFormat: "YYYY-MM-DD HH:mm:ss",
        type: ExcelType.EXPORT
    })
    loginDate: Date;

    /** 部门ID */
    @Column({ 
        name: 'dept_id',
        nullable: true,
        comment: '部门ID' 
    })
    @Excel({
        name: "部门编号",
        type: ExcelType.IMPORT
    })
    @ApiPropertyOptional({ description: '部门ID' })
    @IsOptional()
    @IsNumber()
    deptId: number;

    /** 备注 */
    @Column({
        name: 'remark',
        length: 500,
        nullable: true,
        comment: '备注'
    })
    remark: string;
  
    /** 部门对象 */
    // @ManyToOne(() => SysDept, dept => dept.users)
    // @JoinColumn({ name: 'dept_id' })
    @Excels([
        {
            name: "部门名称",
            targetAttr: "deptName",
            type: ExcelType.EXPORT
        },
        {
            name: "部门负责人", 
            targetAttr: "leader",
            type: ExcelType.EXPORT
        }
    ])
    dept: SysDept;

    /** 角色对象 */
    roles: SysRole[];

    /** 角色组 */
    @Expose()
    roleIds: number[];

    /** 岗位组 */
    @Expose()
    postIds: number[];

    /** 角色ID */
    @Expose()
    roleId: number;

    @Expose()
    admin: boolean;

    @AfterLoad()
    afterLoad() {
        this.roleIds = this.roles?.map(role => role.roleId) || null;
        this.admin = this.userId !== null && this.userId === 1;
        this.roleId = null
        this.postIds = null
    }
}