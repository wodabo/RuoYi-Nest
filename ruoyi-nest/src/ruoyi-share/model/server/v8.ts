/**
 * V8引擎相关信息
 */
export class V8 {
  private total: number;
  private max: number;
  private used: number;
  private free: number;
  private version: string;
  private home: string;
  private startTime: string;
  private usage: number;
  private name: string;
  private runTime: string;
  private inputArgs: string;

  /**
   * 设置总内存
   * @param total 总内存大小
   */
  public setTotal(total: number): void {
    this.total = total;
  }

  /**
   * 设置名称
   * @param name 名称
   */
  public setName(name: string): void {
    this.name = name;
  }

  /**
   * 获取名称
   * @returns 名称
   */
  public getName(): string {
    return this.name;
  }

  /**
   * 获取运行时间
   * @returns 运行时间
   */
  public getRunTime(): string {
    return this.runTime;
  }

  /**
   * 设置运行时间
   * @param runTime 运行时间
   */
  public setRunTime(runTime: string): void {
    this.runTime = runTime;
  }

  /**
   * 获取总内存
   * @returns 总内存大小
   */
  public getTotal(): number {
    return this.total;
  }

  /**
   * 设置最大可用内存
   * @param max 最大可用内存大小
   */
  public setMax(max: number): void {
    this.max = max;
  }

  /**
   * 设置已使用内存
   * @param used 已使用内存大小
   */
  public setUsed(used: number): void {
    this.used = used;
  }

  /**
   * 获取最大可用内存
   * @returns 最大可用内存大小
   */
  public getMax(): number {
    return this.max;
  }

  /**
   * 设置空闲内存
   * @param free 空闲内存大小
   */
  public setFree(free: number): void {
    this.free = free;
  }

  /**
   * 获取空闲内存
   * @returns 空闲内存大小
   */
  public getFree(): number {
    return this.free;
  }

  /**
   * 设置V8版本
   * @param version V8版本号
   */
  public setVersion(version: string): void {
    this.version = version;
  }

  /**
   * 获取V8版本
   * @returns V8版本号
   */
  public getVersion(): string {
    return this.version;
  }

  /**
   * 设置Node.js路径
   * @param home Node.js路径
   */
  public setHome(home: string): void {
    this.home = home;
  }

  /**
   * 获取Node.js路径
   * @returns Node.js路径
   */
  public getHome(): string {
    return this.home;
  }

  /**
   * 设置启动时间
   * @param startTime 启动时间
   */
  public setStartTime(startTime: string): void {
    this.startTime = startTime;
  }

  /**
   * 获取启动时间
   * @returns 启动时间
   */
  public getStartTime(): string {
    return this.startTime;
  }

  /**
   * 设置使用率
   * @param usage 使用率
   */
  public setUsage(usage: number): void {
    this.usage = usage;
  }

  /**
   * 设置nodejs运行参数
   * @param inputArgs node.js运行参数
   */
  public setInputArgs(inputArgs: string): void {
    this.inputArgs = inputArgs;
  }
}
