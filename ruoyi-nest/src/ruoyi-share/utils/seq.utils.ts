import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';

/**
 * 序列生成类
 */
@Injectable()
export class SeqUtils {
  // 通用序列类型
  static readonly COMM_SEQ_TYPE = 'COMMON';

  // 上传序列类型
  static readonly UPLOAD_SEQ_TYPE = 'UPLOAD';

  // 通用接口序列数
  private static commSeq = { value: 1 };

  // 上传接口序列数
  private static uploadSeq = { value: 1 };

  // 机器标识
  private static readonly MACHINE_CODE = 'A';

  /**
   * 获取通用序列号
   */
  getId(): string {
    return this.getIdWithType(SeqUtils.COMM_SEQ_TYPE);
  }

  /**
   * 默认16位序列号 yyMMddHHmmss + 一位机器标识 + 3长度循环递增字符串
   */
  getIdWithType(type: string): string {
    const atomicInt = type === SeqUtils.UPLOAD_SEQ_TYPE ? SeqUtils.uploadSeq : SeqUtils.commSeq;
    return this.getIdWithLength(atomicInt, 3);
  }

  /**
   * 通用接口序列号 yyMMddHHmmss + 一位机器标识 + length长度循环递增字符串
   */
  private getIdWithLength(atomicInt: { value: number }, length: number): string {
    let result = dayjs().format('YYMMDDHHmmss');
    result += SeqUtils.MACHINE_CODE;
    result += this.getSeq(atomicInt, length);
    return result;
  }

  /**
   * 序列循环递增字符串[1, 10 的 (length)幂次方), 用0左补齐length位数
   */
  private getSeq(atomicInt: { value: number }, length: number): string {
    // 先取值再+1
    const value = atomicInt.value++;

    // 如果更新后值>=10的(length)幂次方则重置为1
    const maxSeq = Math.pow(10, length);
    if (atomicInt.value >= maxSeq) {
      atomicInt.value = 1;
    }

    // 转字符串，用0左补齐
    return value.toString().padStart(length, '0');
  }
}
