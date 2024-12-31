import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysDictData } from '~/ruoyi-system/sys-dict-data/entities/sys-dict-data.entity';
import { SqlLoggerUtils } from '~/ruoyi-share/utils/sql-logger.utils';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';
import { QueryUtils } from '~/ruoyi-share/utils/query.utils';

@Injectable()
export class SysDictDataRepository {
    constructor(
        @InjectRepository(SysDictData)
        private readonly dictDataRepository: Repository<SysDictData>,
        private readonly sqlLoggerUtils: SqlLoggerUtils,
        private readonly contextHolderUtils: ContextHolderUtils,
        private readonly queryUtils: QueryUtils
    ) {}

    /**
     * 根据条件分页查询字典数据
     */
    async selectDictDataList(dictData: SysDictData): Promise<[SysDictData[], number]> {
        const queryBuilder = this.dictDataRepository.createQueryBuilder('d')

        if (dictData.dictType) {
            queryBuilder.andWhere('d.dictType = :dictType', { dictType: dictData.dictType });
        }
        if (dictData.dictLabel) {
            queryBuilder.andWhere('d.dictLabel LIKE :dictLabel', { dictLabel: `%${dictData.dictLabel}%` });
        }
        if (dictData.status) {
            queryBuilder.andWhere('d.status = :status', { status: dictData.status });
        }

        queryBuilder.orderBy('d.dictSort', 'ASC');
        this.sqlLoggerUtils.log(queryBuilder, 'selectDictDataList');
        return this.queryUtils.executeQuery(queryBuilder, dictData);
    }
    selectDictDataVo() {
        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.dictDataRepository.manager;
        return entityManager.createQueryBuilder(SysDictData, 'd')
            .select([
                'd.dictCode',
                'd.dictSort',
                'd.dictLabel',
                'd.dictValue',
                'd.dictType',
                'd.cssClass',
                'd.listClass',
                'd.isDefault',
                'd.status',
                'd.createBy',
                'd.createTime',
                'd.updateBy',
                'd.updateTime',
                'd.remark'
            ]);
    }

    /**
     * 根据字典类型查询字典数据
     */
    async selectDictDataByType(dictType: string): Promise<SysDictData[]> {
        const queryBuilder = this.selectDictDataVo()
            .where('d.dictType = :dictType', { dictType })
            .andWhere('d.status = :status', { status: '0' })
            .orderBy('d.dictSort', 'ASC');
        
        this.sqlLoggerUtils.log(queryBuilder, 'selectDictDataByType');
        return queryBuilder.getMany();
    }

    /**
     * 根据字典类型和字典键值查询字典数据信息
     */
    async selectDictLabel(dictType: string, dictValue: string): Promise<string> {
        const queryBuilder = this.dictDataRepository.createQueryBuilder('d')
            .select('d.dictLabel')
            .where('d.dictType = :dictType', { dictType })
            .andWhere('d.dictValue = :dictValue', { dictValue });

        this.sqlLoggerUtils.log(queryBuilder, 'selectDictLabel');
        const result = await queryBuilder.getOne();
        return result ? result.dictLabel : null;
    }

    /**
     * 根据字典数据ID查询信息
     */
    async selectDictDataById(dictCode: number): Promise<SysDictData> {
        const queryBuilder = this.dictDataRepository.createQueryBuilder('d')
            .where('d.dictCode = :dictCode', { dictCode });

        this.sqlLoggerUtils.log(queryBuilder, 'selectDictDataById');
        return queryBuilder.getOne();
    }

    /**
     * 查询字典数据
     */
    async countDictDataByType(dictType: string): Promise<number> {
        const queryBuilder = this.dictDataRepository.createQueryBuilder('d')
            .where('d.dictType = :dictType', { dictType });

        this.sqlLoggerUtils.log(queryBuilder, 'countDictDataByType');
        return queryBuilder.getCount();
    }

    /**
     * 通过字典ID删除字典数据信息
     */
    async deleteDictDataById(dictCode: number): Promise<void> {
        const queryBuilder = this.dictDataRepository.createQueryBuilder()
            .delete()
            .from(SysDictData)
            .where('dictCode = :dictCode', { dictCode });

        this.sqlLoggerUtils.log(queryBuilder, 'deleteDictDataById');
        await queryBuilder.execute();
    }

    /**
     * 批量删除字典数据信息
     */
    async deleteDictDataByIds(dictCodes: number[]): Promise<void> {
        const queryBuilder = this.dictDataRepository.createQueryBuilder()
            .delete()
            .from(SysDictData)
            .whereInIds(dictCodes);

        this.sqlLoggerUtils.log(queryBuilder, 'deleteDictDataByIds');
        await queryBuilder.execute();
    }

    /**
     * 新增字典数据信息
     */
    async insertDictData(dictData: SysDictData): Promise<number> {
        const insertObject: any = {};
        if (dictData.dictSort != null) insertObject.dictSort = dictData.dictSort;
        if (dictData.dictLabel != null && dictData.dictLabel != '') insertObject.dictLabel = dictData.dictLabel;
        if (dictData.dictValue != null && dictData.dictValue != '') insertObject.dictValue = dictData.dictValue;
        if (dictData.dictType != null && dictData.dictType != '') insertObject.dictType = dictData.dictType;
        if (dictData.cssClass != null && dictData.cssClass != '') insertObject.cssClass = dictData.cssClass;
        if (dictData.listClass != null && dictData.listClass != '') insertObject.listClass = dictData.listClass;
        if (dictData.isDefault != null && dictData.isDefault != '') insertObject.isDefault = dictData.isDefault;
        if (dictData.status != null) insertObject.status = dictData.status;
        if (dictData.remark != null && dictData.remark != '') insertObject.remark = dictData.remark;
        if (dictData.createBy != null && dictData.createBy != '') insertObject.createBy = dictData.createBy;
        insertObject.createTime = new Date();

        const queryBuilder = this.dictDataRepository.createQueryBuilder('d')
            .insert()
            .into(SysDictData)
            .values(insertObject);

        this.sqlLoggerUtils.log(queryBuilder, 'insertDictData');
        const result = await queryBuilder.execute();
        return result.identifiers[0].dictCode;
    }

    /**
     * 修改字典数据信息
     */
    async updateDictData(dictData: SysDictData): Promise<number> {
        const updateData: any = {
            updateTime: new Date()
        };

        if (dictData.dictSort != null) updateData.dictSort = dictData.dictSort;
        if (dictData.dictLabel != null && dictData.dictLabel != '') updateData.dictLabel = dictData.dictLabel;
        if (dictData.dictValue != null && dictData.dictValue != '') updateData.dictValue = dictData.dictValue;
        if (dictData.dictType != null && dictData.dictType != '') updateData.dictType = dictData.dictType;
        if (dictData.cssClass != null) updateData.cssClass = dictData.cssClass;
        if (dictData.listClass != null) updateData.listClass = dictData.listClass;
        if (dictData.isDefault != null && dictData.isDefault != '') updateData.isDefault = dictData.isDefault;
        if (dictData.status != null) updateData.status = dictData.status;
        if (dictData.remark != null) updateData.remark = dictData.remark;
        if (dictData.updateBy != null && dictData.updateBy != '') updateData.updateBy = dictData.updateBy;

        const queryBuilder = this.dictDataRepository.createQueryBuilder()
            .update(SysDictData)
            .set(updateData)
            .where('dictCode = :dictCode', { dictCode: dictData.dictCode });

        this.sqlLoggerUtils.log(queryBuilder, 'updateDictData');
        const result = await queryBuilder.execute();
        return result.affected;
    }

    /**
     * 同步修改字典类型
     */
    async updateDictDataType(oldDictType: string, newDictType: string): Promise<void> {
        const entityManager = this.contextHolderUtils.getContext('transactionManager') || this.dictDataRepository.manager;
        const queryBuilder = entityManager.createQueryBuilder()
            .update(SysDictData)
            .set({ dictType: newDictType })
            .where('dictType = :oldDictType', { oldDictType });

        this.sqlLoggerUtils.log(queryBuilder, 'updateDictDataType');
        await queryBuilder.execute();
    }
}
