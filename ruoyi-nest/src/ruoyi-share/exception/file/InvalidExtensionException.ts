/**
 * 文件上传错误异常类
 * 
 * @author ruoyi
 */
export class InvalidExtensionException extends Error {
    public allowedExtension: string[];
    public extension: string;
    public filename: string;

    constructor(allowedExtension: string[], extension: string, filename: string) {
        super(`文件[${filename}]后缀[${extension}]不正确，请上传${JSON.stringify(allowedExtension)}格式`);
        this.allowedExtension = allowedExtension;
        this.extension = extension;
        this.filename = filename;
    }

    getAllowedExtension(): string[] {
        return this.allowedExtension;
    }

    getExtension(): string {
        return this.extension;
    }

    getFilename(): string {
        return this.filename;
    }

    static InvalidImageExtensionException = class extends InvalidExtensionException {
        constructor(allowedExtension: string[], extension: string, filename: string) {
            super(allowedExtension, extension, filename);
        }
    }

    static InvalidFlashExtensionException = class extends InvalidExtensionException {
        constructor(allowedExtension: string[], extension: string, filename: string) {
            super(allowedExtension, extension, filename);
        }
    }

    static InvalidMediaExtensionException = class extends InvalidExtensionException {
        constructor(allowedExtension: string[], extension: string, filename: string) {
            super(allowedExtension, extension, filename);
        }
    }

    static InvalidVideoExtensionException = class extends InvalidExtensionException {
        constructor(allowedExtension: string[], extension: string, filename: string) {
            super(allowedExtension, extension, filename);
        }
    }
}