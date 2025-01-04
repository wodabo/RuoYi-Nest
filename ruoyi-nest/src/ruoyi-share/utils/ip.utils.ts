import { Injectable, Request } from '@nestjs/common';
import { StringUtils } from './string.utils';

/**
 * 获取IP方法
 *
 * @author ruoyi
 */
@Injectable()
export class IpUtils {
  private readonly REGX_0_255 = '(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]\\d|\\d)';
  // 匹配 ip
  private readonly REGX_IP = `((${this.REGX_0_255}\\.){3}${this.REGX_0_255})`;
  private readonly REGX_IP_WILDCARD =
    `(((\\*\\.){3}\\*)|(` +
    `${this.REGX_0_255}(\\.\\*){3})|(` +
    `${this.REGX_0_255}\\.${this.REGX_0_255})(\\.\\*){2}` +
    `|((${this.REGX_0_255}\\.){3}\\*))`;
  // 匹配网段
  private readonly REGX_IP_SEG = `(${this.REGX_IP}\\-${this.REGX_IP})`;

  constructor(private readonly stringUtils: StringUtils) {}

  /**
   * 获取客户端IP
   *
   * @param request 请求对象
   * @returns IP地址
   */
  public getIpAddr(request: Request): string {
    if (!request) {
      return 'unknown';
    }
    let ip = request.headers['x-forwarded-for'];
    if (
      !ip ||
      ip.length === 0 ||
      'unknown'.toLowerCase() === ip.toLowerCase()
    ) {
      ip = request.headers['Proxy-Client-IP'];
    }
    if (
      !ip ||
      ip.length === 0 ||
      'unknown'.toLowerCase() === ip.toLowerCase()
    ) {
      ip = request.headers['X-Forwarded-For'];
    }
    if (
      !ip ||
      ip.length === 0 ||
      'unknown'.toLowerCase() === ip.toLowerCase()
    ) {
      ip = request.headers['WL-Proxy-Client-IP'];
    }
    if (
      !ip ||
      ip.length === 0 ||
      'unknown'.toLowerCase() === ip.toLowerCase()
    ) {
      ip = request.headers['X-Real-IP'];
    }
    if (
      !ip ||
      ip.length === 0 ||
      'unknown'.toLowerCase() === ip.toLowerCase()
    ) {
      ip = (request as any).socket?.remoteAddress;
    }

    return ip === '0:0:0:0:0:0:0:1'
      ? '127.0.0.1'
      : this.getMultistageReverseProxyIp(ip);
  }

  /**
   * 检查是否为内部IP地址
   *
   * @param ip IP地址
   * @returns 结果
   */
  public internalIp(ip: string): boolean {
    const addr = this.textToNumericFormatV4(ip);
    return this.internalIpByte(addr) || '127.0.0.1' === ip;
  }

  /**
   * 检查是否为内部IP地址
   *
   * @param addr byte地址
   * @returns 结果
   */
  private internalIpByte(addr: number[]): boolean {
    if (!addr || addr.length < 2) {
      return true;
    }
    const b0 = addr[0];
    const b1 = addr[1];
    // 10.x.x.x/8
    const SECTION_1 = 0x0a;
    // 172.16.x.x/12
    const SECTION_2 = 0xac;
    const SECTION_3 = 0x10;
    const SECTION_4 = 0x1f;
    // 192.168.x.x/16
    const SECTION_5 = 0xc0;
    const SECTION_6 = 0xa8;

    switch (b0) {
      case SECTION_1:
        return true;
      case SECTION_2:
        if (b1 >= SECTION_3 && b1 <= SECTION_4) {
          return true;
        }
      case SECTION_5:
        if (b1 === SECTION_6) {
          return true;
        }
      default:
        return false;
    }
  }

  /**
   * 将IPv4地址转换成字节
   *
   * @param text IPv4地址
   * @returns number[] 字节数组
   */
  public textToNumericFormatV4(text: string): number[] {
    if (text.length === 0) {
      return null;
    }

    const bytes: number[] = new Array(4);
    const elements = text.split('.');
    try {
      let l: number;
      let i: number;
      switch (elements.length) {
        case 1:
          l = parseInt(elements[0]);
          if (l < 0 || l > 4294967295) {
            return null;
          }
          bytes[0] = (l >> 24) & 0xff;
          bytes[1] = ((l & 0xffffff) >> 16) & 0xff;
          bytes[2] = ((l & 0xffff) >> 8) & 0xff;
          bytes[3] = l & 0xff;
          break;
        case 2:
          l = parseInt(elements[0]);
          if (l < 0 || l > 255) {
            return null;
          }
          bytes[0] = l & 0xff;
          l = parseInt(elements[1]);
          if (l < 0 || l > 16777215) {
            return null;
          }
          bytes[1] = (l >> 16) & 0xff;
          bytes[2] = ((l & 0xffff) >> 8) & 0xff;
          bytes[3] = l & 0xff;
          break;
        case 3:
          for (i = 0; i < 2; ++i) {
            l = parseInt(elements[i]);
            if (l < 0 || l > 255) {
              return null;
            }
            bytes[i] = l & 0xff;
          }
          l = parseInt(elements[2]);
          if (l < 0 || l > 65535) {
            return null;
          }
          bytes[2] = (l >> 8) & 0xff;
          bytes[3] = l & 0xff;
          break;
        case 4:
          for (i = 0; i < 4; ++i) {
            l = parseInt(elements[i]);
            if (l < 0 || l > 255) {
              return null;
            }
            bytes[i] = l & 0xff;
          }
          break;
        default:
          return null;
      }
    } catch (e) {
      return null;
    }
    return bytes;
  }

  /**
   * 获取IP地址
   *
   * @returns 本地IP地址
   */
  public getHostIp(): string {
    try {
      const interfaces = require('os').networkInterfaces();
      for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
          const alias = iface[i];
          if (
            alias.family === 'IPv4' &&
            alias.address !== '127.0.0.1' &&
            !alias.internal
          ) {
            return alias.address;
          }
        }
      }
    } catch (e) {
      return '127.0.0.1';
    }
    return '127.0.0.1';
  }

  /**
   * 获取主机名
   *
   * @returns 本地主机名
   */
  public getHostName(): string {
    try {
      return require('os').hostname();
    } catch (e) {
      return '未知';
    }
  }

  /**
   * 从多级反向代理中获得第一个非unknown IP地址
   *
   * @param ip 获得的IP地址
   * @returns 第一个非unknown IP地址
   */
  public getMultistageReverseProxyIp(ip: string): string {
    // 多级反向代理检测
    if (ip && ip.indexOf(',') > 0) {
      const ips = ip.trim().split(',');
      for (const subIp of ips) {
        if (!this.isUnknown(subIp)) {
          ip = subIp;
          break;
        }
      }
    }
    return ip ? ip.substring(0, 255) : '';
  }

  /**
   * 检测给定字符串是否为未知，多用于检测HTTP请求相关
   *
   * @param checkString 被检测的字符串
   * @returns 是否未知
   */
  public isUnknown(checkString: string): boolean {
    return (
      !checkString ||
      checkString.trim().length === 0 ||
      'unknown'.toLowerCase() === checkString.toLowerCase()
    );
  }

  /**
   * 是否为IP
   */
  public isIP(ip: string): boolean {
    return ip && ip.trim().length > 0 && new RegExp(this.REGX_IP).test(ip);
  }

  /**
   * 是否为IP，或 *为间隔的通配符地址
   */
  public isIpWildCard(ip: string): boolean {
    return (
      ip && ip.trim().length > 0 && new RegExp(this.REGX_IP_WILDCARD).test(ip)
    );
  }

  /**
   * 检测参数是否在ip通配符里
   */
  public ipIsInWildCardNoCheck(ipWildCard: string, ip: string): boolean {
    const s1 = ipWildCard.split('.');
    const s2 = ip.split('.');
    let isMatchedSeg = true;
    for (let i = 0; i < s1.length && s1[i] !== '*'; i++) {
      if (s1[i] !== s2[i]) {
        isMatchedSeg = false;
        break;
      }
    }
    return isMatchedSeg;
  }

  /**
   * 是否为特定格式如:"10.10.10.1-10.10.10.99"的ip段字符串
   */
  public isIPSegment(ipSeg: string): boolean {
    return (
      ipSeg &&
      ipSeg.trim().length > 0 &&
      new RegExp(this.REGX_IP_SEG).test(ipSeg)
    );
  }

  /**
   * 判断ip是否在指定网段中
   */
  public ipIsInNetNoCheck(iparea: string, ip: string): boolean {
    const idx = iparea.indexOf('-');
    const sips = iparea.substring(0, idx).split('.');
    const sipe = iparea.substring(idx + 1).split('.');
    const sipt = ip.split('.');
    let ips = 0,
      ipe = 0,
      ipt = 0;
    for (let i = 0; i < 4; ++i) {
      ips = (ips << 8) | parseInt(sips[i]);
      ipe = (ipe << 8) | parseInt(sipe[i]);
      ipt = (ipt << 8) | parseInt(sipt[i]);
    }
    if (ips > ipe) {
      const t = ips;
      ips = ipe;
      ipe = t;
    }
    return ips <= ipt && ipt <= ipe;
  }

  /**
   * 校验ip是否符合过滤串规则
   *
   * @param filter 过滤IP列表,支持后缀'*'通配,支持网段如:`10.10.10.1-10.10.10.99`
   * @param ip 校验IP地址
   * @returns boolean 结果
   */
  public isMatchedIp(filter: string, ip: string): boolean {
    if (this.stringUtils.isEmpty(filter) || this.stringUtils.isEmpty(ip)) {
      return false;
    }
    const ips = filter.split(';');
    for (const iStr of ips) {
      if (this.isIP(iStr) && iStr === ip) {
        return true;
      } else if (
        this.isIpWildCard(iStr) &&
        this.ipIsInWildCardNoCheck(iStr, ip)
      ) {
        return true;
      } else if (this.isIPSegment(iStr) && this.ipIsInNetNoCheck(iStr, ip)) {
        return true;
      }
    }
    return false;
  }
}
