import { Injectable } from '@nestjs/common';
import { SysDictTypeRepository } from './repositories/sys-dict-type.repository';
import { SysDictDataRepository } from '../sys-dict-data/repositories/sys-dict-data.repository';
import { SysDictType } from './entities/sys-dict-type.entity';
import { SysDictData } from '../sys-dict-data/entities/sys-dict-data.entity';
import { DictUtils } from '~/ruoyi-share/utils/dict.utils';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { DataSource, Transaction, EntityManager } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { UserConstants } from '~/ruoyi-share/constant/UserConstants';

@Injectable()
export class SysDictTypeService {
  constructor(
    private readonly dictTypeRepository: SysDictTypeRepository,
    private readonly dictDataRepository: SysDictDataRepository,
    @InjectDataSource() private dataSource: DataSource,
    private readonly stringUtils: StringUtils,
    private readonly dictUtils: DictUtils
  ) { }

  async init() {
    await this.loadingDictCache();
  }

  async selectDictTypeList(dictType: SysDictType): Promise<[SysDictType[], number]> {
    return this.dictTypeRepository.selectDictTypeList(dictType);
  }

  async selectDictTypeAll(): Promise<SysDictType[]> {
    return this.dictTypeRepository.selectDictTypeAll();
  }

  async selectDictDataByType(dictType: string): Promise<SysDictData[]> {
    let dictDatas = await this.dictUtils.getDictCache(dictType);
    if (this.stringUtils.isArrayNotEmpty(dictDatas)) {
      return dictDatas;
    }
    dictDatas = await this.dictDataRepository.selectDictDataByType(dictType);
    if (this.stringUtils.isArrayNotEmpty(dictDatas)) {
      this.dictUtils.setDictCache(dictType, dictDatas);
      return dictDatas;
    }
    return null;
  }

  async selectDictTypeById(dictId: number): Promise<SysDictType> {
    return this.dictTypeRepository.selectDictTypeById(dictId);
  }

  async selectDictTypeByType(dictType: string): Promise<SysDictType> {
    return this.dictTypeRepository.selectDictTypeByType(dictType);
  }

  async deleteDictTypeByIds(dictIds: number[]): Promise<void> {
    for (const dictId of dictIds) {
      const dictType = await this.selectDictTypeById(dictId);
      if (await this.dictDataRepository.countDictDataByType(dictType.dictType) > 0) {
        throw new ServiceException(`${dictType.dictName}已分配,不能删除`);
      }
      await this.dictTypeRepository.deleteDictTypeById(dictId);
      this.dictUtils.removeDictCache(dictType.dictType);
    }
  }

  async loadingDictCache(): Promise<void> {
    const dictData = new SysDictData();
    dictData.status = '0';
    const [dictDataList, total] = await this.dictDataRepository.selectDictDataList(dictData);
    const dictDataMap = dictDataList.reduce((map, item) => {
      if (!map[item.dictType]) {
        map[item.dictType] = [];
      }
      map[item.dictType].push(item);
      return map;
    }, {});
    for (const [key, value] of Object.entries(dictDataMap)) {
      this.dictUtils.setDictCache(key, (value as SysDictData[]).sort((a, b) => a.dictSort - b.dictSort));
    }
  }

  async clearDictCache(): Promise<void> {
    this.dictUtils.clearDictCache();
  }

  async resetDictCache(): Promise<void> {
    await this.clearDictCache();
    await this.loadingDictCache();
  }

  async insertDictType(dict: SysDictType): Promise<number> {
    const row = await this.dictTypeRepository.insertDictType(dict);
    if (row > 0) {
      this.dictUtils.setDictCache(dict.dictType, null);
    }
    return row;
  }

  async updateDictType(dict: SysDictType): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const oldDict = await this.dictTypeRepository.selectDictTypeById(dict.dictId);
      await this.dictDataRepository.updateDictDataType(oldDict.dictType, dict.dictType);
      const row = await this.dictTypeRepository.updateDictType(dict);

      if (row > 0) {
        const dictDatas = await this.dictDataRepository.selectDictDataByType(dict.dictType);
        this.dictUtils.setDictCache(dict.dictType, dictDatas);
      }

      await queryRunner.commitTransaction();
      return row;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

  }

  async checkDictTypeUnique(dict: SysDictType): Promise<boolean> {
    const dictId = this.stringUtils.isNull(dict.dictId) ? -1 : dict.dictId;
    const dictType = await this.dictTypeRepository.checkDictTypeUnique(dict.dictType);
    if (this.stringUtils.isNotNull(dictType) && dictType.dictId !== dictId) {
      return UserConstants.NOT_UNIQUE;
    }
    return UserConstants.UNIQUE;
  }
}
