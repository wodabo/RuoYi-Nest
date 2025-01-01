import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SysMenuService } from '~/ruoyi-system/sys-menu/sys-menu.service';
import { SysMenu } from '~/ruoyi-system/sys-menu/entities/sys-menu.entity';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { TreeUtils } from '~/ruoyi-share/utils/tree.utils';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { UserConstants } from '~/ruoyi-share/constant/UserConstants';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { Log } from '~/ruoyi-share/annotation/Log';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';

@ApiTags('菜单管理')
@Controller('system/menu')
export class SysMenuController extends BaseController {
  constructor(
    private readonly menuService: SysMenuService,
    private readonly treeUtils:TreeUtils,
    private readonly stringUtils:StringUtils    
  ) {
    super();
  }

  @PreAuthorize('hasPermi("system:menu:list")')
  @Get('list')
  @ApiOperation({ summary: '获取菜单列表' })
  async list(@Query() query: SysMenu,@Request() req): Promise<AjaxResult> {
    const loginUser = req.user;
    const currentUser = loginUser.user
    const menus = await this.menuService.selectMenuListWithUserId(query,currentUser.userId);
    return this.success(menus)
  }

 

  @Get('treeselect')
  @ApiOperation({ summary: '获取菜单下拉树列表' })
  async treeselect(@Query() menu: SysMenu, @Request() req): Promise<AjaxResult> {
    const loginUser = req.user;
    const currentUser = loginUser.user
    const menus = await this.menuService.selectMenuListWithUserId(menu, currentUser.userId);
    const transformedMenus = menus.map(menu => ({
      id: menu.menuId,
      parentId: menu.parentId,
      label: menu.menuName,
    }));
    const tree = await this.treeUtils.arrayToTree(transformedMenus, 'id', 'parentId', 'children');
    return this.success(tree);
  }

   /**
   * 根据菜单编号获取详细信息
   */
   @PreAuthorize("hasPermi('system:menu:query')")
   @Get(':menuId')
   @ApiOperation({ summary: '根据菜单编号获取详细信息' })
   async getInfo(@Param('menuId') menuId: number): Promise<AjaxResult> {
     return this.success(await this.menuService.selectMenuById(menuId));
   }

  @Get('roleMenuTreeselect/:roleId')
  @ApiOperation({ summary: '加载对应角色菜单列表树' })
  async roleMenuTreeselect(@Param('roleId') roleId: number,@Request() req): Promise<AjaxResult> {
    const loginUser = req.user;
    const currentUser = loginUser.user
    const menus = await this.menuService.selectMenuList(currentUser.userId);
    const ajax = AjaxResult.success();
    ajax.checkedKeys = await this.menuService.selectMenuListByRoleId(roleId);
    const transformedMenus = menus.map(menu => ({
      id: menu.menuId,
      parentId: menu.parentId,
      label: menu.menuName,
    }));
    const tree = await this.treeUtils.arrayToTree(transformedMenus, 'id', 'parentId', 'children');
    ajax.menus = tree;
    return ajax;
  }

  @PreAuthorize("hasPermi('system:menu:add')")
  @Log({ title: '菜单管理', businessType: BusinessType.INSERT })  
  @Post()
  @ApiOperation({ summary: '新增菜单' })
  async add(@Body() menu: SysMenu,@Request() req): Promise<AjaxResult> {
    const loginUser = req.user;
    if (!await this.menuService.checkMenuNameUnique(menu)) {
      return this.error(`新增菜单'${menu.menuName}'失败，菜单名称已存在`);
    } else if (UserConstants.YES_FRAME === menu.isFrame && !this.stringUtils.isHttp(menu.path)) {
      return this.error(`新增菜单'${menu.menuName}'失败，地址必须以http(s)://开头`);
    }
    menu.createBy = loginUser.getUsername();
    return this.toAjax(await this.menuService.insertMenu(menu));
  }

  @PreAuthorize("hasPermi('system:menu:edit')")
  @Log({ title: '菜单管理', businessType: BusinessType.UPDATE })
  @Put()
  @ApiOperation({ summary: '修改菜单' })
  async edit(@Body() menu: SysMenu,@Request() req): Promise<AjaxResult> {
    const loginUser = req.user;
    if (!await this.menuService.checkMenuNameUnique(menu)) {
      return this.error(`修改菜单'${menu.menuName}'失败，菜单名称已存在`);
    } else if (UserConstants.YES_FRAME === menu.isFrame && !this.stringUtils.isHttp(menu.path)) {
      return this.error(`修改菜单'${menu.menuName}'失败，地址必须以http(s)://开头`);
    } else if (menu.menuId === menu.parentId) {
      return this.error(`修改菜单'${menu.menuName}'失败，上级菜单不能选择自己`);
    }
    menu.updateBy = loginUser.getUsername();
    return this.toAjax(await this.menuService.updateMenu(menu));
  }

  @PreAuthorize("hasPermi('system:menu:remove')")
  @Log({ title: '菜单管理', businessType: BusinessType.DELETE })
  @Delete(':menuId')
  @ApiOperation({ summary: '删除菜单' })
  async remove(@Param('menuId') menuId: number): Promise<AjaxResult> {
    if (await this.menuService.hasChildByMenuId(menuId)) {
      return this.warn('存在子菜单,不允许删除');
    }
    if (await this.menuService.checkMenuExistRole(menuId)) {
      return this.warn('菜单已分配,不允许删除');
    }
    return this.toAjax(await this.menuService.deleteMenuById(menuId));
  }
}
