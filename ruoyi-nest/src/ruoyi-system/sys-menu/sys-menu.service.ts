import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SysMenu } from './entities/sys-menu.entity';
import { SysMenuRepository } from './repositories/sys-menu.repository';
import { UserConstants } from '~/ruoyi-share/constant/UserConstants';
import { RouterVo } from '~/ruoyi-share/vo/router.vo';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { Constants } from '~/ruoyi-share/constant/constants';
import { MetaVo } from '~/ruoyi-share/vo/meta.vo';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { SelectQueryBuilder } from 'typeorm';
import { SysRoleRepository } from '~/ruoyi-system/sys-role/repositories/sys-role.repository';
import { SysRoleMenuRepository } from '../sys-role-menu/repositories/sys-role-menu.repository';

@Injectable()
export class SysMenuService {
  constructor(
    private readonly menuRepository: SysMenuRepository,
    private readonly securityUtils: SecurityUtils,
    private readonly roleRepository: SysRoleRepository,
    private readonly roleMenuRepository: SysRoleMenuRepository,
    private readonly stringUtils:StringUtils  
  ) { }


  
  /**
   * 查询系统菜单列表
   */
  async selectMenuList(userId:number): Promise<SysMenu[]> {
    return this.selectMenuListWithUserId(new SysMenu(),userId);
  }


  /**
   * 查询系统菜单列表
   * 
   * @param menu 菜单信息
   * @param userId 用户ID
   * @returns 菜单列表
   */
  async selectMenuListWithUserId(menu: SysMenu, userId: number): Promise<SysMenu[]> {
    let menuList: SysMenu[] = null;
    // 管理员显示所有菜单信息
    if (userId && this.securityUtils.isAdmin(userId)) {
      menuList = await this.menuRepository.selectMenuList(menu);
    } else {
      menu.params = menu.params || {};
      menu.params.userId = userId;
      menuList = await this.menuRepository.selectMenuListByUserId(menu);
    }
    return menuList;
  }

  // /**
  //  * 根据用户查询系统菜单列表
  //  */
  // async selectMenuListByUserId(userId: number, query: QuerySysMenuDto): Promise<[SysMenu[], number]> {
  //   return this.menuRepository.selectMenuListByUserId(userId, query);
  // }

  /**
   * 根据用户ID查询权限
   */
  async selectMenuPermsByUserId(userId: number): Promise<string[]> {
    const result = await this.menuRepository.selectMenuPermsByUserId(userId);
    return [...new Set(result.filter(d => d))];
  }

  /**
   * 根据角色ID查询权限
   */
  async selectMenuPermsByRoleId(roleId: number): Promise<string[]> {
    const result = await this.menuRepository.selectMenuPermsByRoleId(roleId);
    return [...new Set(result.filter(d => d))];
  }

  /**
   * 根据用户ID查询菜单树
   */
  async selectMenuTreeByUserId(userId: number): Promise<SysMenu[]> {
    let menus: SysMenu[] = null;
    if (this.securityUtils.isAdmin(userId)) { // admin user id is 1
      menus = await this.menuRepository.selectMenuTreeAll();
    } else {
      menus = await this.menuRepository.selectMenuTreeByUserId(userId);
    }
    return this.getChildPerms(menus, 0);
  }


  /**
   * 根据父节点的ID获取所有子节点
   * 
   * @param list 分类表
   * @param parentId 传入的父节点ID
   * @returns SysMenu[]
   */
  private getChildPerms(list: SysMenu[], parentId: number): SysMenu[] {
    const returnList: SysMenu[] = [];
    for (const item of list) {
      // 根据传入的某个父节点ID,遍历该父节点的所有子节点
      if (item.parentId === parentId) {
        this.recursionFn(list, item);
        returnList.push(item);
      }
    }
    return returnList;
  }

  /**
* 递归列表
* 
* @param list 分类表
* @param t 子节点
*/
  private recursionFn(list: SysMenu[], t: SysMenu): void {
    // 得到子节点列表
    const childList = this.getChildList(list, t);
    t.children = childList;
    for (const tChild of childList) {
      if (this.hasChild(list, tChild)) {
        this.recursionFn(list, tChild);
      }
    }
  }


  /**
* 得到子节点列表
*/
  private getChildList(list: SysMenu[], t: SysMenu): SysMenu[] {
    const childList: SysMenu[] = [];
    for (const item of list) {
      if (item.parentId === t.menuId) {
        childList.push(item);
      }
    }
    return childList;
  }


  /**
* 判断是否有子节点
*/
  private hasChild(list: SysMenu[], t: SysMenu): boolean {
    return this.getChildList(list, t).length > 0;
  }



  /**
* 构建前端路由所需要的菜单
* 
* @param menus 菜单列表
* @return 路由列表
*/
  buildMenus(menus: SysMenu[]): RouterVo[] {
    const routers: RouterVo[] = [];

    for (const menu of menus) {
      const router = new RouterVo();
      router.hidden = menu.visible === '1';
      router.name = this.getRouteName(menu);
      router.path = this.getRouterPath(menu);
      router.component = this.getComponent(menu);
      router.query = menu.query;
      router.meta = new MetaVo(this.stringUtils)
      router.meta.title = menu.menuName
      router.meta.icon = menu.icon
      router.meta.noCache = menu.isCache === '1'
      router.meta.setLink(menu.path)
      const cMenus = menu.children;
      if (cMenus && cMenus.length > 0 && UserConstants.TYPE_DIR === menu.menuType) {
        router.alwaysShow = true;
        router.redirect = 'noRedirect';
        router.children = this.buildMenus(cMenus);
    
      } else if (this.isMenuFrame(menu)) {
        router.meta = null;
        const childrenList: RouterVo[] = [];
        const children = new RouterVo();
        children.path = menu.path;
        children.component = menu.component;
        children.name = this.getRouteName(menu);
        children.meta = new MetaVo(this.stringUtils)
        children.meta.title = menu.menuName
        children.meta.icon = menu.icon
        children.meta.noCache = menu.isCache === '1'
        children.meta.setLink(menu.path)
        children.query = menu.query;
        childrenList.push(children);
        router.children = childrenList;
      } else if (menu.parentId === 0 && this.isInnerLink(menu)) {
        router.meta = new MetaVo(this.stringUtils)
        router.meta.title = menu.menuName
        router.meta.icon = menu.icon
        router.path = '/';
        const childrenList: RouterVo[] = [];
        const children = new RouterVo();
        const routerPath = this.innerLinkReplaceEach(menu.path);
        children.path = routerPath;
        children.component = UserConstants.INNER_LINK;
        children.name = this.getRouteNameByNameAndPath(menu.routeName, routerPath);
        children.meta = new MetaVo(this.stringUtils)
        children.meta.title = menu.menuName
        children.meta.icon = menu.icon
        children.meta.setLink(menu.path)
        childrenList.push(children);
        router.children = childrenList;
      }
      routers.push(router);
    }
    return routers;
  }
  /**
* 获取路由名称
* 
* @param menu 菜单信息
* @return 路由名称
*/
  public getRouteName(menu: SysMenu): string {
    // 非外链并且是一级目录（类型为目录）
    if (this.isMenuFrame(menu)) {
      return '';
    }
    return this.getRouteNameByNameAndPath(menu.routeName, menu.path);
  }

  /**
* 获取路由名称，如没有配置路由名称则取路由地址
* 
* @param name 路由名称
* @param path 路由地址
* @return 路由名称（驼峰格式）
*/
  public getRouteNameByNameAndPath(name: string, path: string): string {
    const routerName = name ? name : path;
    return this.stringUtils.capitalize(routerName);
  }



  /**
* 是否为菜单内部跳转
* 
* @param menu 菜单信息
* @return 结果
*/
  public isMenuFrame(menu: SysMenu): boolean {
    return menu.parentId === 0 && menu.menuType === 'M' && menu.isFrame === '0';
  }



  /**
* 获取路由地址
* 
* @param menu 菜单信息
* @return 路由地址
*/
  public getRouterPath(menu: SysMenu): string {
    let routerPath = menu.path;
    // 内链打开外网方式
    if (menu.parentId !== 0 && this.isInnerLink(menu)) {
      routerPath = this.innerLinkReplaceEach(routerPath);
    }

    // 非外链并且是一级目录（类型为目录）
    if (menu.parentId === 0 && UserConstants.TYPE_DIR === menu.menuType
      && UserConstants.NO_FRAME === menu.isFrame) {
   
      routerPath = "/" + menu.path;
    }
    // 非外链并且是一级目录（类型为菜单）
    else if (this.isMenuFrame(menu)) {
      routerPath = "/";
    }
    return routerPath;
  }


  /**
* 是否为内链组件
* 
* @param menu 菜单信息
* @return 结果
*/
  public isInnerLink(menu: SysMenu): boolean {
    return menu.isFrame === '0' && this.stringUtils.isHttp(menu.path);
  }

  /**
* 内链域名特殊字符替换
* 
* @param path 路径
* @return 替换后的内链域名
*/
  public innerLinkReplaceEach(path: string): string {
    return this.stringUtils.replaceEach(path, [Constants.HTTP, Constants.HTTPS, Constants.WWW, ".", ":"],
      ["", "", "", "/", "/"]);
  }


  /**
* 获取组件信息
* 
* @param menu 菜单信息
* @return 组件信息
*/
  public getComponent(menu: SysMenu): string {
    let component = UserConstants.LAYOUT;
    if (this.stringUtils.isNotEmpty(menu.component) && !this.isMenuFrame(menu)) {
      component = menu.component;
    }
    else if (this.stringUtils.isEmpty(menu.component) && menu.parentId !== 0 && this.isInnerLink(menu)) {
      component = UserConstants.INNER_LINK;
    }
    else if (this.stringUtils.isEmpty(menu.component) && this.isParentView(menu)) {
      component = UserConstants.PARENT_VIEW;
    }
    return component;
  }



  /**
   * 是否为parent_view组件
   * 
   * @param menu 菜单信息
   * @return 结果
   */
  public isParentView(menu: SysMenu): boolean {
    return menu.parentId !== 0 && menu.menuType === UserConstants.TYPE_DIR;
  }
  /**
   * 根据角色ID查询菜单树信息
   * 
   * @param roleId 角色ID
   * @return 选中菜单列表
   */
  async selectMenuListByRoleId(roleId: number): Promise<number[]> {
    const role = await this.roleRepository.selectRoleById(roleId);
    return this.menuRepository.selectMenuListByRoleId(roleId, role.menuCheckStrictly);
  }

  /**
   * 根据菜单ID查询信息
   */
  async selectMenuById(menuId: number): Promise<SysMenu> {
    return this.menuRepository.selectMenuById(menuId);
  }

  /**
   * 是否存在菜单子节点
   */
  async hasChildByMenuId(menuId: number): Promise<boolean> {
    const count = await this.menuRepository.hasChildByMenuId(menuId);
    return count > 0;
  }

  /**
   * 查询菜单使用数量
   * 
   * @param menuId 菜单ID
   * @return 结果
   */
  async checkMenuExistRole(menuId: number): Promise<boolean> {
    const result = await this.roleMenuRepository.checkMenuExistRole(menuId);
    return result > 0;
  }

  /**
   * 新增菜单信息
   */
  async insertMenu(menu: SysMenu): Promise<number> {
    return this.menuRepository.insertMenu(menu);
  }

  /**
   * 修改菜单信息
   */
  async updateMenu(menu: SysMenu): Promise<number> {
    return this.menuRepository.updateMenu(menu);
  }

  /**
   * 删除菜单管理信息
   */
  async deleteMenuById(menuId: number): Promise<number> {
    return this.menuRepository.deleteMenuById(menuId);
  }

  /**
   * 校验菜单名称是否唯一
   * 
   * @param menuName 菜单名称
   * @param parentId 父菜单ID
   * @param menuId 菜单ID
   * @return 结果
   */
  async checkMenuNameUnique(menu: SysMenu): Promise<boolean> {
    const menuId = menu.menuId ? menu.menuId : -1;
    const info = await this.menuRepository.checkMenuNameUnique(menu);
    if (info && info.menuId !== menuId) {
      return UserConstants.NOT_UNIQUE;
    }
    return UserConstants.UNIQUE;
  }
}
