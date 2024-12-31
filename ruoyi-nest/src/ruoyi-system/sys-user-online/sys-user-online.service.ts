import { Injectable } from '@nestjs/common';
import { LoginUser } from '~/ruoyi-share/model/login-user';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { SysUserOnline } from '~/ruoyi-system/sys-user-online/entities/sys-user-online.entity';

/**
 * 在线用户 服务层处理
 * 
 * @author ruoyi
 */
@Injectable()
export class SysUserOnlineService
{
    /**
     * 通过登录地址查询信息
     * 
     * @param ipaddr 登录地址
     * @param user 用户信息
     * @return 在线用户信息
     */
    async selectOnlineByIpaddr(ipaddr: string, user: LoginUser): Promise<SysUserOnline>
    {
        if (ipaddr === user.ipaddr)
        {
            return this.loginUserToUserOnline(user);
        }
        return null;
    }

    /**
     * 通过用户名称查询信息
     * 
     * @param userName 用户名称
     * @param user 用户信息
     * @return 在线用户信息
     */
    async selectOnlineByUserName(userName: string, user: LoginUser): Promise<SysUserOnline>
    {
        if (userName === user.getUsername())
        {
            return this.loginUserToUserOnline(user);
        }
        return null;
    }

    /**
     * 通过登录地址/用户名称查询信息
     * 
     * @param ipaddr 登录地址
     * @param userName 用户名称
     * @param user 用户信息
     * @return 在线用户信息
     */
    async selectOnlineByInfo(ipaddr: string, userName: string, user: LoginUser): Promise<SysUserOnline>
    {
        if (ipaddr === user.ipaddr && userName === user.getUsername())
        {
            return this.loginUserToUserOnline(user);
        }
        return null;
    }

    /**
     * 设置在线用户信息
     * 
     * @param user 用户信息
     * @return 在线用户
     */
    async loginUserToUserOnline(loginUser: LoginUser): Promise<SysUserOnline>
    {
        if (!loginUser || !loginUser.user)
        {
            return null;
        }
        const sysUserOnline = new SysUserOnline();
        sysUserOnline.tokenId = loginUser.token;
        sysUserOnline.userName = loginUser.getUsername();
        sysUserOnline.ipaddr = loginUser.ipaddr;
        sysUserOnline.loginLocation = loginUser.loginLocation;
        sysUserOnline.browser = loginUser.browser;
        sysUserOnline.os = loginUser.os;
        sysUserOnline.loginTime = loginUser.loginTime;
        if (loginUser.user.dept)           
        {
            sysUserOnline.deptName = loginUser.user.dept.deptName
        }           
        return sysUserOnline;
    }
}
