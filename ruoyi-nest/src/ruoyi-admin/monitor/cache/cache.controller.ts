import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  PartialType,
} from '@nestjs/swagger';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { ExcelUtils } from '~/ruoyi-share/utils/excel.utils';
import { FileUploadUtils } from '~/ruoyi-share/utils/file-upload.utils';
import { MimeTypeUtils } from '~/ruoyi-share/utils/mime-type.utils';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { Log } from '~/ruoyi-share/annotation/Log';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';
import { SysCache } from '~/ruoyi-system/sys-cache/entities/sys-cache.entity';
import { RedisCacheService } from '~/ruoyi-share/redis/redis-cache.service';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { Redis as RedisClient } from 'ioredis';
import { StringUtils } from '~/ruoyi-share/utils/string.utils';
import { CacheConstants } from '~/ruoyi-share/constant/CacheConstants';

/**
 * 缓存监控
 *
 * @author ruoyi
 */
@ApiTags('缓存监控')
@Controller('monitor/cache')
export class CacheController extends BaseController {
  /** 缓存名称列表 */
  private caches: SysCache[] = [
    new SysCache(CacheConstants.LOGIN_TOKEN_KEY, '用户信息'),
    new SysCache(CacheConstants.SYS_CONFIG_KEY, '配置信息'),
    new SysCache(CacheConstants.SYS_DICT_KEY, '数据字典'),
    new SysCache(CacheConstants.CAPTCHA_CODE_KEY, '验证码'),
    new SysCache(CacheConstants.REPEAT_SUBMIT_KEY, '防重提交'),
    new SysCache(CacheConstants.RATE_LIMIT_KEY, '限流处理'),
    new SysCache(CacheConstants.PWD_ERR_CNT_KEY, '密码错误次数'),
  ];

  constructor(
    private readonly excelUtils: ExcelUtils,
    private readonly redisCacheService: RedisCacheService,
    @InjectRedis() private readonly redisClient: RedisClient,
    private readonly stringUtils: StringUtils,
  ) {
    super();
  }

  /**
   * 获取缓存监控信息
   */
  @PreAuthorize('hasPermi("monitor:cache:list")')
  @Get()
  async getInfo() {
    // 获取数据库大小
    const dbSize = await this.redisClient.dbsize();
    // 获取命令统计
    const commandStatsStr = await this.redisClient.info('commandstats');
    const commandStats = commandStatsStr
      .split('\r\n')
      .slice(1, -1)
      .reduce((r, d) => {
        const [key, value] = d.split(':');
        r[key.trim().replace('cmdstat_', '')] = value.trim();
        r.push({
          name: key.trim().replace('cmdstat_', ''),
          value: this.stringUtils.substringBetween(
            value.trim(),
            'calls=',
            ',usec',
          ),
        });
        return r;
      }, []);

    // 获取服务器信息
    const serverStr = await this.redisClient.info('server');
    const server = serverStr.split(',').reduce((r, d, i) => {
      if (i === 0) {
        // server
        d.split('\r\n').forEach((s, si) => {
          if (si > 0) {
            const [key, value] = s.split(':');
            if (key) {
              r[key.trim()] = value.trim();
            }
          }
        });
      } else {
        const [key, value] = d.split('=');
        r[key.trim()] = value?.trim();
      }
      return r;
    }, {});

    // 获取客户端信息
    const clientInfoStr = await this.redisClient.info('clients');
    const clientInfo = clientInfoStr
      .split('\r\n')
      .slice(1, -1)
      .reduce((r, d) => {
        const [key, value] = d.split(':');
        r[key.trim()] = value.trim();
        return r;
      }, {});

    // 获取内存信息
    const memoryInfoStr = await this.redisClient.info('memory');
    const memoryInfo = memoryInfoStr
      .split('\r\n')
      .slice(1, -1)
      .reduce((r, d) => {
        const [key, value] = d.split(':');
        r[key.trim()] = value.trim();
        return r;
      }, {});

    // 获取CPU信息
    const cpuInfoStr = await this.redisClient.info('cpu');
    const cpuInfo = cpuInfoStr
      .split('\r\n')
      .slice(1, -1)
      .reduce((r, d) => {
        const [key, value] = d.split(':');
        r[key.trim()] = value.trim();
        return r;
      }, {});

    // 获取持久化信息
    const persistenceInfoStr = await this.redisClient.info('persistence');
    const persistenceInfo = persistenceInfoStr
      .split('\r\n')
      .slice(1, -1)
      .reduce((r, d) => {
        const [key, value] = d.split(':');
        r[key.trim()] = value.trim();
        return r;
      }, {});

    // 获取统计信息
    const statsInfoStr = await this.redisClient.info('stats');
    const statsInfo = statsInfoStr
      .split('\r\n')
      .slice(1, -1)
      .reduce((r, d) => {
        const [key, value] = d.split(':');
        r[key.trim()] = value.trim();
        return r;
      }, {});

    const result = {
      info: {
        redis_version: server['redis_version'],
        redis_mode: server['redis_mode'],
        tcp_port: parseInt(server['tcp_port']),
        connected_clients: parseInt(clientInfo['connected_clients']),
        uptime_in_days: parseInt(server['uptime_in_days']),
        used_memory_human: memoryInfo['used_memory_human'],
        used_cpu_user_children: parseFloat(cpuInfo['used_cpu_user_children']),
        maxmemory_human: memoryInfo['maxmemory_human'],
        aof_enabled: persistenceInfo['aof_enabled'],
        rdb_last_bgsave_status: persistenceInfo['rdb_last_bgsave_status'],
        instantaneous_input_kbps: parseFloat(
          statsInfo['instantaneous_input_kbps'],
        ),
        instantaneous_output_kbps: parseFloat(
          statsInfo['instantaneous_output_kbps'],
        ),
      },
      dbSize: dbSize,
      commandStats: commandStats,
    };

    return this.success(result);
  }

  /**
   * 获取缓存名称列表
   */
  @PreAuthorize('hasPermi("monitor:cache:list")')
  @Get('/getNames')
  async cache() {
    return this.success(this.caches);
  }

  /**
   * 获取缓存键名列表
   *
   * @param cacheName 缓存名称
   */
  @PreAuthorize('hasPermi("monitor:cache:list")')
  @Get('/getKeys/:cacheName')
  async getCacheKeys(@Param('cacheName') cacheName: string) {
    const cacheKeys = await this.redisCacheService.keys(cacheName + '*');
    return this.success(new Set(cacheKeys));
  }

  /**
   * 获取缓存内容
   *
   * @param cacheName 缓存名称
   * @param cacheKey 缓存键名
   */
  @PreAuthorize('hasPermi("monitor:cache:list")')
  @Get('/getValue/:cacheName/:cacheKey')
  async getCacheValue(
    @Param('cacheName') cacheName: string,
    @Param('cacheKey') cacheKey: string,
  ) {
    const cacheValue: string =
      await this.redisCacheService.getCacheObject(cacheKey);
    const sysCache = new SysCache(cacheName, cacheKey, cacheValue);
    return this.success(sysCache);
  }

  /**
   * 清理指定名称缓存
   *
   * @param cacheName 缓存名称
   */
  @PreAuthorize('hasPermi("monitor:cache:list")')
  @Delete('/clearCacheName/:cacheName')
  async clearCacheName(@Param('cacheName') cacheName: string) {
    const cacheKeys = await this.redisClient.keys(cacheName + '*');
    await this.redisClient.del(cacheKeys);
    return this.success();
  }

  @PreAuthorize('hasPermi("monitor:cache:list")')
  @Delete('/clearCacheKey/:cacheKey')
  async clearCacheKey(@Param('cacheKey') cacheKey: string) {
    await this.redisCacheService.deleteObject(cacheKey);
    return this.success();
  }

  @PreAuthorize('hasPermi("monitor:cache:list")')
  @Delete('/clearCacheAll')
  async clearCacheAll() {
    const cacheKeys = await this.redisCacheService.keys('*');
    await this.redisCacheService.deleteObjects(cacheKeys);
    return this.success();
  }
}
