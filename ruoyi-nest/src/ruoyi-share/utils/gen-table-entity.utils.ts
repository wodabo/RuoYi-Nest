import { GenTable } from '~/ruoyi-generator/gen-table/entities/gen-table.entity';
import { GenConstants } from '~/ruoyi-share/constant/GenConstants';

export class GenTableEntityUtils {
  static isSub(obj: GenTable): boolean {
    return obj.tplCategory != null && obj.tplCategory === GenConstants.TPL_SUB;
  }

  static isTree(obj: GenTable): boolean {
    return obj.tplCategory != null && obj.tplCategory === GenConstants.TPL_TREE;
  }

  static isCrud(obj: GenTable): boolean {
    return obj.tplCategory != null && obj.tplCategory === GenConstants.TPL_CRUD;
  }

  static isSuperColumn(obj: GenTable, value: string): boolean {
    if (obj.tplCategory === GenConstants.TPL_TREE) {
      return [...GenConstants.TREE_ENTITY, ...GenConstants.BASE_ENTITY].some(
        (d) => d?.toLowerCase() === value?.toLowerCase(),
      );
    }
    return GenConstants.BASE_ENTITY.some(
      (d) => d?.toLowerCase() === value?.toLowerCase(),
    );
  }
}
