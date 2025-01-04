import { FileUploadException } from './FileUploadException';

/**
 * 文件名称超长限制异常类
 *
 * @author ruoyi
 */
export class FileNameLengthLimitExceededException extends FileUploadException {
  constructor(defaultFileNameLength: number) {
    super(`文件名长度超过${defaultFileNameLength}个字符`);
  }
}
