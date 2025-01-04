import { GenTableEntityUtils } from './gen-table-entity.utils';
import { StringUtils } from './string.utils';

export class HbsSqlRenderUtils {
  public static renderSql(context) {
    // 举例 SysConfig => Config
    const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '');
    // 举例 SysConfig => config
    const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter =
      StringUtils.uncapitalize(ClassNameWithoutSysPrefix);
    // 举例 config => c
    const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0);
    // 举例 sys_config => sys-config
    const tableNameWithMiddleLine = context.tableName.replace(/_/g, '-');
    const BaseEntity = GenTableEntityUtils.isCrud(context.table)
      ? 'BaseEntity'
      : 'TreeEntity';
    return `
-- 菜单 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('${context.functionName}表', '3', '1', '${context.businessName}', '${context.moduleName}/${context.businessName}/index', 1, 0, 'C', '0', '0', '${context.permissionPrefix}:list', '#', 'admin', sysdate(), '', null, '${context.functionName}菜单');

-- 按钮父菜单ID
SELECT @parentId := LAST_INSERT_ID();

-- 按钮 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('${context.functionName}表查询', @parentId, '1',  '#', '', 1, 0, 'F', '0', '0', '${context.permissionPrefix}:query',        '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('${context.functionName}表新增', @parentId, '2',  '#', '', 1, 0, 'F', '0', '0', '${context.permissionPrefix}:add',          '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('${context.functionName}表修改', @parentId, '3',  '#', '', 1, 0, 'F', '0', '0', '${context.permissionPrefix}:edit',         '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('${context.functionName}表删除', @parentId, '4',  '#', '', 1, 0, 'F', '0', '0', '${context.permissionPrefix}:remove',       '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('${context.functionName}表导出', @parentId, '5',  '#', '', 1, 0, 'F', '0', '0', '${context.permissionPrefix}:export',       '#', 'admin', sysdate(), '', null, '');
        `;
  }
}
