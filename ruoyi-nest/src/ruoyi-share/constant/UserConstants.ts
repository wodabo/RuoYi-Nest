/**
 * 用户常量信息
 * 
 * @author ruoyi
 */
export class UserConstants {
    /**
     * 平台内系统用户的唯一标志
     */
    public static readonly SYS_USER: string = "SYS_USER";

    /** 正常状态 */
    public static readonly NORMAL: string = "0";

    /** 异常状态 */
    public static readonly EXCEPTION: string = "1";

    /** 用户封禁状态 */
    public static readonly USER_DISABLE: string = "1";

    /** 角色正常状态 */
    public static readonly ROLE_NORMAL: string = "0";

    /** 角色封禁状态 */
    public static readonly ROLE_DISABLE: string = "1";

    /** 部门正常状态 */
    public static readonly DEPT_NORMAL: string = "0";

    /** 部门停用状态 */
    public static readonly DEPT_DISABLE: string = "1";

    /** 字典正常状态 */
    public static readonly DICT_NORMAL: string = "0";

    /** 是否为系统默认（是） */
    public static readonly YES: string = "Y";

    /** 是否菜单外链（是） */
    public static readonly YES_FRAME: string = "0";

    /** 是否菜单外链（否） */
    public static readonly NO_FRAME: string = "1";

    /** 菜单类型（目录） */
    public static readonly TYPE_DIR: string = "M";

    /** 菜单类型（菜单） */
    public static readonly TYPE_MENU: string = "C";

    /** 菜单类型（按钮） */
    public static readonly TYPE_BUTTON: string = "F";

    /** Layout组件标识 */
    public static readonly LAYOUT: string = "Layout";
    
    /** ParentView组件标识 */
    public static readonly PARENT_VIEW: string = "ParentView";

    /** InnerLink组件标识 */
    public static readonly INNER_LINK: string = "InnerLink";

    /** 校验是否唯一的返回标识 */
    public static readonly UNIQUE: boolean = true;
    public static readonly NOT_UNIQUE: boolean = false;

    /**
     * 用户名长度限制
     */
    public static readonly USERNAME_MIN_LENGTH: number = 2;
    public static readonly USERNAME_MAX_LENGTH: number = 20;

    /**
     * 密码长度限制
     */
    public static readonly PASSWORD_MIN_LENGTH: number = 5;
    public static readonly PASSWORD_MAX_LENGTH: number = 20;
}