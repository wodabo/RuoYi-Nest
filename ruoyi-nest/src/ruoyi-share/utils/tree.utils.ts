import { Injectable } from '@nestjs/common';

@Injectable()
export class TreeUtils {
  /**
   * 将对象数组转换为树结构
   *
   * @param list 对象数组
   * @param idKey 对象的唯一标识键
   * @param parentKey 对象的父标识键
   * @param childrenKey 存放子对象的键
   * @return 树结构对象数组
   */
  async arrayToTree(
    list: any[],
    idKey: string,
    parentKey: string,
    childrenKey: string,
  ): Promise<any[]> {
    const tree = [];
    const map = {};

    // 将对象数组转换为map对象
    for (const item of list) {
      const copy = { ...item };
      delete copy[parentKey]; // Remove parentKey from the copied object
      map[item[idKey]] = copy;
    }

    // 构建树结构
    for (const item of list) {
      const parent = map[item[parentKey]];
      if (parent) {
        if (!parent[childrenKey]) {
          parent[childrenKey] = [];
        }
        parent[childrenKey].push(map[item[idKey]]);
      } else {
        tree.push(map[item[idKey]]);
      }
    }

    return tree;
  }
}
