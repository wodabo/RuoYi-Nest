import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysOperlog } from '../entities/sys-operlog.entity';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';

@Injectable()
export class SysOperlogRepository {
  constructor(
    @InjectRepository(SysOperlog)
    private readonly operLogRepository: Repository<SysOperlog>,
    private readonly queryUtils: QueryUtils,
    private readonly sqlLoggerUtils: SqlLoggerUtils,
  ) {}

  private selectOperLogVo(): SelectQueryBuilder<SysOperlog> {
    return this.operLogRepository
      .createQueryBuilder('o')
      .select([
        'o.operId',
        'o.title',
        'o.businessType',
        'o.method',
        'o.requestMethod',
        'o.operatorType',
        'o.operName',
        'o.deptName',
        'o.operUrl',
        'o.operIp',
        'o.operLocation',
        'o.operParam',
        'o.jsonResult',
        'o.status',
        'o.errorMsg',
        'o.operTime',
        'o.costTime',
      ]);
  }

  async insertOperlog(operLog: SysOperlog): Promise<void> {
    const insertObj: any = {};
    if (operLog.title != null && operLog.title != '')
      insertObj.title = operLog.title;
    if (operLog.businessType != null)
      insertObj.businessType = operLog.businessType;
    if (operLog.method != null && operLog.method != '')
      insertObj.method = operLog.method;
    if (operLog.requestMethod != null && operLog.requestMethod != '')
      insertObj.requestMethod = operLog.requestMethod;
    if (operLog.operatorType != null)
      insertObj.operatorType = operLog.operatorType;
    if (operLog.operName != null && operLog.operName != '')
      insertObj.operName = operLog.operName;
    if (operLog.deptName != null && operLog.deptName != '')
      insertObj.deptName = operLog.deptName;
    if (operLog.operUrl != null && operLog.operUrl != '')
      insertObj.operUrl = operLog.operUrl;
    if (operLog.operIp != null && operLog.operIp != '')
      insertObj.operIp = operLog.operIp;
    if (operLog.operLocation != null && operLog.operLocation != '')
      insertObj.operLocation = operLog.operLocation;
    if (operLog.operParam != null && operLog.operParam != '')
      insertObj.operParam = operLog.operParam;
    if (operLog.jsonResult != null && operLog.jsonResult != '')
      insertObj.jsonResult = operLog.jsonResult;
    if (operLog.status != null) insertObj.status = operLog.status;
    if (operLog.errorMsg != null && operLog.errorMsg != '')
      insertObj.errorMsg = operLog.errorMsg;
    if (operLog.costTime != null) insertObj.costTime = operLog.costTime;
    insertObj.operTime = new Date();

    const queryBuilder = this.operLogRepository
      .createQueryBuilder('o')
      .insert()
      .into(SysOperlog, Object.keys(insertObj))
      .values(insertObj);

    this.sqlLoggerUtils.log(queryBuilder, 'insertOperlog');
    await queryBuilder.execute();
  }

  async selectOperLogList(
    operLog: SysOperlog,
  ): Promise<[SysOperlog[], number]> {
    const queryBuilder = this.selectOperLogVo();

    if (operLog.operIp) {
      queryBuilder.andWhere('o.operIp LIKE :operIp', {
        operIp: `%${operLog.operIp}%`,
      });
    }
    if (operLog.title) {
      queryBuilder.andWhere('o.title LIKE :title', {
        title: `%${operLog.title}%`,
      });
    }
    if (operLog.businessType) {
      queryBuilder.andWhere('o.businessType = :businessType', {
        businessType: operLog.businessType,
      });
    }
    if (operLog.businessTypes) {
      queryBuilder.andWhere('o.businessType IN (:...businessTypes)', {
        businessTypes: operLog.businessTypes,
      });
    }
    if (operLog.status) {
      queryBuilder.andWhere('o.status = :status', { status: operLog.status });
    }
    if (operLog.operName) {
      queryBuilder.andWhere('o.operName LIKE :operName', {
        operName: `%${operLog.operName}%`,
      });
    }
    if (operLog.params?.beginTime && operLog.params?.endTime) {
      queryBuilder.andWhere('o.operTime BETWEEN :beginTime AND :endTime', {
        beginTime: operLog.params.beginTime,
        endTime: operLog.params.endTime,
      });
    }

    this.sqlLoggerUtils.log(queryBuilder, 'selectOperLogList');
    return this.queryUtils.executeQuery(queryBuilder, operLog);
  }

  async deleteOperLogByIds(operIds: number[]): Promise<number> {
    const result = await this.operLogRepository.delete(operIds);
    return result.affected;
  }

  async selectOperLogById(operId: number): Promise<SysOperlog> {
    const queryBuilder = this.selectOperLogVo().where('o.operId = :operId', {
      operId,
    });

    this.sqlLoggerUtils.log(queryBuilder, 'selectOperLogById');
    return queryBuilder.getOne();
  }

  async cleanOperLog(): Promise<void> {
    await this.operLogRepository.clear();
  }
}
