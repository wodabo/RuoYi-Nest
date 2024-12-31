import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysMenu } from '../entities/sys-menu.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';

@Injectable()
export class SysMenuRepository {
   

    constructor(
        @InjectRepository(SysMenu)
        private readonly menuRepository: Repository<SysMenu>,
        private readonly queryUtils: QueryUtils,
        private readonly sqlLoggerUtils: SqlLoggerUtils 
    ) {}


    private selectMenuVo(){
        return this.menuRepository.createQueryBuilder('m')
            .select([
                'm.menuId',
                'm.menuName',
                'm.parentId',
                'm.orderNum',
                'm.path',
                'm.component',
                'm.query',
                'm.routeName',
                'm.isFrame',
                'm.isCache',
                'm.menuType',
                'm.visible',
                'm.status',
                'IFNULL(m.perms, \'\') as perms',
                'm.icon',
                'm.createTime'
            ]);
    }

    /**
     * 查询系统菜单列表
     */
    async selectMenuList(query: SysMenu): Promise<SysMenu[]> {
        const queryBuilder = this.selectMenuVo();

        if (query.menuName) {
            queryBuilder.andWhere('m.menuName LIKE :menuName', { menuName: `%${query.menuName}%` });
        }
        if (query.visible) {
            queryBuilder.andWhere('m.visible = :visible', { visible: query.visible });
        }
        if (query.status) {
            queryBuilder.andWhere('m.status = :status', { status: query.status });
        }

        queryBuilder.orderBy('m.parentId', 'ASC').addOrderBy('m.orderNum', 'ASC');

        this.sqlLoggerUtils.log(queryBuilder, 'selectMenuList');
        const [row,total] = await this.queryUtils.executeQuery(queryBuilder, query);
        return row
    }   

    // /**
    //  * 根据用户所有权限
    //  */
    // async selectMenuPerms(): Promise<string[]> {
    //     const menus = await this.menuRepository.createQueryBuilder('m')
    //         .select('m.perms')
    //         .where('m.status = :status', { status: '0' })
    //         .andWhere('m.perms IS NOT NULL')
    //         .getMany();

    //     return menus.map(menu => menu.perms);
    // }

    /**
     * 根据用户查询系统菜单列表
     */
    async selectMenuListByUserId(query: SysMenu): Promise<SysMenu[]> {
        const queryBuilder = this.menuRepository.createQueryBuilder('m')
            .select([
                'm.menuId',
                'm.parentId',
                'm.menuName', 
                'm.path',
                'm.component',
                'm.query',
                'm.routeName',
                'm.visible',
                'm.status',
                'IFNULL(m.perms, \'\') as perms',
                'm.isFrame',
                'm.isCache',
                'm.menuType',
                'm.icon',
                'm.orderNum',
                'm.createTime'
            ])
            .distinct(true)
            .leftJoin('sys_role_menu', 'rm', 'm.menuId = rm.menu_id')
            .leftJoin('sys_user_role', 'ur', 'rm.role_id = ur.role_id')
            .leftJoin('sys_role', 'ro', 'ur.role_id = ro.role_id')
            .where('ur.user_id = :userId', { userId: query.params.userId });

        if (query.menuName) {
            queryBuilder.andWhere('m.menuName LIKE :menuName', { menuName: `%${query.menuName}%` });
        }
        if (query.visible) {
            queryBuilder.andWhere('m.visible = :visible', { visible: query.visible });
        }
        if (query.status) {
            queryBuilder.andWhere('m.status = :status', { status: query.status });
        }

        queryBuilder.orderBy('m.parentId', 'ASC').addOrderBy('m.orderNum', 'ASC');

        this.sqlLoggerUtils.log(queryBuilder, 'selectMenuListByUserId');
        const [row,total] = await this.queryUtils.executeQuery(queryBuilder, query);
        return row
    }

    /**
     * 根据角色ID查询权限
     */
    async selectMenuPermsByRoleId(roleId: number): Promise<string[]> {
        const queryBuilder = this.menuRepository.createQueryBuilder('m')
            .select('m.perms')
            .leftJoin('sys_role_menu', 'rm', 'm.menuId = rm.menu_id')
            .distinct(true)
            .where('m.status = :status', { status: '0' })
            .andWhere('rm.role_id = :roleId', { roleId });

        this.sqlLoggerUtils.log(queryBuilder, 'selectMenuPermsByRoleId');
        return queryBuilder.getMany().then(d => d.map(d => d.perms));
    }

    /**
     * 根据用户ID查询权限
     */
    async selectMenuPermsByUserId(userId: number): Promise<string[]> {
        const queryBuilder = this.menuRepository.createQueryBuilder('m')
            .select('m.perms')
            .leftJoin('sys_role_menu', 'rm', 'm.menuId = rm.menu_id')
            .leftJoin('sys_user_role', 'ur', 'rm.role_id = ur.role_id')
            .leftJoin('sys_role', 'r', 'r.role_id = ur.role_id')
            .distinct(true)
            .where('m.status = :status', { status: '0' })
            .andWhere('r.status = :roleStatus', { roleStatus: '0' })
            .andWhere('ur.user_id = :userId', { userId });

        this.sqlLoggerUtils.log(queryBuilder, 'selectMenuPermsByUserId');
        return queryBuilder.getMany().then(d => d.map(d => d.perms));
    }

    /**
     * 根据用户ID查询菜单
     */
    async selectMenuTreeAll(): Promise<SysMenu[]> {
        const queryBuilder = this.menuRepository.createQueryBuilder('m')
            .select([
                'm.menuId',
                'm.parentId', 
                'm.menuName',
                'm.path',
                'm.component',
                'm.query',
                'm.routeName',
                'm.visible',
                'm.status',
                'IFNULL(m.perms, \'\') as perms',
                'm.isFrame',
                'm.isCache', 
                'm.menuType',
                'm.icon',
                'm.orderNum',
                'm.createTime'
            ])
            .distinct(true)
            .where('m.menuType IN (:...types)', { types: ['M', 'C'] })
            .andWhere('m.status = :status', { status: '0' })
            .orderBy('m.parentId', 'ASC')
            .addOrderBy('m.orderNum', 'ASC');

        this.sqlLoggerUtils.log(queryBuilder, 'selectMenuTreeAll');
        return queryBuilder.getMany();
    }

    /**
     * 根据用户ID查询菜单
     */
    async selectMenuTreeByUserId(userId: number): Promise<SysMenu[]> {
        const queryBuilder = this.menuRepository.createQueryBuilder('m')
            .select([
                'm.menuId',
                'm.parentId',
                'm.menuName',
                'm.path',
                'm.component',
                'm.query',
                'm.routeName',
                'm.visible',
                'm.status',
                'IFNULL(m.perms, \'\') as perms',
                'm.isFrame',
                'm.isCache',
                'm.menuType',
                'm.icon',
                'm.orderNum',
                'm.createTime'
            ])
            .distinct(true)
            .leftJoin('sys_role_menu', 'rm', 'm.menuId = rm.menu_id')
            .leftJoin('sys_user_role', 'ur', 'rm.role_id = ur.role_id')
            .leftJoin('sys_role', 'ro', 'ur.role_id = ro.role_id')
            .leftJoin('sys_user', 'u', 'ur.user_id = u.user_id')
            .where('u.user_id = :userId', { userId })
            .andWhere('m.menuType IN (:...types)', { types: ['M', 'C'] })
            .andWhere('m.status = :status', { status: '0' })
            .andWhere('ro.status = :roleStatus', { roleStatus: '0' })
            .orderBy('m.parentId', 'ASC')
            .addOrderBy('m.orderNum', 'ASC');

        this.sqlLoggerUtils.log(queryBuilder, 'selectMenuTreeByUserId');
        return queryBuilder.getMany();
    }

    /**
     * 根据角色ID查询菜单树信息
     */
    async selectMenuListByRoleId(roleId: number, menuCheckStrictly: boolean): Promise<number[]> {
        const queryBuilder = this.menuRepository.createQueryBuilder('m')
            .select('m.menuId')
            .leftJoin('sys_role_menu', 'rm', 'm.menuId = rm.menu_id')
            .where('rm.role_id = :roleId', { roleId });

        if (menuCheckStrictly) {
            queryBuilder.andWhere('m.menuId NOT IN ' +
                '(SELECT m.parentId FROM sys_menu m ' +
                'INNER JOIN sys_role_menu rm ON m.menuId = rm.menu_id AND rm.role_id = :roleId)', { roleId });
        }

        queryBuilder.orderBy('m.parentId', 'ASC').addOrderBy('m.orderNum', 'ASC');

        const menus = await queryBuilder.getMany();
        return menus.map(menu => menu.menuId);
    }

    /**
     * 根据菜单ID查询信息
     */
    async selectMenuById(menuId: number): Promise<SysMenu> {
        const queryBuilder = this.selectMenuVo()
            .where('m.menuId = :menuId', { menuId });

        this.sqlLoggerUtils.log(queryBuilder, 'selectMenuById');
        return queryBuilder.getOne();
    }

    /**
     * 是否存在菜单子节点
     */
    async hasChildByMenuId(menuId: number): Promise<number> {
        const result = await this.menuRepository.createQueryBuilder('m')
            .select('COUNT(1)', 'count')
            .where('m.parentId = :menuId', { menuId })
            .getRawOne();
        return result.count;
    }

    /**
     * 新增菜单信息
     */
    async insertMenu(menu: SysMenu): Promise<number> {
        const insertObj: any = {};
        if (menu.menuId != null && menu.menuId != 0) insertObj.menuId = menu.menuId;
        if (menu.parentId != null && menu.parentId != 0) insertObj.parentId = menu.parentId;
        if (menu.menuName != null && menu.menuName != '') insertObj.menuName = menu.menuName;
        if (menu.orderNum != null) insertObj.orderNum = menu.orderNum;
        if (menu.path != null && menu.path != '') insertObj.path = menu.path;
        if (menu.component != null && menu.component != '') insertObj.component = menu.component;
        if (menu.query != null && menu.query != '') insertObj.query = menu.query;
        if (menu.routeName != null) insertObj.routeName = menu.routeName;
        if (menu.isFrame != null && menu.isFrame != '') insertObj.isFrame = menu.isFrame;
        if (menu.isCache != null && menu.isCache != '') insertObj.isCache = menu.isCache;
        if (menu.menuType != null && menu.menuType != '') insertObj.menuType = menu.menuType;
        if (menu.visible != null) insertObj.visible = menu.visible;
        if (menu.status != null) insertObj.status = menu.status;
        if (menu.perms != null && menu.perms != '') insertObj.perms = menu.perms;
        if (menu.icon != null && menu.icon != '') insertObj.icon = menu.icon;
        if (menu.createBy != null && menu.createBy != '') insertObj.createBy = menu.createBy;
        insertObj.createTime = new Date();

        const queryBuilder = this.menuRepository.createQueryBuilder('m')
            .insert()
            .into(SysMenu)
            .values(insertObj);

        this.sqlLoggerUtils.log(queryBuilder, 'insertMenu');
        const result = await queryBuilder.execute();
        return result.identifiers[0].menuId;
    }

    /**
     * 修改菜单信息
     */
    async updateMenu(menu: SysMenu): Promise<number> {
        const updateData: any = {
            updateTime: new Date() // 更新时间总是需要更新的
        };

        // 只有当字段有值时才添加到更新对象中
        if (menu.menuName != null && menu.menuName != '') updateData.menuName = menu.menuName;
        if (menu.parentId != null) updateData.parentId = menu.parentId;
        if (menu.orderNum != null) updateData.orderNum = menu.orderNum;
        if (menu.path != null && menu.path != '') updateData.path = menu.path;
        if (menu.component != null) updateData.component = menu.component;
        if (menu.query != null) updateData.query = menu.query;
        if (menu.routeName != null) updateData.routeName = menu.routeName;
        if (menu.isFrame != null && menu.isFrame != '') updateData.isFrame = menu.isFrame;
        if (menu.isCache != null && menu.isCache != '') updateData.isCache = menu.isCache;
        if (menu.menuType != null && menu.menuType != '') updateData.menuType = menu.menuType;
        if (menu.visible != null) updateData.visible = menu.visible;
        if (menu.status != null) updateData.status = menu.status;
        if (menu.perms != null) updateData.perms = menu.perms;
        if (menu.icon != null && menu.icon != '') updateData.icon = menu.icon;
        if (menu.remark != null && menu.remark != '') updateData.remark = menu.remark;
        if (menu.updateBy != null && menu.updateBy != '') updateData.updateBy = menu.updateBy;

        const result = await this.menuRepository.update(menu.menuId, updateData);
        return result.affected;
    }

    /**
     * 删除菜单管理信息
     */
    async deleteMenuById(menuId: number): Promise<number> {
        const result = await this.menuRepository.delete(menuId);
        return result.affected;
    }

    /**
     * 校验菜单名称是否唯一
     */
    async checkMenuNameUnique(menu: SysMenu): Promise<SysMenu> {
        const queryBuilder = this.selectMenuVo()
            .where('m.menuName = :menuName', { menuName: menu.menuName })
            .andWhere('m.parentId = :parentId', { parentId: menu.parentId })
            .limit(1);

        this.sqlLoggerUtils.log(queryBuilder, 'checkMenuNameUnique');
        return queryBuilder.getOne();
    }
}
