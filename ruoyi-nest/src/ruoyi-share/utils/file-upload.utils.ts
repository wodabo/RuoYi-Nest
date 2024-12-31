import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { RuoYiConfigService } from '../config/ruoyi-config.service';
import { Constants } from '../constant/constants';
import { MimeTypeUtils } from '~/ruoyi-share/utils/mime-type.utils';
import { InvalidExtensionException } from '~/ruoyi-share/exception/file/InvalidExtensionException'
import { FileSizeLimitExceededException } from '../exception/file/FileSizeLimitExceededException';
import { SeqUtils } from './seq.utils';
import * as dayjs from 'dayjs';

/**
 * 文件上传工具类
 *
 * @author ruoyi
 */
@Injectable()
export class FileUploadUtils {
    /**
     * 默认大小 50M
     */
    private readonly DEFAULT_MAX_SIZE = 50 * 1024 * 1024;

    /**
     * 默认的文件名最大长度 100
     */
    private readonly DEFAULT_FILE_NAME_LENGTH = 100;

    /**
     * 默认上传的地址
     */
    private defaultBaseDir: string;

    constructor(
        private readonly ruoyiConfigService: RuoYiConfigService,
        private readonly mimeTypeUtils: MimeTypeUtils,
        private readonly seqUtils: SeqUtils
    ) {
        this.defaultBaseDir = this.ruoyiConfigService.getProfile();
    }

    setDefaultBaseDir(defaultBaseDir: string): void {
        this.defaultBaseDir = defaultBaseDir;
    }

    getDefaultBaseDir(): string {
        return this.defaultBaseDir;
    }

    /**
     * 以默认配置进行文件上传
     */
    async upload(file: Express.Multer.File): Promise<string> {
        try {
            return await this.uploadWithExtension(this.getDefaultBaseDir(), file, this.mimeTypeUtils.DEFAULT_ALLOWED_EXTENSION);
        } catch (e) {
            throw new Error(e.message);
        }
    }

    /**
     * 根据文件路径上传
     */
    async uploadWithBaseDir(baseDir: string, file: Express.Multer.File): Promise<string> {
        try {
            return await this.uploadWithExtension(baseDir, file, this.mimeTypeUtils.DEFAULT_ALLOWED_EXTENSION);
        } catch (e) {
            throw new Error(e.message);
        }
    }

    /**
     * 文件上传
     */
    async uploadWithExtension(baseDir: string, file: Express.Multer.File, allowedExtension: string[]): Promise<string> {
        const fileNameLength = file.originalname.length;
        if (fileNameLength > this.DEFAULT_FILE_NAME_LENGTH) {
            throw new Error(`文件名长度不能超过${this.DEFAULT_FILE_NAME_LENGTH}`);
        }

        await this.assertAllowed(file, allowedExtension);


        const fileName = this.extractFilename(file);

        const absPath = await this.getAbsoluteFile(baseDir, fileName);
        
        // Create write stream to save file
        const writeStream = fs.createWriteStream(absPath);
        writeStream.write(file.buffer);
        writeStream.end();

        return await this.getPathFileName(baseDir, fileName);
    }

    /**
     * 编码文件名
     */
    private extractFilename(file: Express.Multer.File): string {
        return `${dayjs().format('YYYY/MM/DD')}/${path.parse(file.originalname).name}_${this.seqUtils.getIdWithType(SeqUtils.UPLOAD_SEQ_TYPE)}.${this.getExtension(file)}`;
    }

    async getAbsoluteFile(uploadDir: string, fileName: string): Promise<string> {

        const filePath = path.join(uploadDir, fileName);
        const dir = path.dirname(filePath);

        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }

        return filePath;
    }

    getPathFileName(uploadDir: string, fileName: string): string {
        const dirLastIndex = this.ruoyiConfigService.getProfile().length + 1;
        const currentDir = uploadDir.substring(dirLastIndex);
        return `${Constants.RESOURCE_PREFIX}/${currentDir}/${fileName}`;
    }

    /**
     * 文件大小校验
     */
    private async assertAllowed(file: Express.Multer.File, allowedExtension: string[]): Promise<void> {
        const size = file.size;
        if (size > this.DEFAULT_MAX_SIZE) {
            throw new FileSizeLimitExceededException(this.DEFAULT_MAX_SIZE / 1024 / 1024);
        }

        const fileName = file.originalname;
        const extension = this.getExtension(file);
        
        if (allowedExtension && !this.isAllowedExtension(extension, allowedExtension)) {
            if (allowedExtension === this.mimeTypeUtils.IMAGE_EXTENSION) {
                throw new InvalidExtensionException.InvalidImageExtensionException(
                    allowedExtension,
                    extension,
                    fileName
                );
            } else if (allowedExtension === this.mimeTypeUtils.FLASH_EXTENSION) {
                throw new InvalidExtensionException.InvalidFlashExtensionException(
                    allowedExtension,
                    extension,
                    fileName
                );
            } else if (allowedExtension === this.mimeTypeUtils.MEDIA_EXTENSION) {
                throw new InvalidExtensionException.InvalidMediaExtensionException(
                    allowedExtension,
                    extension,
                    fileName
                );
            } else if (allowedExtension === this.mimeTypeUtils.VIDEO_EXTENSION) {
                throw new InvalidExtensionException.InvalidVideoExtensionException(
                    allowedExtension,
                    extension,
                    fileName
                );
            } else {
                throw new InvalidExtensionException(allowedExtension, extension, fileName);
            }
        }
    }

    /**
     * 判断MIME类型是否是允许的MIME类型
     */
    private isAllowedExtension(extension: string, allowedExtension: string[]): boolean {
        return allowedExtension.some(ext => ext.toLowerCase() === extension.toLowerCase());
    }

    /**
     * 获取文件名的后缀
     */
    private getExtension(file: Express.Multer.File): string {
        let extension = path.extname(file.originalname).substring(1);
        if (!extension) {
            extension = this.mimeTypeUtils.getExtension(file.mimetype);
        }
        return extension;
    }
}
