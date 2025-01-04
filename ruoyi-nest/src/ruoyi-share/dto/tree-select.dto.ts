import { SysDept } from '~/ruoyi-system/sys-dept/entities/sys-dept.entity';
import { SysMenu } from '~/ruoyi-system/sys-menu/entities/sys-menu.entity';

/**
 * Treeselect树结构实体类
 *
 * @author ruoyi
 */
export class TreeSelect {
  /** 节点ID */
  id: number;

  /** 节点名称 */
  label: string;

  /** 子节点 */
  children: TreeSelect[];
}
