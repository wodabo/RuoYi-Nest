import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Read project related configuration
 * 
 * @author ruoyi
 */
@Injectable()
export class RuoYiConfigService {
    /** Project name */
    private name: string;

    /** Version */
    private version: string;

    /** Copyright year */
    private copyrightYear: string;

    /** Upload path */
    private profile: string;

    /** Get address switch */
    private addressEnabled: boolean;

    /** Captcha type */
    private captchaType: string;

    constructor(private configService: ConfigService) {
        this.name = this.configService.get<string>('ruoyi.name');
        this.version = this.configService.get<string>('ruoyi.version');
        this.copyrightYear = this.configService.get<string>('ruoyi.copyrightYear');
        this.profile = this.configService.get<string>('ruoyi.profile');
        this.addressEnabled = this.configService.get<boolean>('ruoyi.addressEnabled');
        this.captchaType = this.configService.get<string>('ruoyi.captchaType');
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getVersion(): string {
        return this.version;
    }

    setVersion(version: string): void {
        this.version = version;
    }

    getCopyrightYear(): string {
        return this.copyrightYear;
    }

    setCopyrightYear(copyrightYear: string): void {
        this.copyrightYear = copyrightYear;
    }

    getProfile(): string {
        return this.profile;
    }

    setProfile(profile: string): void {
        this.profile = profile;
    }

    isAddressEnabled(): boolean {
        return this.addressEnabled;
    }

    setAddressEnabled(addressEnabled: boolean): void {
        this.addressEnabled = addressEnabled;
    }

    getCaptchaType(): string {
        return this.captchaType;
    }

    setCaptchaType(captchaType: string): void {
        this.captchaType = captchaType;
    }

    /**
     * Get import upload path
     */
    getImportPath(): string {
        return this.getProfile() + "/import";
    }

    /**
     * Get avatar upload path
     */
    getAvatarPath(): string {
        return this.getProfile() + "/avatar";
    }

    /**
     * Get download path
     */
    getDownloadPath(): string {
        return this.getProfile() + "/download/";
    }

    /**
     * Get upload path
     */
    getUploadPath(): string {
        return this.getProfile() + "/upload";
    }
}