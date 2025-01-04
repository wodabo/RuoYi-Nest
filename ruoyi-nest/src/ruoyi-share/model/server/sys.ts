/**
 * 系统相关信息
 *
 * @author ruoyi
 */
export class Sys {
  /**
   * 服务器名称
   */
  private computerName: string;

  /**
   * 服务器Ip
   */
  private computerIp: string;

  /**
   * 项目路径
   */
  private userDir: string;

  /**
   * 操作系统
   */
  private osName: string;

  /**
   * 系统架构
   */
  private osArch: string;

  /**
   * 获取服务器名称
   */
  public getComputerName(): string {
    return this.computerName;
  }

  /**
   * 设置服务器名称
   */
  public setComputerName(computerName: string) {
    this.computerName = computerName;
  }

  /**
   * 获取服务器Ip
   */
  public getComputerIp(): string {
    return this.computerIp;
  }

  /**
   * 设置服务器Ip
   */
  public setComputerIp(computerIp: string) {
    this.computerIp = computerIp;
  }

  /**
   * 获取项目路径
   */
  public getUserDir(): string {
    return this.userDir;
  }

  /**
   * 设置项目路径
   */
  public setUserDir(userDir: string) {
    this.userDir = userDir;
  }

  /**
   * 获取操作系统
   */
  public getOsName(): string {
    return this.osName;
  }

  /**
   * 设置操作系统
   */
  public setOsName(osName: string) {
    this.osName = osName;
  }

  /**
   * 获取系统架构
   */
  public getOsArch(): string {
    return this.osArch;
  }

  /**
   * 设置系统架构
   */
  public setOsArch(osArch: string) {
    this.osArch = osArch;
  }
}
