import { SysUser } from '~/ruoyi-system/sys-user/entities/sys-user.entity';

/**
 * 登录用户身份权限
 * 
 * @author ruoyi
 */
export class LoginUser {
    /**
     * 用户ID
     */
    userId: number;

    /**
     * 部门ID
     */
    deptId: number;

    /**
     * 用户唯一标识
     */
    token: string;

    /**
     * 登录时间
     */
    
    loginTime: number;

    /**
     * 过期时间
     */
    
    expireTime: number;

    /**
     * 登录IP地址
     */
    ipaddr: string;

    /**
     * 登录地点
     */
    loginLocation: string;

    /**
     * 浏览器类型
     */
    browser: string;

    /**
     * 操作系统
     */
    os: string;

    /**
     * 权限列表
     */
    permissions: string[];

    /**
     * 用户信息
     */
    user: SysUser;

    constructor(loginUser?: LoginUser) {

        if (loginUser) {
            this.loginTime = loginUser.loginTime;
            this.expireTime = loginUser.expireTime; 
            this.ipaddr = loginUser.ipaddr;
            this.loginLocation = loginUser.loginLocation;
            this.browser = loginUser.browser;
            this.os = loginUser.os;
            this.permissions = loginUser.permissions;
            this.user = loginUser.user;
            this.token = loginUser.token;
            this.userId = loginUser.userId;
            this.deptId = loginUser.deptId;
        }
    }


    getPassword(): string {
        return this.user?.password;
    }

    getUsername(): string {
        return this.user?.userName;
    }

    /**
     * 账户是否未过期,过期无法验证
     */
    isAccountNonExpired(): boolean {
        return true;
    }

    /**
     * 指定用户是否解锁,锁定的用户无法进行身份验证
     */
    isAccountNonLocked(): boolean {
        return true;
    }

    /**
     * 指示是否已过期的用户的凭据(密码),过期的凭据防止认证
     */
    isCredentialsNonExpired(): boolean {
        return true;
    }

    /**
     * 是否可用 ,禁用的用户不能身份验证
     */
    isEnabled(): boolean {
        return true;
    }

    getAuthorities(): any[] {
        return null;
    }
}