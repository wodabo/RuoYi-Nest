/**
 * 内存相关信息
 *
 * @author ruoyi
 */
export class Mem {
  /**
   * 内存总量
   */
  private total: number;

  /**
   * 已用内存
   */
  private used: number;

  /**
   * 剩余内存
   */
  private free: number;

  /** 使用率 */
  private usage: number;
  /**
   * 获取内存总量
   */
  public getTotal(): number {
    return this.total / (1024 * 1024 * 1024);
  }

  /**
   * 设置内存总量
   */
  public setTotal(total: number) {
    this.total = total;
  }

  /**
   * 获取已用内存
   */
  public getUsed(): number {
    return this.used / (1024 * 1024 * 1024);
  }

  /**
   * 设置已用内存
   */
  public setUsed(used: number) {
    this.used = used;
  }

  /**
   * 获取剩余内存
   */
  public getFree(): number {
    return this.free / (1024 * 1024 * 1024);
  }

  /**
   * 设置剩余内存
   */
  public setFree(free: number) {
    this.free = free;
  }

  /**
   * 设置使用率
   */
  public setUsage(usage: number) {
    this.usage = usage;
  }
}
