import { Injectable } from '@nestjs/common';
import { SysConfigRepository } from './repositories/sys-config.repository';
import { SysConfig } from './entities/sys-config.entity';
import { ServiceException } from '~/ruoyi-share/exception/ServiceException';
import { UserConstants } from '~/ruoyi-share/constant/UserConstants';
import { RedisCacheService } from '~/ruoyi-share/redis/redis-cache.service';
import { CacheConstants } from '~/ruoyi-share/constant/CacheConstants';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';

@Injectable()
export class SysConfigService {
  constructor(
    private readonly configRepository: SysConfigRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async selectConfigById(configId: number): Promise<SysConfig> {
    return this.configRepository.selectConfigById(configId);
  }

  async selectConfigByKey(configKey: string): Promise<string> {
    const configValue = await this.redisCacheService.getCacheObject(this.getCacheKey(configKey));
    if (configValue) {
      return configValue as string;
    }
    const config = new SysConfig();
    config.configKey = configKey;
    const retConfig = await this.configRepository.selectConfig(config);
    if (retConfig) {
      await this.redisCacheService.setCacheObject(this.getCacheKey(configKey), retConfig.configValue);
      return retConfig.configValue;
    }
    return '';
  }

  /**
   * 获取验证码开关
   * 
   * @returns true开启，false关闭
   */
  async selectCaptchaEnabled(): Promise<boolean> {
    const captchaEnabled = await this.selectConfigByKey('sys.account.captchaEnabled');
    return captchaEnabled.toLowerCase() === 'true';
  }

  async selectConfigList(query: SysConfig): Promise<[SysConfig[], number]> {
    return this.configRepository.selectConfigList(query);
  }

  async insertConfig(config: SysConfig): Promise<number> {
    const row = await this.configRepository.insertConfig(config);
    if (row > 0) {
      await this.redisCacheService.setCacheObject(this.getCacheKey(config.configKey), config.configValue);
    }
    return row;
  }

  async updateConfig(configId: number, config: SysConfig): Promise<boolean> {
    const temp = await this.selectConfigById(configId);
    if (temp.configKey !== config.configKey) {
      await this.redisCacheService.deleteObject(this.getCacheKey(temp.configKey));
    }

    const row = await this.configRepository.updateConfig(configId, config);
    if (row > 0) {
      await this.redisCacheService.setCacheObject(this.getCacheKey(config.configKey), config.configValue);
    }
    return row > 0;
  }

  async deleteConfigByIds(configIds: number[]): Promise<void> {
    for (const configId of configIds) {
      const config = await this.selectConfigById(configId);
      if (config.configType === UserConstants.YES) {
        throw new ServiceException(`内置参数【${config.configKey}】不能删除`);
      }
      await this.configRepository.deleteConfigById(configId);
      await this.redisCacheService.deleteObject(this.getCacheKey(config.configKey));
    }
  }

  async checkConfigKeyUnique(config: SysConfig): Promise<boolean> {
    const configId = config.configId ? config.configId : -1;
    const info = await this.configRepository.checkConfigKeyUnique(config.configKey);
    if (info && info.configId !== configId) {
      return false;
    }
    return true;
  }

   /**
     * 加载参数缓存数据
     */
   async loadingConfigCache(): Promise<void> {
       const [configsList, total] = await this.configRepository.selectConfigList(new SysConfig());
       for (const config of configsList) {
           await this.redisCacheService.setCacheObject(this.getCacheKey(config.configKey), config.configValue);
       }
   }

   /**
    * 清空参数缓存数据
    */
   async clearConfigCache(): Promise<void> {
       const keys = await this.redisCacheService.keys(CacheConstants.SYS_CONFIG_KEY + "*");
       await this.redisCacheService.deleteObjects(keys);
   }


  async resetConfigCache(): Promise<void> {
    await this.clearConfigCache();
    await this.loadingConfigCache();
  }

  private getCacheKey(configKey: string): string {
    return CacheConstants.SYS_CONFIG_KEY + configKey;
  }
}
