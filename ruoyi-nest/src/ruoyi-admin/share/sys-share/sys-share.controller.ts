import { Controller, Get, Post, Body, Query, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { SysConfigService } from '~/ruoyi-system/sys-config/sys-config.service';
import { CacheConstants } from '~/ruoyi-share/constant/CacheConstants';
import { Constants } from '~/ruoyi-share/constant/Constants';
import { RedisCacheService } from '~/ruoyi-share/redis/redis-cache.service';
import { v4 as uuidv4 } from 'uuid';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';
import { Public } from '~/ruoyi-framework/auth/decorators/public.decorator';
import { GifUtils } from '~/ruoyi-share/utils/gif.utils';
import { FileUploadUtils } from '~/ruoyi-share/utils/file-upload.utils';
import { FileUtils } from '~/ruoyi-share/utils/file.utils';
import { ServerConfigUtils } from '~/ruoyi-share/utils/server-config.utils';
import {Response} from 'express'
@ApiTags('通用')
@Controller()
export class SysShareController extends BaseController {
  constructor(
    private readonly ruoYiConfigService: RuoYiConfigService,
    private readonly configService: SysConfigService,
    private readonly redisCacheService: RedisCacheService,
    private readonly gifUtils: GifUtils,
    private readonly fileUploadUtils: FileUploadUtils,
    private readonly fileUtils: FileUtils,
    private readonly serverConfigUtils: ServerConfigUtils,
  ) {
    super();
  }

  @ApiOperation({ summary: '生成验证码' })
  @Public()
  @Get('captchaImage')
  async getCaptcha() {
    const ajax:any = this.success();
    const captchaEnabled = await this.configService.selectCaptchaEnabled();
    ajax.captchaEnabled = captchaEnabled;

    if (!captchaEnabled) {
      return ajax;
    }

    // 保存验证码信息
    const uuid = uuidv4();
    const verifyKey = CacheConstants.CAPTCHA_CODE_KEY + uuid;

    let code = null;
    let image = null;

    // 生成验证码
    const captchaType = this.ruoYiConfigService.getCaptchaType();
    if (captchaType === 'math') {
      const { token, buffer } = await this.gifUtils.generate({
        size: 4,
      });
      code = token.toLowerCase();
      image = `${buffer.toString('base64')}`;
    } else if (captchaType === 'char') {
      const { token, buffer } = await this.gifUtils.generate({
        size: 4,
      });
      code = token.toLowerCase();
      image = `${buffer.toString('base64')}`;
    }

    await this.redisCacheService.setCacheObjectWithTimeout(verifyKey, code, Constants.CAPTCHA_EXPIRATION * 60);


    ajax.uuid = uuid;
    ajax.img = image;


    return ajax;
  }

  @ApiOperation({ summary: '通用下载请求' })
  @Public()
  @Get('download')
  async fileDownload(@Query('fileName') fileName: string, @Query('delete') isDelte: boolean, @Res() response:Response) {
    try {
      if (!this.fileUtils.checkAllowDownload(fileName)) {
        throw new Error(`文件名称(${fileName})非法，不允许下载。`);
      }
      const realFileName = `${Date.now()}_${fileName.substring(fileName.indexOf("_") + 1)}`;
      const filePath = this.ruoYiConfigService.getDownloadPath() + fileName;

  
      response.header('Content-Type','application/octet-stream')
    
      this.fileUtils.setAttachmentResponseHeader(response, realFileName);
      await this.fileUtils.writeBytes(filePath, response as unknown as NodeJS.WritableStream);
      if (isDelte) {
        this.fileUtils.deleteFile(filePath);
      }
    } catch (error) {
      console.error('下载文件失败', error);
    }
  }

  @ApiOperation({ summary: '通用上传请求（单个）' })
  @Public()
  @Post('upload')
  async uploadFile(@Body('file') file: any, @Req() request) {
    try {
      // 上传文件路径
      const filePath = this.ruoYiConfigService.getUploadPath();
      // 上传并返回新文件名称
      const fileName = await this.fileUploadUtils.uploadWithBaseDir(filePath, file);
      const url = this.serverConfigUtils.getUrl(request) + fileName;
      const ajax:any = this.success();
      ajax.url = url;
      ajax.fileName = fileName;
      ajax.newFileName = this.fileUtils.getName(fileName);
      ajax.originalFilename = file.originalFilename;
      return ajax;
    } catch (error) {
      return this.error(error.message);
    }
  }

  @ApiOperation({ summary: '通用上传请求（多个）' })
  @Public()
  @Post('uploads')
  async uploadFiles(@Body('files') files: any[], @Req() request) {
    try {
      // 上传文件路径
      const filePath = this.ruoYiConfigService.getUploadPath();
      const urls = [];
      const fileNames = [];
      const newFileNames = [];
      const originalFilenames = [];
      for (const file of files) {
        // 上传并返回新文件名称
        const fileName = await this.fileUploadUtils.uploadWithBaseDir(filePath, file);
        const url = this.serverConfigUtils.getUrl(request) + fileName;
        urls.push(url);
        fileNames.push(fileName);
        newFileNames.push(this.fileUtils.getName(fileName));
        originalFilenames.push(file.originalFilename);
      }
      const ajax:any = this.success();
      ajax.urls = urls.join(',');
      ajax.fileNames = fileNames.join(',');
      ajax.newFileNames = newFileNames.join(',');
      ajax.originalFilenames = originalFilenames.join(',');
      return ajax;
    } catch (error) {
      return this.error(error.message);
    }
  }

  @ApiOperation({ summary: '本地资源通用下载' })
  @Public()
  @Get('download/resource')
  async resourceDownload(@Query('resource') resource: string, @Res() response: Response) {
    try {
      if (!this.fileUtils.checkAllowDownload(resource)) {
        throw new Error(`资源文件(${resource})非法，不允许下载。`);
      }
      // 本地资源路径
      const localPath = this.ruoYiConfigService.getProfile();
      // 数据库资源地址
      const downloadPath = `${localPath}${resource.substring(resource.indexOf(Constants.RESOURCE_PREFIX) + Constants.RESOURCE_PREFIX.length)}`;
      // 下载名称
      const downloadName = resource.substring(resource.lastIndexOf('/') + 1);

      response.header('Content-Type','application/octet-stream')
      this.fileUtils.setAttachmentResponseHeader(response, downloadName);
      await this.fileUtils.writeBytes(downloadPath, response as unknown as NodeJS.WritableStream);
    } catch (error) {
      console.error('下载文件失败', error);
    }
  }
}
