import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';
// import { DataScope } from '~/ruoyi-share/decorators/data-scope.decorator';
// import { ServiceException } from '~/ruoyi-share/exceptions/service.exception';
// import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
// import { StringUtils } from '~/ruoyi-share/utils/string.utils';
// import { UserConstants } from '~/ruoyi-share/constants/user.constants';
// import { SysRole } from '~/ruoyi-system/sys-role/entities/sys-role.entity';
// import { SysPost } from '~/ruoyi-system/sys-post/entities/sys-post.entity';
// import { SysUserRole } from '~/ruoyi-system/sys-user-role/entities/sys-user-role.entity';
// import { SysUserPost } from '~/ruoyi-system/sys-user-post/entities/sys-user-post.entity';
// import { ISysConfigService } from '~/ruoyi-system/sys-config/sys-config.service';
// import { ISysDeptService } from '~/ruoyi-system/sys-dept/sys-dept.service';
import { SysUserRepository } from '~/ruoyi-system/sys-user/repositories/sys-user.repository';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import {  DataScope } from '~/ruoyi-share/annotation/DataScope';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { UserConstants } from '~/ruoyi-share/constant/UserConstants';
import { SysUserRoleRepository } from '~/ruoyi-system/sys-user-role/repositories/sys-user-role.repository';
import { SysUserPostRepository } from '~/ruoyi-system/sys-user-post/repositories/sys-user-post.repository';
import { SysPostRepository } from '../sys-post/repositories/sys-post.repository';
import { SysRoleRepository } from '~/ruoyi-system/sys-role/repositories/sys-role.repository';
import { SysConfigService } from '~/ruoyi-system/sys-config/sys-config.service';
import { EntityValidatorUtils } from '~/ruoyi-share/utils/entity-validator.utils';
import { SysDeptService } from '~/ruoyi-system/sys-dept/sys-dept.service';


@Injectable()
export class SysUserService {
    private readonly logger = new Logger(SysUserService.name);

    constructor(
        private readonly userRepository: SysUserRepository,
        private readonly userRoleRepository: SysUserRoleRepository,
        private readonly userPostRepository: SysUserPostRepository,
        private readonly postRepository: SysPostRepository, 
        private readonly securityUtils: SecurityUtils,
        private readonly roleRepository: SysRoleRepository,
        private readonly configService: SysConfigService,      
        private readonly deptService: SysDeptService,       
        private readonly entityValidatorUtils: EntityValidatorUtils,    
        @InjectDataSource() private dataSource: DataSource,
        // @InjectRepository(SysRole)
        // private readonly roleRepository: Repository<SysRole>,
        // @InjectRepository(SysPost)
        // private readonly postRepository: Repository<SysPost>,
        // @InjectRepository(SysUserRole)
        // private readonly userRoleRepository: Repository<SysUserRole>,
        // @InjectRepository(SysUserPost)
        // private readonly userPostRepository: Repository<SysUserPost>,
        // private readonly configService: ISysConfigService,
        // private readonly deptService: ISysDeptService,
    ) {}

    @DataScope({ deptAlias: 'd', userAlias: 'u' })        
    async selectUserList(query: SysUser): Promise<[SysUser[],number]> {
        // // 获取当前方法的元数据
        // const metadata = Reflect.getMetadata(DATA_SCOPE_KEY, this.selectUserList);
            
        // // 从元数据中获取注解参数
        // const { deptAlias ,userAlias} = metadata;

        // if(deptAlias){
        //     // 设置查询参数
        //     query.deptAlias = deptAlias;
        // }

        // if(userAlias){
        //     query.userAlias = userAlias;
        // }
        

        return this.userRepository.selectUserList(query);
    }

    // @DataScope({ deptAlias: 'd', userAlias: 'u' })
    // async selectAllocatedList(user: SysUser): Promise<SysUser[]> {
    //     return this.userRepository.find({ where: user });
    // }

    // @DataScope({ deptAlias: 'd', userAlias: 'u' })
    // async selectUnallocatedList(user: SysUser): Promise<SysUser[]> {
    //     return this.userRepository.find({ where: user });
    // }

    async selectUserByUserName(userName: string): Promise<SysUser> {
        return this.userRepository.selectUserByUserName(userName);
    }

    async selectUserById(userId: number): Promise<SysUser> {

        return this.userRepository.selectUserById(userId);
    }

    /**
     * 查询用户所属角色组
     * 
     * @param userName 用户名
     * @return 结果
     */
    async selectUserRoleGroup(userName: string): Promise<string> {
        const roles = await this.roleRepository.selectRolesByUserName(userName);
        if (!roles || roles.length === 0) {
            return '';
        }
        return roles.map(role => role.roleName).join(',');
    }

    /**
     * 查询用户所属岗位组
     * 
     * @param userName 用户名
     * @return 结果
     */
    async selectUserPostGroup(userName: string): Promise<string> {
        const posts = await this.postRepository.selectPostsByUserName(userName);
        if (!posts || posts.length === 0) {
            return '';
        }
        return posts.map(post => post.postName).join(',');
    }

    /**
     * 校验用户名称是否唯一
     * 
     * @param user 用户信息
     * @return 结果
     */
    async checkUserNameUnique(user: SysUser): Promise<boolean> {
        const userId = user.userId ?? -1;
        const info = await this.userRepository.checkUserNameUnique(user.userName);
        if (info && info.userId !== userId) {
            return UserConstants.NOT_UNIQUE ;
        }
        return UserConstants.UNIQUE;
    }

    /**
     * 校验手机号码是否唯一
     *
     * @param user 用户信息
     * @return 结果
     */
    async checkPhoneUnique(user: SysUser): Promise<boolean> {
        const userId = user.userId ?? -1;
        const info = await this.userRepository.checkPhoneUnique(user.phonenumber);
        if (info && info.userId !== userId) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }

    /**
     * 校验email是否唯一
     *
     * @param user 用户信息
     * @return 结果
     */
    async checkEmailUnique(user: SysUser): Promise<boolean> {
        const userId = user.userId ?? -1;
        const info = await this.userRepository.checkEmailUnique(user.email);
        if (info && info.userId !== userId) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }

    async checkUserAllowed(user: SysUser): Promise<void> {
        if (user.userId && this.securityUtils.isAdmin(user.userId)) {
            throw new ServiceException('不允许操作超级管理员用户');
        }
    }

    async checkUserDataScope(userId: number,loginUser?: LoginUser): Promise<void> {
        if (!this.securityUtils.isAdmin(userId)) {           
            const query = new SysUser();
            query.userId = userId;
            const [users, _len] = await this.selectUserList(query);
            if (!users || users.length === 0) {
                throw new ServiceException('没有权限访问用户数据！');
            }
        }
    }

    /**
     * 新增保存用户信息
     * 
     * @param user 用户信息
     * @return 结果
     */
    async insertUser(user: SysUser): Promise<number> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // 新增用户信息
            const userId = await this.userRepository.insertUser(user);
            user.userId = userId;
            // 新增用户岗位关联
            await this.insertUserPost(user);
            // 新增用户与角色管理
            await this.insertUserRole(user);

            await queryRunner.commitTransaction();
            return userId;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async registerUser(user: SysUser): Promise<boolean> {  
        const userId = await this.userRepository.registerUser(user);
        return userId > 0;         
    }

    /**
     * 修改保存用户信息
     * 
     * @param user 用户信息
     * @return 结果
     */
    async updateUser(user: SysUser): Promise<number> {
        const userId = user.userId;
        // 删除用户与角色关联
        await this.userRoleRepository.deleteUserRoleByUserId(userId);
        // 新增用户与角色管理
        await this.insertUserRole(user);
        // 删除用户与岗位关联
        await this.userPostRepository.deleteUserPostByUserId(userId);
        // 新增用户与岗位管理
        await this.insertUserPost(user);
        return await this.userRepository.updateUser(user);
    }

    /**
     * 用户授权角色
     * 
     * @param userId 用户ID
     * @param roleIds 角色组
     */
    async insertUserAuth(userId: number, roleIds: number[]): Promise<void> {
        await this.userRoleRepository.deleteUserRoleByUserId(userId);
        await this.insertUserRoles(userId, roleIds);
    }

    /**
     * 修改用户状态
     * 
     * @param user 用户信息
     * @return 结果
     */
    async updateUserStatus(user: SysUser): Promise<number> {
        return await this.userRepository.updateUser(user);
    }

    async updateUserProfile(user: SysUser): Promise<number> {
        return this.userRepository.updateUser(user);
    }

    /**
     * 修改用户头像
     * 
     * @param userName 用户名
     * @param avatar 头像地址
     * @return 结果
     */
    async updateUserAvatar(userName: string, avatar: string): Promise<boolean> {
        const user = new SysUser();
        user.userName = userName;
        user.avatar = avatar;
        const result = await this.userRepository.updateUserAvatar(user);
        return result > 0;
    }

    async resetPwd(user: SysUser): Promise<number> {
        return this.userRepository.updateUser(user);
    }

    /**
     * 重置用户密码
     * 
     * @param userName 用户名
     * @param password 密码
     * @return 结果
     */
    async resetUserPwd(userName: string, password: string): Promise<number> {
        const user = new SysUser();
        user.userName = userName;
        user.password = password;
        return await this.userRepository.resetUserPwd(user);
    }

    // async deleteUserById(userId: number): Promise<number> {
    //     await this.userRoleRepository.delete({ userId });
    //     await this.userPostRepository.delete({ userId });
    //     const result = await this.userRepository.delete(userId);
    //     return result.affected;
    // }
    async deleteUserByIds(userIds: number[],loginUser?: LoginUser): Promise<number> {
        // 校验用户权限
        for (const userId of userIds) {
            const user = new SysUser();
            user.userId = userId;
            await this.checkUserAllowed(user);
            await this.checkUserDataScope(userId,loginUser);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 删除用户与角色关联
            await this.userRoleRepository.deleteUserRole(userIds);
            
            // 删除用户与岗位关联
            await this.userPostRepository.deleteUserPost(userIds);
            
            // 删除用户
            const result = await this.userRepository.deleteUserByIds(userIds);

            await queryRunner.commitTransaction();
            return result;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
    /**
     * 导入用户数据
     * 
     * @param userList 用户数据列表
     * @param isUpdateSupport 是否更新支持，如果已存在，则进行更新数据
     * @param operName 操作用户
     * @return 结果
     */
    async importUser(userList: SysUser[], isUpdateSupport: boolean, operName: string): Promise<string> {
        if (!userList || userList.length === 0) {
            throw new ServiceException('导入用户数据不能为空！');
        }
        let successNum = 0;
        let failureNum = 0;
        const successMsgs: string[] = [];
        const failureMsgs: string[] = [];
        const password = await this.configService.selectConfigByKey('sys.user.initPassword');

        for (const user of userList) {
            try {
                // 验证是否存在这个用户
                const existUser = await this.selectUserByUserName(user.userName);
                if (!existUser) {
                    const sysUser = new SysUser();
                    sysUser.userName = user.userName;
                    sysUser.nickName = user.nickName;
                    sysUser.email = user.email;
                    sysUser.phonenumber = user.phonenumber;
                    sysUser.sex = user.sex;
                    sysUser.status = user.status;
                    await this.entityValidatorUtils.validate(sysUser);
                    await this.deptService.checkDeptDataScope(user.deptId);
                    user.password = this.securityUtils.encryptPassword(password);
                    user.createBy = operName;
                    await this.insertUser(user);
                    successNum++;
                    successMsgs.push(`<br/>${successNum}、账号 ${user.userName} 导入成功`);
                } else if (isUpdateSupport) {
                    await this.entityValidatorUtils.validate(user);
                    await this.checkUserAllowed(existUser);
                    await this.checkUserDataScope(existUser.userId);
                    await this.deptService.checkDeptDataScope(user.deptId);
                    user.userId = existUser.userId;
                    user.updateBy = operName;
                    await this.updateUser(user);
                    successNum++;
                    successMsgs.push(`<br/>${successNum}、账号 ${user.userName} 更新成功`);
                } else {
                    failureNum++;
                    failureMsgs.push(`<br/>${failureNum}、账号 ${user.userName} 已存在`);
                }
            } catch (e) {
                failureNum++;
                const msg = `<br/>${failureNum}、账号 ${user.userName} 导入失败：${e.message}`;
                failureMsgs.push(msg);
                this.logger.error(msg, e);
            }
        }

        if (failureNum > 0) {
            const failureMessage = `很抱歉，导入失败！共 ${failureNum} 条数据格式不正确，错误如下：${failureMsgs.join('')}`;
            throw new ServiceException(failureMessage);
        } else {
            const successMessage = `恭喜您，数据已全部导入成功！共 ${successNum} 条，数据如下：${successMsgs.join('')}`;
            return successMessage;
        }
    }

    /**
     * 新增用户角色信息
     * 
     * @param userId 用户ID
     * @param roleIds 角色组
     */
    private async insertUserRoles(userId: number, roleIds: number[]): Promise<void> {
        if (roleIds && roleIds.length > 0) {
            // 新增用户与角色管理
            const userRoles = roleIds.map(roleId => ({
                userId,
                roleId
            }));
            await this.userRoleRepository.batchUserRole(userRoles);
        }
    }

    /**
     * 新增用户角色信息
     * 
     * @param user 用户对象
     */
    private async insertUserRole(user: SysUser): Promise<void> {
        await this.insertUserRoles(user.userId, user.roleIds);
    }

    /**
     * 新增用户岗位信息
     * 
     * @param user 用户对象
     */
    private async insertUserPost(user: SysUser): Promise<void> {
        const { userId, postIds } = user;
        if (postIds && postIds.length > 0) {
            // 新增用户与岗位管理
            const userPosts = postIds.map(postId => {
                const up = {
                    userId: userId,
                    postId: postId
                };
                return up;
            });
            await this.userPostRepository.batchUserPost(userPosts);
        }
    }
}