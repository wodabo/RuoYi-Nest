import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Read token related configuration
 *
 * @author ruoyi
 */
@Injectable()
export class TokenConfigService {
  /** Token header */
  private header: string;

  /** Token secret */
  private secret: string;

  /** Token expire time (minutes) */
  private expireTime: number;

  constructor(private configService: ConfigService) {
    this.header = this.configService.get<string>('token.header');
    this.secret = this.configService.get<string>('token.secret');
    this.expireTime = this.configService.get<number>('token.expireTime');
  }

  getHeader(): string {
    return this.header.toLowerCase();
  }

  setHeader(header: string): void {
    this.header = header;
  }

  getSecret(): string {
    return this.secret;
  }

  setSecret(secret: string): void {
    this.secret = secret;
  }

  getExpireTime(): number {
    return this.expireTime * 60;
  }

  setExpireTime(expireTime: number): void {
    this.expireTime = expireTime;
  }
}
