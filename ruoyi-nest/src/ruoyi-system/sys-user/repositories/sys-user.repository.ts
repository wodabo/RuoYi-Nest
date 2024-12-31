import { Injectable } from '@nestjs/common';
import { Repository, DataSource, SelectQueryBuilder, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SensitiveUtils } from '~/ruoyi-share/utils/sensitive.utils';
import { DataScopeUtils } from '~/ruoyi-share/utils/data-scope.utils';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';

@Injectable()
export class SysUserRepository {

    constructor(
        @InjectRepository(SysUser)
        private readonly userRepository: Repository<SysUser>,
        private readonly queryUtils: QueryUtils,
        private readonly dataScopeUtils: DataScopeUtils,
        private readonly sqlLoggerUtils: SqlLoggerUtils,    
        private readonly securityUtils: SecurityUtils,
        private readonly contextHolderUtils: ContextHolderUtils
    ) {}



    selectUserVo() {
        return this.userRepository
            .createQueryBuilder('u')
            .leftJoinAndMapOne('u.dept', 'sys_dept', 'd', 'u.dept_id = d.dept_id')
            .leftJoin('sys_user_role', 'ur', 'u.user_id = ur.user_id')
            .leftJoinAndMapMany('u.roles', 'sys_role', 'r', 'r.role_id = ur.role_id')
            .select([
                // 用户字段
                'u.userId',
                'u.deptId',
                'u.userName',
                'u.nickName',
                'u.email',
                'u.avatar',
                'u.phonenumber',
                'u.password',
                'u.sex',
                'u.status',
                'u.delFlag',
                'u.loginIp',
                'u.loginDate',
                'u.createBy',
                'u.createTime',
                // 'u.updateBy',
                // 'u.updateTime',
                'u.remark',
                // 部门字段
                'd.deptId',
                'd.parentId',
                'd.ancestors',
                'd.deptName',
                'd.orderNum',
                'd.leader',
                'd.status',
                // 角色字段
                'r.roleId',
                'r.roleName',
                'r.roleKey',
                'r.roleSort',
                'r.dataScope',
                'r.status',
            ])
    }
 
    /**
     * 根据条件分页查询用户列表
     */
    async selectUserList(query: SysUser): Promise<[SysUser[],number]> {
        const queryBuilder = this.userRepository.createQueryBuilder('u')
            .leftJoinAndMapOne('u.dept', 'sys_dept', 'd', 'u.dept_id = d.dept_id')
            .select([
                'u.userId',
                'u.deptId',
                'u.userName', 
                'u.nickName',
                'u.email',
                'u.phonenumber',
                'u.sex',
                'u.avatar',
                // 'u.password',
                'u.status',
                'u.delFlag',
                'u.loginIp',
                'u.loginDate',
                'u.createBy', 
                'u.createTime',
                // 'u.updateBy',
                // 'u.updateTime',
                'u.remark',
                // Department fields
                'd.deptId',
                'd.parentId', 
                'd.ancestors',
                'd.deptName',
                'd.orderNum',
                'd.leader',
                'd.status',
                'd.delFlag',
                'd.createBy',
                'd.createTime',
                'd.updateBy', 
                'd.updateTime',
                'd.email',
                'd.phone',
                // 'd.status',
                // // Role fields
                // 'r.roleId',
                // 'r.roleName',
                // 'r.roleKey',
                // 'r.roleSort',
                // 'r.dataScope',
                // 'r.status'
            ])
            .where('u.delFlag = :delFlag', { delFlag: '0' });

        if (query.userId) {
            queryBuilder.andWhere('u.userId = :userId', { userId: query.userId });
        }

        if (query.userName) {
            queryBuilder.andWhere('u.userName LIKE :userName', { userName: `%${query.userName}%` });
        }

        if (query.status) {
            queryBuilder.andWhere('u.status = :status', { status: query.status });
        }

        if (query.phonenumber) {
            queryBuilder.andWhere('u.phonenumber LIKE :phonenumber', { phonenumber: `%${query.phonenumber}%` });
        }

        if (query.params?.beginTime && query.params?.endTime) {
            queryBuilder.andWhere("DATE_FORMAT(u.createTime,'%Y%m%d') BETWEEN DATE_FORMAT(:beginTime,'%Y%m%d') AND DATE_FORMAT(:endTime,'%Y%m%d')", {
                beginTime: query.params.beginTime,
                endTime: query.params.endTime
            });
        }

        if (query.deptId) {
            queryBuilder.andWhere(
                '(u.deptId = :deptId OR u.deptId IN (SELECT dept_id FROM sys_dept WHERE FIND_IN_SET(:deptId, ancestors)))',
                { deptId: query.deptId }
            );
        }

        this.dataScopeUtils.dataScopeFilter(queryBuilder, query.params);

        this.sqlLoggerUtils.log(queryBuilder,'selectUserList');
        
        const [rows, len] = await this.queryUtils.executeQuery(queryBuilder, query);
        return [SensitiveUtils.desensitizeUserList(rows), len];
    }

    // /**
    //  * 查询已分配用户角色列表
    //  */
    // async selectAllocatedList(roleId: number, query: QuerySysUserDto): Promise<[SysUser[], number]> {
    //     const queryBuilder = this.createBaseQuery()
    //         .where('u.delFlag = :delFlag', { delFlag: '0' })
    //         .andWhere('r.roleId = :roleId', { roleId });

    //     if (query.userName) {
    //         queryBuilder.andWhere('u.userName LIKE :userName', { userName: `%${query.userName}%` });
    //     }

    //     if (query.phonenumber) {
    //         queryBuilder.andWhere('u.phonenumber LIKE :phonenumber', { phonenumber: `%${query.phonenumber}%` });
    //     }

    //     // TODO: Implement data scope filtering
    //     // ${params.dataScope}

    //     return queryBuilder.getManyAndCount();
    // }

    // /**
    //  * 查��未分配用户角色列表
    //  */
    // async selectUnallocatedList(roleId: number, query: QuerySysUserDto): Promise<[SysUser[], number]> {
    //     const queryBuilder = this.createBaseQuery()
    //         .where('u.delFlag = :delFlag', { delFlag: '0' })
    //         .andWhere('(r.roleId != :roleId OR r.roleId IS NULL)', { roleId })
    //         .andWhere('u.userId NOT IN (SELECT userId FROM sys_user_role WHERE roleId = :roleId)', { roleId });

    //     if (query.userName) {
    //         queryBuilder.andWhere('u.userName LIKE :userName', { userName: `%${query.userName}%` });
    //     }

    //     if (query.phonenumber) {
    //         queryBuilder.andWhere('u.phonenumber LIKE :phonenumber', { phonenumber: `%${query.phonenumber}%` });
    //     }

    //     // TODO: Implement data scope filtering
    //     // ${params.dataScope}

    //     return queryBuilder.getManyAndCount();
    // }


    // /**
    //  * 通过用户名查询用户
    //  */
    async selectUserByUserName(userName: string): Promise<SysUser> {
        const queryBuilder = this.selectUserVo()
            .where('u.userName = :userName', { userName })
            .andWhere('u.delFlag = :delFlag', { delFlag: '0' });
            
        this.sqlLoggerUtils.log(queryBuilder, 'selectUserByUserName');
        
        return queryBuilder.getOne();
    }

    /**
     * 通过用户ID查询用户
     */
    async selectUserById(userId: number): Promise<SysUser> {
        const queryBuilder = this.selectUserVo()    
            .where('u.userId = :userId', { userId });
            
        this.sqlLoggerUtils.log(queryBuilder, 'selectUserById');
        
        return queryBuilder.getOne();
    }

    /**
     * 新增用户信息
     */
    async insertUser(user: SysUser): Promise<number> {
        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.userRepository.manager;
        


        const insertObject: any = {
            createTime: new Date()
        };

        if (user.deptId) {
            insertObject.deptId = user.deptId;
        }
        if (user.userName) {
            insertObject.userName = user.userName;
        }
        if (user.nickName) {
            insertObject.nickName = user.nickName;
        }
        if (user.email) {
            insertObject.email = user.email;
        }
        if (user.avatar) {
            insertObject.avatar = user.avatar;
        }
        if (user.phonenumber) {
            insertObject.phonenumber = user.phonenumber;
        }
        if (user.sex) {
            insertObject.sex = user.sex;
        }
        if (user.password) {
            insertObject.password = user.password;
        }
        if (user.status) {
            insertObject.status = user.status;
        }
        if (user.createBy) {
            insertObject.createBy = user.createBy;
        }
        if (user.remark) {
            insertObject.remark = user.remark;
        }
        
        const queryBuilder = entityManager
        .createQueryBuilder()
            .insert().into(SysUser,Object.keys(insertObject)).values(insertObject);


        this.sqlLoggerUtils.log(queryBuilder, 'insertUser');

        const result = await queryBuilder.execute();
        return result.raw.insertId;
    }

    
    /**
     * 注册用户信息
     * 
     * @param user 用户信息
     * @return 结果
     */
    async registerUser(user: SysUser): Promise<number> {
        const insertObj: any = {};
        if (user.userId != null && user.userId != 0) insertObj.userId = user.userId;
        if (user.deptId != null && user.deptId != 0) insertObj.deptId = user.deptId;
        if (user.userName != null && user.userName != '') insertObj.userName = user.userName;
        if (user.nickName != null && user.nickName != '') insertObj.nickName = user.nickName;
        if (user.email != null && user.email != '') insertObj.email = user.email;
        if (user.avatar != null && user.avatar != '') insertObj.avatar = user.avatar;
        if (user.phonenumber != null && user.phonenumber != '') insertObj.phonenumber = user.phonenumber;
        if (user.sex != null && user.sex != '') insertObj.sex = user.sex;
        if (user.password != null && user.password != '') insertObj.password = user.password;
        if (user.status != null && user.status != '') insertObj.status = user.status;
        if (user.createBy != null && user.createBy != '') insertObj.createBy = user.createBy;
        if (user.remark != null && user.remark != '') insertObj.remark = user.remark;
        insertObj.createTime = new Date();

        const queryBuilder = this.userRepository.createQueryBuilder('u')
            .insert()
            .into(SysUser)
            .values(insertObj);

        this.sqlLoggerUtils.log(queryBuilder, 'insertUser');

        const result = await queryBuilder.execute();
        return result.raw.insertId;
    }

    /**
     * 修改用户信息
     */
    async updateUser(user: SysUser): Promise<number> {
        const updateData: any = {
            updateTime: new Date()
        };

        // 数字类型只判断 null
        if (user.deptId !== null) updateData.deptId = user.deptId;
        
        // 字符串类型判断 null 和空字符串
        if (user.userName !== null && user.userName !== '') updateData.userName = user.userName;
        if (user.nickName !== null && user.nickName !== '') updateData.nickName = user.nickName;
        if (user.email !== null && user.email !== '') updateData.email = user.email;
        if (user.phonenumber !== null && user.phonenumber !== '') updateData.phonenumber = user.phonenumber;
        if (user.sex !== null && user.sex !== '') updateData.sex = user.sex;
        if (user.avatar !== null && user.avatar !== '') updateData.avatar = user.avatar;
        if (user.password !== null && user.password !== '') updateData.password = user.password;
        if (user.status !== null && user.status !== '') updateData.status = user.status;
        if (user.loginIp !== null && user.loginIp !== '') updateData.loginIp = user.loginIp;
        if (user.updateBy !== null && user.updateBy !== '') updateData.updateBy = user.updateBy;
        if (user.remark !== null && user.remark !== '') updateData.remark = user.remark;
        
        // 日期类型只判断 null
        if (user.loginDate !== null) updateData.loginDate = user.loginDate;

        const result = await this.userRepository.update(user.userId, updateData);
        return result.affected;
    }

    /**
     * 修改用户头像
     * 
     * @param user 用户信息
     * @return 结果
     */
    async updateUserAvatar(user: SysUser): Promise<number> {
        const queryBuilder = this.userRepository.createQueryBuilder()
            .update(SysUser)
            .set({ avatar: user.avatar })
            .where('user_name = :userName', { userName: user.userName });

        this.sqlLoggerUtils.log(queryBuilder, 'updateUserAvatar');

        const result = await queryBuilder.execute();
        return result.affected;
    }

    /**
     * 重置用户密码
     */
    async resetUserPwd(user: SysUser): Promise<number> {
        const queryBuilder = this.userRepository.createQueryBuilder()
            .update(SysUser)
            .set({ password: user.password })
            .where('userName = :userName', { userName: user.userName });

        this.sqlLoggerUtils.log(queryBuilder, 'resetUserPwd');

        const result = await queryBuilder.execute();
        return result.affected;
    }

    // /**
    //  * 通过用户ID删除用户
    //  */
    // async deleteUserById(userId: number): Promise<boolean> {
    //     const result = await this.update(userId, { delFlag: '2' });
    //     return result.affected > 0;
    // }

    /**
     * 批量删除用户信息
     */
    async deleteUserByIds(userIds: number[]): Promise<number> {
        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.userRepository.manager;
        const queryBuilder = entityManager.createQueryBuilder()
            .update(SysUser)
            .set({ delFlag: '2' })
            .whereInIds(userIds);

        this.sqlLoggerUtils.log(queryBuilder, 'deleteUserByIds');

        const result = await queryBuilder.execute();
        return result.affected;
    }

    /**
     * 校验用户名称是否唯一
     */
    async checkUserNameUnique(userName: string): Promise<SysUser> {
        const queryBuilder = this.userRepository.createQueryBuilder('user')
            .select(['user.userId', 'user.userName'])
            .where('user.userName = :userName', { userName })
            .andWhere('user.delFlag = :delFlag', { delFlag: '0' })
            .limit(1);

        this.sqlLoggerUtils.log(queryBuilder, 'checkUserNameUnique');

        return queryBuilder.getOne();
    }
    /**
     * 校验手机号码是否唯一
     */
    async checkPhoneUnique(phonenumber: string): Promise<SysUser> {
        const queryBuilder = this.userRepository.createQueryBuilder('user')
            .select(['user.userId', 'user.phonenumber'])
            .where('user.phonenumber = :phonenumber', { phonenumber })
            .andWhere('user.delFlag = :delFlag', { delFlag: '0' })
            .limit(1);

        this.sqlLoggerUtils.log(queryBuilder, 'checkPhoneUnique');

        return queryBuilder.getOne();
    }

    /**
     * 校验email是否唯一
     */
    async checkEmailUnique(email: string): Promise<SysUser> {
        const queryBuilder = this.userRepository.createQueryBuilder('user')
            .select(['user.userId', 'user.email'])
            .where('user.email = :email', { email })
            .andWhere('user.delFlag = :delFlag', { delFlag: '0' })
            .limit(1);

        this.sqlLoggerUtils.log(queryBuilder, 'checkEmailUnique');

        return queryBuilder.getOne();
    }
}
