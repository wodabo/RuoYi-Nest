/**
 * 通用常量信息
 * 
 * @author ruoyi
 */
export class Constants {
    /**
     * UTF-8 字符集
     */
    public static readonly UTF8: string = "UTF-8";

    /**
     * GBK 字符集
     */
    public static readonly GBK: string = "GBK";

    /**
     * 系统语言
     */
    public static readonly DEFAULT_LOCALE: string = "zh-CN";

    /**
     * www主域
     */
    public static readonly WWW: string = "www.";

    /**
     * http请求
     */
    public static readonly HTTP: string = "http://";

    /**
     * https请求
     */
    public static readonly HTTPS: string = "https://";

    /**
     * 通用成功标识
     */
    public static readonly SUCCESS: string = "0";

    /**
     * 通用失败标识
     */
    public static readonly FAIL: string = "1";

    /**
     * 登录成功
     */
    public static readonly LOGIN_SUCCESS: string = "Success";

    /**
     * 注销
     */
    public static readonly LOGOUT: string = "Logout";

    /**
     * 注册
     */
    public static readonly REGISTER: string = "Register";

    /**
     * 登录失败
     */
    public static readonly LOGIN_FAIL: string = "Error";

    /**
     * 所有权限标识
     */
    public static readonly ALL_PERMISSION: string = "*:*:*";

    /**
     * 管理员角色权限标识
     */
    public static readonly SUPER_ADMIN: string = "admin";

    /**
     * 角色权限分隔符
     */
    public static readonly ROLE_DELIMETER: string = ",";

    /**
     * 权限标识分隔符
     */
    public static readonly PERMISSION_DELIMETER: string = ",";

    /**
     * 验证码有效期（分钟）
     */
    public static readonly CAPTCHA_EXPIRATION: number = 2;

    /**
     * 令牌
     */
    public static readonly TOKEN: string = "token";

    /**
     * 令牌前缀
     */
    public static readonly TOKEN_PREFIX: string = "Bearer ";

    /**
     * 令牌前缀
     */
    public static readonly LOGIN_USER_KEY: string = "login_user_key";

    /**
     * 用户ID
     */
    public static readonly JWT_USERID: string = "userid";

    /**
     * 用户名称
     */
    public static readonly JWT_USERNAME: string = "sub";

    /**
     * 用户头像
     */
    public static readonly JWT_AVATAR: string = "avatar";

    /**
     * 创建时间
     */
    public static readonly JWT_CREATED: string = "created";

    /**
     * 用户权限
     */
    public static readonly JWT_AUTHORITIES: string = "authorities";

    /**
     * 资源映射路径 前缀
     */
    public static readonly RESOURCE_PREFIX: string = "/profile";

    /**
     * RMI 远程方法调用
     */
    public static readonly LOOKUP_RMI: string = "rmi:";

    /**
     * LDAP 远程方法调用
     */
    public static readonly LOOKUP_LDAP: string = "ldap:";

    /**
     * LDAPS 远程方法调用
     */
    public static readonly LOOKUP_LDAPS: string = "ldaps:";


    /**
     * 定时任务违规的字符
     */
    public static readonly JOB_ERROR_STR: string[] = [
      
    ];
}