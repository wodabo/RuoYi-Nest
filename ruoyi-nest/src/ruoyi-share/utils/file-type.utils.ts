import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { RuoYiConfigService } from '../config/ruoyi-config.service';
import { Constants } from '../constant/constants';
import { FileUploadUtils } from './file-upload.utils';
import { MimeTypeUtils } from './mime-type.utils';
import { StringUtils } from './string.utils';

/**
 * 文件类型工具类
 *
 * @author ruoyi
 */
@Injectable()
export class FileTypeUtils {
    private readonly logger = new Logger(FileTypeUtils.name);

    constructor(
        private readonly ruoYiConfigService: RuoYiConfigService
    ) {

    }

    /**
     * 获取文件类型
     * <p>
     * 例如: ruoyi.txt, 返回: txt
     * 
     * @param file 文件名
     * @return 后缀（不含".")
     */
    public getFileTypeByFile(file: File): string {
        if (file == null) {
            return '';
        }
        return this.getFileTypeByFileName(file.name);
    }

    /**
     * 获取文件类型
     * <p>
     * 例如: ruoyi.txt, 返回: txt
     *
     * @param fileName 文件名
     * @return 后缀（不含".")
     */
    public getFileTypeByFileName(fileName: string): string {
        const separatorIndex = fileName.lastIndexOf(".");
        if (separatorIndex < 0) {
            return "";
        }
        return fileName.substring(separatorIndex + 1).toLowerCase();
    }

    /**
     * 获取文件类型
     * 
     * @param photoByte 文件字节码
     * @return 后缀（不含".")
     */
    public getFileExtendName(photoByte: Uint8Array): string {
        let strFileExtendName = "jpg";
        if ((photoByte[0] === 71) && (photoByte[1] === 73) && (photoByte[2] === 70) && (photoByte[3] === 56)
                && ((photoByte[4] === 57) || (photoByte[4] === 55)) && (photoByte[5] === 97)) {
            strFileExtendName = "gif";
        }
        else if ((photoByte[6] === 74) && (photoByte[7] === 70) && (photoByte[8] === 73) && (photoByte[9] === 70)) {
            strFileExtendName = "jpg";
        }
        else if ((photoByte[0] === 66) && (photoByte[1] === 77)) {
            strFileExtendName = "bmp";
        }
        else if ((photoByte[1] === 80) && (photoByte[2] === 78) && (photoByte[3] === 71)) {
            strFileExtendName = "png";
        }
        return strFileExtendName;
    }
}