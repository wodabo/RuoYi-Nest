/**
 * 文件上传异常类
 *
 * @author ruoyi
 */
export class FileUploadException extends Error {
  private readonly cause: Error;

  constructor();
  constructor(msg: string);
  constructor(msg: string, cause: Error);
  constructor(msg?: string, cause?: Error) {
    super(msg || undefined);
    this.cause = cause;
  }

  printStackTrace(stream: NodeJS.WriteStream): void {
    stream.write(this.stack + '\n');
    if (this.cause) {
      stream.write('Caused by:\n');
      stream.write(this.cause.stack + '\n');
    }
  }

  getCause(): Error {
    return this.cause;
  }
}
