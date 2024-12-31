// transaction.decorator.ts
import { DataSource, QueryRunner } from 'typeorm';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';

export function Transactional() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const contextHolderUtils: ContextHolderUtils = this.contextHolderUtils; // 获取上下文工具

      // 检查是否已存在事务
      const existingQueryRunner = contextHolderUtils?.getContext('transactionManager')?.queryRunner;
      if (existingQueryRunner?.isTransactionActive) {
          // 如果已存在事务，直接使用现有事务
          return await originalMethod.apply(this, args);
      }

      const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      return contextHolderUtils.runWithContext(async () => {
        try {
          // 设置上下文
          contextHolderUtils.setContext('transactionManager', queryRunner.manager);

          // 调用原始方法
          const result = await originalMethod.apply(this, args);
          await queryRunner.commitTransaction();
          return result;
        } catch (err) {
          await queryRunner.rollbackTransaction();
          throw err;
        } finally {
          await queryRunner.release();
          // 清除上下文
          contextHolderUtils.setContext('transactionManager', null);
        }
      });
    };
  };
}