/**
 * 基础异常
 *
 * @author ruoyi
 */
export class BaseException extends Error {
  private readonly module: string;
  private readonly code: string;
  private readonly args: any[];
  private readonly defaultMessage: string;

  constructor();
  constructor(defaultMessage: string);
  constructor(code: string, args: any[]);
  constructor(module: string, defaultMessage: string);
  constructor(module: string, code: string, args: any[]);
  constructor(
    module: string,
    code: string,
    args: any[],
    defaultMessage: string,
  );
  constructor(
    moduleOrCodeOrMessage?: string,
    codeOrArgsOrMessage?: string | any[],
    args?: any[],
    defaultMessage?: string,
  ) {
    super();

    if (args && defaultMessage) {
      // Full constructor
      this.module = moduleOrCodeOrMessage;
      this.code = codeOrArgsOrMessage as string;
      this.args = args;
      this.defaultMessage = defaultMessage;
    } else if (Array.isArray(codeOrArgsOrMessage)) {
      // (code, args) constructor
      this.module = null;
      this.code = moduleOrCodeOrMessage;
      this.args = codeOrArgsOrMessage;
      this.defaultMessage = null;
    } else if (codeOrArgsOrMessage && args) {
      // (module, code, args) constructor
      this.module = moduleOrCodeOrMessage;
      this.code = codeOrArgsOrMessage as string;
      this.args = args;
      this.defaultMessage = null;
    } else if (codeOrArgsOrMessage) {
      // (module, defaultMessage) constructor
      this.module = moduleOrCodeOrMessage;
      this.code = null;
      this.args = null;
      this.defaultMessage = codeOrArgsOrMessage as string;
    } else if (moduleOrCodeOrMessage) {
      // (defaultMessage) constructor
      this.module = null;
      this.code = null;
      this.args = null;
      this.defaultMessage = moduleOrCodeOrMessage;
    } else {
      // Empty constructor
      this.module = null;
      this.code = null;
      this.args = null;
      this.defaultMessage = null;
    }
  }

  getMessage(): string {
    let message = null;
    if (this.code) {
      // Note: MessageUtils.message implementation would need to be provided
      message = this.code;
      if (this.args) {
        // Simple string template replacement
        this.args.forEach((arg, index) => {
          message = message.replace(`{${index}}`, arg);
        });
      }
    }
    if (!message) {
      message = this.defaultMessage;
    }
    return message;
  }

  getModule(): string {
    return this.module;
  }

  getCode(): string {
    return this.code;
  }

  getArgs(): any[] {
    return this.args;
  }

  getDefaultMessage(): string {
    return this.defaultMessage;
  }
}
