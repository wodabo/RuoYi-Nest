import { RedisCacheService } from '~/ruoyi-share/redis/redis-cache.service';
import { SysDictData } from '~/ruoyi-system/sys-dict-data/entities/sys-dict-data.entity';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { CacheConstants } from '~/ruoyi-share/constant/CacheConstants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DictUtils {
  /**
   * 分隔符
   */
  public readonly SEPARATOR = ',';

  constructor(
    private readonly redisCacheService: RedisCacheService,
    private readonly stringUtils: StringUtils,
  ) {}

  /**
   * 设置字典缓存
   *
   * @param key 参数键
   * @param dictDatas 字典数据列表
   */
  public async setDictCache(
    key: string,
    dictDatas: SysDictData[],
  ): Promise<void> {
    await this.redisCacheService.setCacheObject(
      this.getCacheKey(key),
      dictDatas,
    );
  }

  /**
   * 获取字典缓存
   *
   * @param key 参数键
   * @return dictDatas 字典数据列表
   */
  public async getDictCache(key: string): Promise<SysDictData[] | null> {
    const arrayCache = await this.redisCacheService.getCacheObject<
      SysDictData[]
    >(this.getCacheKey(key));

    if (this.stringUtils.isNotNull(arrayCache)) {
      return arrayCache as SysDictData[];
    }
    return null;
  }

  /**
   * 根据字典类型和字典值获取字典标签
   *
   * @param dictType 字典类型
   * @param dictValue 字典值
   * @return 字典标签
   */
  public async getDictLabel(
    dictType: string,
    dictValue: string,
  ): Promise<string> {
    if (this.stringUtils.isEmpty(dictValue)) {
      return '';
    }
    return await this.getDictLabelWithSeparator(
      dictType,
      dictValue,
      this.SEPARATOR,
    );
  }

  /**
   * 根据字典类型和字典标签获取字典值
   *
   * @param dictType 字典类型
   * @param dictLabel 字典标签
   * @return 字典值
   */
  public async getDictValue(
    dictType: string,
    dictLabel: string,
  ): Promise<string> {
    if (this.stringUtils.isEmpty(dictLabel)) {
      return '';
    }
    return await this.getDictValueWithSeparator(
      dictType,
      dictLabel,
      this.SEPARATOR,
    );
  }

  /**
   * 根据字典类型和字典值获取字典标签
   *
   * @param dictType 字典类型
   * @param dictValue 字典值
   * @param separator 分隔符
   * @return 字典标签
   */
  public async getDictLabelWithSeparator(
    dictType: string,
    dictValue: string,
    separator: string,
  ): Promise<string> {
    const propertyString: string[] = [];
    const datas = await this.getDictCache(dictType);
    if (this.stringUtils.isNull(datas)) {
      return '';
    }
    if (this.stringUtils.containsAny(separator, dictValue)) {
      for (const dict of datas) {
        for (const value of dictValue.split(separator)) {
          if (value === dict.dictValue) {
            propertyString.push(dict.dictLabel);
            break;
          }
        }
      }
    } else {
      for (const dict of datas) {
        if (dictValue === dict.dictValue) {
          return dict.dictLabel;
        }
      }
    }
    return propertyString.join(separator);
  }

  /**
   * 根据字典类型和字典标签获取字典值
   *
   * @param dictType 字典类型
   * @param dictLabel 字典标签
   * @param separator 分隔符
   * @return 字典值
   */
  public async getDictValueWithSeparator(
    dictType: string,
    dictLabel: string,
    separator: string,
  ): Promise<string> {
    const propertyString: string[] = [];
    const datas = await this.getDictCache(dictType);
    if (this.stringUtils.isNull(datas)) {
      return '';
    }
    if (this.stringUtils.containsAny(separator, dictLabel)) {
      for (const dict of datas) {
        for (const label of dictLabel.split(separator)) {
          if (label === dict.dictLabel) {
            propertyString.push(dict.dictValue);
            break;
          }
        }
      }
    } else {
      for (const dict of datas) {
        if (dictLabel === dict.dictLabel) {
          return dict.dictValue;
        }
      }
    }
    return propertyString.join(separator);
  }

  /**
   * 根据字典类型获取字典所有值
   *
   * @param dictType 字典类型
   * @return 字典值
   */
  public async getDictValues(dictType: string): Promise<string> {
    const propertyString: string[] = [];
    const datas = await this.getDictCache(dictType);
    if (this.stringUtils.isNull(datas)) {
      return '';
    }
    for (const dict of datas) {
      propertyString.push(dict.dictValue);
    }
    return propertyString.join(this.SEPARATOR);
  }

  /**
   * 根据字典类型获取字典所有标签
   *
   * @param dictType 字典类型
   * @return 字典值
   */
  public async getDictLabels(dictType: string): Promise<string> {
    const propertyString: string[] = [];
    const datas = await this.getDictCache(dictType);
    if (this.stringUtils.isNull(datas)) {
      return '';
    }
    for (const dict of datas) {
      propertyString.push(dict.dictLabel);
    }
    return propertyString.join(this.SEPARATOR);
  }

  /**
   * 删除指定字典缓存
   *
   * @param key 字典键
   */
  public async removeDictCache(key: string): Promise<void> {
    await this.redisCacheService.deleteObject(this.getCacheKey(key));
  }

  /**
   * 清空字典缓存
   */
  public async clearDictCache(): Promise<void> {
    const keys = await this.redisCacheService.keys(
      CacheConstants.SYS_DICT_KEY + '*',
    );
    await this.redisCacheService.deleteObjects(keys);
  }

  /**
   * 设置cache key
   *
   * @param configKey 参数键
   * @return 缓存键key
   */
  public getCacheKey(configKey: string): string {
    return CacheConstants.SYS_DICT_KEY + configKey;
  }
}
