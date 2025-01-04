import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

/**
 * ID生成器工具类
 */
@Injectable()
export class UuidUtils {
  /**
   * 获取随机UUID
   * @returns 随机UUID
   */
  randomUUID(): string {
    return uuidv4();
  }

  /**
   * 简化的UUID，去掉了横线
   * @returns 简化的UUID，去掉了横线
   */
  simpleUUID(): string {
    return uuidv4().replace(/-/g, '');
  }

  /**
   * 获取随机UUID
   * @returns 随机UUID
   */
  fastUUID(): string {
    return uuidv4();
  }

  /**
   * 简化的UUID，去掉了横线，使用性能更好的ThreadLocalRandom生成UUID
   * @returns 简化的UUID，去掉了横线
   */
  fastSimpleUUID(): string {
    return uuidv4().replace(/-/g, '');
  }
}
