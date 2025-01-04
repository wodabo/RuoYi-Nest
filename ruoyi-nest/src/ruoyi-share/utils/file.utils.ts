import { Injectable, Logger } from '@nestjs/common';
import { RuoYiConfigService } from '../config/ruoyi-config.service';
import { Constants } from '~/ruoyi-share/constant/Constants';
import { FileUploadUtils } from './file-upload.utils';
import { MimeTypeUtils } from './mime-type.utils';
import { FileTypeUtils } from './file-type.utils';
import * as dayjs from 'dayjs';
import { UuidUtils } from './uuid.utils';
import { response, Response } from 'express';
import { UtilException } from '~/ruoyi-share/exception/UtilException';
import * as archiver from 'archiver';

/**
 * 文件处理工具类
 *
 * @author ruoyi
 */
@Injectable()
export class FileUtils {
  private readonly logger = new Logger(FileUtils.name);

  public FILENAME_PATTERN = '[a-zA-Z0-9_\\-\\|\\.\\u4e00-\\u9fa5]+';

  constructor(
    private readonly ruoYiConfigService: RuoYiConfigService,
    private readonly fileTypeUtils: FileTypeUtils,
    private readonly uuidUtils: UuidUtils,
    private readonly mimeTypeUtils: MimeTypeUtils,
    private readonly fileUploadUtils: FileUploadUtils,
  ) {}

  /**
   * 输出指定文件的byte数组
   *
   * @param filePath 文件路径
   * @param os 输出流
   */
  public async writeBytes(
    filePath: string,
    os: NodeJS.WritableStream,
  ): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    try {
      const file = path.resolve(filePath);

      if (!fs.existsSync(file)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileStream = fs.createReadStream(file);

      fileStream.pipe(os);
      await new Promise((resolve, reject) => {
        fileStream.on('end', resolve);
        fileStream.on('error', reject);
      });
    } catch (e) {
      throw e;
    } finally {
      os.end();
    }
  }

  /**
   * 写数据到文件中
   *
   * @param data 数据
   * @return 目标文件
   * @throws IOException IO异常
   */
  public async writeImportBytes(data: Buffer): Promise<string> {
    try {
      return await this.writeBytesToFile(
        data,
        this.ruoYiConfigService.getImportPath(),
      );
    } catch (e) {
      throw new Error(`IO异常: ${e}`);
    }
  }

  /**
   * 写数据到文件中
   *
   * @param data 数据
   * @param uploadDir 目标文件
   * @return 目标文件
   * @throws IOException IO异常
   */
  public async writeBytesToFile(
    data: Buffer,
    uploadDir: string,
  ): Promise<string> {
    try {
      // 获取文件扩展名
      const extension = this.getFileExtendName(data);

      // 生成文件路径
      const pathName = `${dayjs().format('YYYY/MM/DD')}/${this.uuidUtils.fastUUID()}.${extension}`;

      // 获取绝对路径文件
      const file = await this.fileUploadUtils.getAbsoluteFile(
        uploadDir,
        pathName,
      );

      // 写入文件
      const fs = require('fs');
      await fs.promises.writeFile(file, data);

      return this.fileUploadUtils.getPathFileName(uploadDir, pathName);
    } catch (error) {
      throw new Error(`写入文件失败: ${error.message}`);
    }
  }

  /**
   * 删除文件
   *
   * @param filePath 文件路径
   * @return 删除成功返回true，否则返回false
   */
  public async deleteFile(filePath: string): Promise<boolean> {
    const fs = require('fs');
    let flag = false;
    try {
      // 检查文件是否存在
      if (fs.existsSync(filePath)) {
        // 删除文件
        fs.unlinkSync(filePath);
        flag = true;
      }
    } catch (e) {
      console.error(`删除文件失败: ${e}`);
    }
    return flag;
  }

  /**
   * 文件名称验证
   *
   * @param filename 文件名称
   * @return true 正常 false 非法
   */
  public isValidFilename(filename: string): boolean {
    return filename.match(this.FILENAME_PATTERN) !== null;
  }

  /**
   * 检查文件是否可下载
   *
   * @param resource 需要下载的文件
   * @return true 正常 false 非法
   */
  public checkAllowDownload(resource: string): boolean {
    // 禁止目录上跳级别
    if (resource.includes('..')) {
      return false;
    }

    // 检查允许下载的文件规则
    if (
      this.mimeTypeUtils.DEFAULT_ALLOWED_EXTENSION.includes(
        this.fileTypeUtils.getFileTypeByFileName(resource),
      )
    ) {
      return true;
    }

    // 不在允许下载的文件规则
    return false;
  }

  /**
   * 下载文件名重新编码
   *
   * @param request 请求对象
   * @param fileName 文件名
   * @return 编码后的文件名
   */
  public async setFileDownloadHeader(
    request: Request,
    fileName: string,
  ): Promise<string> {
    const agent = request.headers['user-agent'];
    let filename = fileName;
    if (agent.includes('MSIE')) {
      // IE浏览器
      filename = encodeURIComponent(filename);
      filename = filename.replace('+', ' ');
    } else if (agent.contains('Firefox')) {
      // 火狐浏览器
      filename = encodeURIComponent(filename);
    } else if (agent.includes('Chrome')) {
      // google浏览器
      filename = encodeURIComponent(filename);
    } else {
      // 其它浏览器
      filename = encodeURIComponent(filename);
    }
    return filename;
  }

  /**
   * 下载文件名重新编码
   *
   * @param response 响应对象
   * @param realFileName 真实文件名
   */
  public async setAttachmentResponseHeader(
    response,
    realFileName: string,
  ): Promise<void> {
    const percentEncodedFileName = this.percentEncode(realFileName);

    const contentDispositionValue = `attachment; filename=${percentEncodedFileName}; filename*="utf-8'${percentEncodedFileName}"`;

    response.header(
      'access-control-expose-headers',
      'Content-Disposition,download-filename',
    );
    response.header('content-disposition', contentDispositionValue);
    response.header('download-filename', percentEncodedFileName);
  }

  /**
   * 百分号编码工具方法
   *
   * @param s 需要百分号编码的字符串
   * @return 百分号编码后的字符串
   */
  public percentEncode(s: string): string {
    const encode = encodeURIComponent(s);
    return encode.replaceAll('\\+', '%20');
  }

  /**
   * 获取图像后缀
   *
   * @param photoByte 图像数据
   * @return 后缀名
   */
  public getFileExtendName(photoByte: Uint8Array): string {
    let strFileExtendName = 'jpg';
    if (
      photoByte[0] == 71 &&
      photoByte[1] == 73 &&
      photoByte[2] == 70 &&
      photoByte[3] == 56 &&
      (photoByte[4] == 57 || photoByte[4] == 55) &&
      photoByte[5] == 97
    ) {
      strFileExtendName = 'gif';
    } else if (
      photoByte[6] == 74 &&
      photoByte[7] == 70 &&
      photoByte[8] == 73 &&
      photoByte[9] == 70
    ) {
      strFileExtendName = 'jpg';
    } else if (photoByte[0] == 66 && photoByte[1] == 77) {
      strFileExtendName = 'bmp';
    } else if (photoByte[1] == 80 && photoByte[2] == 78 && photoByte[3] == 71) {
      strFileExtendName = 'png';
    }
    return strFileExtendName;
  }

  /**
   * 获取文件名称 /profile/upload/2022/04/16/ruoyi.png -- ruoyi.png
   *
   * @param fileName 路径名称
   * @return 没有文件路径的名称
   */
  public getName(fileName: string): string {
    if (fileName == null) {
      return null;
    }
    const lastUnixPos = fileName.lastIndexOf('/');
    const lastWindowsPos = fileName.lastIndexOf('\\');
    const index = Math.max(lastUnixPos, lastWindowsPos);
    return fileName.substring(index + 1);
  }

  /**
   * 获取不带后缀文件名称 /profile/upload/2022/04/16/ruoyi.png -- ruoyi
   *
   * @param fileName 路径名称
   * @return 没有文件路径和后缀的名称
   */
  public getNameNotSuffix(fileName: string): string {
    if (fileName == null) {
      return null;
    }
    const path = require('path');
    const baseName = path.basename(fileName, path.extname(fileName));
    return baseName;
  }

  /**
   * 生成ZIP压缩包
   * @param files 文件配置数组 [{path: string, content: string}]
   * @returns Promise<Buffer> 压缩包buffer
   */
  public fileListToZip(
    files: Array<{ path: string; content: string }>,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // 创建一个内存流来存储zip
      const chunks: Buffer[] = [];
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      // 监听数据块
      archive.on('data', (chunk) => chunks.push(chunk));

      // 完成时合并所有数据块
      archive.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });

      // 错误处理
      archive.on('error', (err) => reject(err));

      // 添加文件到压缩包
      for (const file of files) {
        archive.append(file.content, { name: file.path });
      }

      // 完成归档
      archive.finalize();
    });
  }
}
