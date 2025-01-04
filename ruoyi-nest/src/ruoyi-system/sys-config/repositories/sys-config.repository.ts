import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysConfig } from '../entities/sys-config.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';

@Injectable()
export class SysConfigRepository {
  constructor(
    @InjectRepository(SysConfig)
    private readonly configRepository: Repository<SysConfig>,
    private readonly queryUtils: QueryUtils,
    private readonly sqlLoggerUtils: SqlLoggerUtils,
  ) {}

  private selectConfigVo(): SelectQueryBuilder<SysConfig> {
    return this.configRepository
      .createQueryBuilder('c')
      .select([
        'c.configId',
        'c.configName',
        'c.configKey',
        'c.configValue',
        'c.configType',
        'c.createBy',
        'c.createTime',
        'c.updateBy',
        'c.updateTime',
        'c.remark',
      ]);
  }

  async selectConfig(config: SysConfig): Promise<SysConfig> {
    const queryBuilder = this.selectConfigVo();

    if (config.configId) {
      queryBuilder.andWhere('c.configId = :configId', {
        configId: config.configId,
      });
    }
    if (config.configKey) {
      queryBuilder.andWhere('c.configKey = :configKey', {
        configKey: config.configKey,
      });
    }

    this.sqlLoggerUtils.log(queryBuilder, 'selectConfig');
    return queryBuilder.getOne();
  }

  async selectConfigById(configId: number): Promise<SysConfig> {
    const queryBuilder = this.selectConfigVo().where('c.configId = :configId', {
      configId,
    });

    this.sqlLoggerUtils.log(queryBuilder, 'selectConfigById');
    return queryBuilder.getOne();
  }

  async selectConfigList(query: SysConfig): Promise<[SysConfig[], number]> {
    const queryBuilder = this.selectConfigVo();

    if (query.configName) {
      queryBuilder.andWhere('c.configName LIKE :configName', {
        configName: `%${query.configName}%`,
      });
    }
    if (query.configType) {
      queryBuilder.andWhere('c.configType = :configType', {
        configType: query.configType,
      });
    }
    if (query.configKey) {
      queryBuilder.andWhere('c.configKey LIKE :configKey', {
        configKey: `%${query.configKey}%`,
      });
    }
    if (query.params?.beginTime && query.params?.endTime) {
      queryBuilder.andWhere('c.createTime BETWEEN :beginTime AND :endTime', {
        beginTime: query.params.beginTime,
        endTime: query.params.endTime,
      });
    }

    this.sqlLoggerUtils.log(queryBuilder, 'selectConfigList');
    return this.queryUtils.executeQuery(queryBuilder, query);
  }

  async checkConfigKeyUnique(configKey: string): Promise<SysConfig> {
    const queryBuilder = this.selectConfigVo().where(
      'c.configKey = :configKey',
      { configKey },
    );

    this.sqlLoggerUtils.log(queryBuilder, 'checkConfigKeyUnique');
    return queryBuilder.getOne();
  }

  async insertConfig(config: SysConfig): Promise<number> {
    const insertObj: any = {};
    if (config.configName != null && config.configName != '')
      insertObj.configName = config.configName;
    if (config.configKey != null && config.configKey != '')
      insertObj.configKey = config.configKey;
    if (config.configValue != null && config.configValue != '')
      insertObj.configValue = config.configValue;
    if (config.configType != null && config.configType != '')
      insertObj.configType = config.configType;
    if (config.createBy != null && config.createBy != '')
      insertObj.createBy = config.createBy;
    if (config.remark != null && config.remark != '')
      insertObj.remark = config.remark;
    insertObj.createTime = new Date();

    const queryBuilder = this.configRepository
      .createQueryBuilder('c')
      .insert()
      .into(SysConfig)
      .values(insertObj);

    this.sqlLoggerUtils.log(queryBuilder, 'insertConfig');
    const result = await queryBuilder.execute();
    return result.identifiers[0].configId;
  }

  async updateConfig(configId: number, config: SysConfig): Promise<number> {
    const updateData: any = {
      updateTime: new Date(), // 更新时间总是需要更新的
    };

    if (config.configName != null && config.configName != '')
      updateData.configName = config.configName;
    if (config.configKey != null && config.configKey != '')
      updateData.configKey = config.configKey;
    if (config.configValue != null && config.configValue != '')
      updateData.configValue = config.configValue;
    if (config.configType != null && config.configType != '')
      updateData.configType = config.configType;
    if (config.updateBy != null && config.updateBy != '')
      updateData.updateBy = config.updateBy;
    if (config.remark != null) updateData.remark = config.remark;

    const result = await this.configRepository.update(configId, updateData);
    return result.affected;
  }

  async deleteConfigById(configId: number): Promise<boolean> {
    const result = await this.configRepository.delete(configId);
    return result.affected > 0;
  }

  async deleteConfigByIds(configIds: number[]): Promise<boolean> {
    const result = await this.configRepository.delete(configIds);
    return result.affected > 0;
  }
}
