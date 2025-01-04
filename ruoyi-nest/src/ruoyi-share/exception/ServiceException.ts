/**
 * 业务异常
 *
 * @author ruoyi
 */
export class ServiceException extends Error {
  private code: number;
  private detailMessage: string;

  constructor();
  constructor(message: string);
  constructor(message: string, code: number);
  constructor(message?: string, code?: number) {
    super(message);
    if (message) {
      this.message = message;
    }
    if (code) {
      this.code = code;
    }
  }

  getDetailMessage(): string {
    return this.detailMessage;
  }

  getMessage(): string {
    return this.message;
  }

  getCode(): number {
    return this.code;
  }

  setMessage(message: string): ServiceException {
    this.message = message;
    return this;
  }

  setDetailMessage(detailMessage: string): ServiceException {
    this.detailMessage = detailMessage;
    return this;
  }
}
