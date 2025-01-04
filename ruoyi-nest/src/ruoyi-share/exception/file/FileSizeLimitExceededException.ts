import { FileUploadException } from './FileUploadException';

/**
 * 文件名大小限制异常类
 *
 * @author ruoyi
 */
export class FileSizeLimitExceededException extends FileUploadException {
  constructor(defaultMaxSize: number) {
    super(`文件大小超过${defaultMaxSize}个字节`);
  }
}
