import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 读取代码生成相关配置
 * 
 * @author ruoyi
 */
@Injectable()
export class GenConfigService {
    private author: string;
    private packageName: string;
    private autoRemovePre: boolean;
    private tablePrefix: string;

    constructor(private configService: ConfigService) {
        this.author = this.configService.get<string>('gen.author');
        this.packageName = this.configService.get<string>('gen.packageName');
        this.autoRemovePre = this.configService.get<boolean>('gen.autoRemovePre');
        this.tablePrefix = this.configService.get<string>('gen.tablePrefix');
    }

    getAuthor(): string {
        return this.author;
    }

    setAuthor(author: string): void {
        this.author = author;
    }

    getPackageName(): string {
        return this.packageName;
    }

    setPackageName(packageName: string): void {
        this.packageName = packageName;
    }

    getAutoRemovePre(): boolean {
        return this.autoRemovePre;
    }

    setAutoRemovePre(autoRemovePre: boolean): void {
        this.autoRemovePre = autoRemovePre;
    }

    getTablePrefix(): string {
        return this.tablePrefix;
    }

    setTablePrefix(tablePrefix: string): void {
        this.tablePrefix = tablePrefix;
    }
}
