import { Injectable } from '@nestjs/common';

/**
 * 媒体类型工具类
 *
 * @author ruoyi
 */
@Injectable()
export class MimeTypeUtils {
  public readonly IMAGE_PNG = 'image/png';
  public readonly IMAGE_JPG = 'image/jpg';
  public readonly IMAGE_JPEG = 'image/jpeg';
  public readonly IMAGE_BMP = 'image/bmp';
  public readonly IMAGE_GIF = 'image/gif';

  public readonly IMAGE_EXTENSION = ['bmp', 'gif', 'jpg', 'jpeg', 'png'];
  public readonly FLASH_EXTENSION = ['swf', 'flv'];
  public readonly MEDIA_EXTENSION = [
    'swf',
    'flv',
    'mp3',
    'wav',
    'wma',
    'wmv',
    'mid',
    'avi',
    'mpg',
    'asf',
    'rm',
    'rmvb',
  ];
  public readonly VIDEO_EXTENSION = ['mp4', 'avi', 'rmvb'];
  public readonly DEFAULT_ALLOWED_EXTENSION = [
    // 图片
    'bmp',
    'gif',
    'jpg',
    'jpeg',
    'png',
    // word excel powerpoint
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'html',
    'htm',
    'txt',
    // 压缩文件
    'rar',
    'zip',
    'gz',
    'bz2',
    // 视频格式
    'mp4',
    'avi',
    'rmvb',
    // pdf
    'pdf',
  ];

  public getExtension(prefix: string): string {
    switch (prefix) {
      case this.IMAGE_PNG:
        return 'png';
      case this.IMAGE_JPG:
        return 'jpg';
      case this.IMAGE_JPEG:
        return 'jpeg';
      case this.IMAGE_BMP:
        return 'bmp';
      case this.IMAGE_GIF:
        return 'gif';
      default:
        return '';
    }
  }
}
