/**
 * 缓存的key 常量
 * 
 * @author ruoyi
 */
export class CacheConstants {
    /**
     * 登录用户 redis key
     */
    public static readonly LOGIN_TOKEN_KEY: string = "login_tokens:";

    /**
     * 验证码 redis key
     */
    public static readonly CAPTCHA_CODE_KEY: string = "captcha_codes:";

    /**
     * 参数管理 cache key
     */
    public static readonly SYS_CONFIG_KEY: string = "sys_config:";

    /**
     * 字典管理 cache key
     */
    public static readonly SYS_DICT_KEY: string = "sys_dict:";

    /**
     * 防重提交 redis key
     */
    public static readonly REPEAT_SUBMIT_KEY: string = "repeat_submit:";

    /**
     * 限流 redis key
     */
    public static readonly RATE_LIMIT_KEY: string = "rate_limit:";

    /**
     * 登录账户密码错误次数 redis key
     */
    public static readonly PWD_ERR_CNT_KEY: string = "pwd_err_cnt:";
}