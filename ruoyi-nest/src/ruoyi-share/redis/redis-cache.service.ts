import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@songkeys/nestjs-redis'

@Injectable()
export class RedisCacheService {

  constructor(@InjectRedis() private redisService: Redis) {
  }

  /**
   * 缓存基本的对象，Integer、String、实体类等
   *
   * @param key 缓存的键值
   * @param value 缓存的值
   */
  public async setCacheObject<T>(key: string, value: T): Promise<void> {
    await this.redisService.set(key, JSON.stringify(value));
  }

  /**
   * 缓存基本的对象，Integer、String、实体类等
   *
   * @param key 缓存的键值
   * @param value 缓存的值
   * @param timeout 时间
   */
  public async setCacheObjectWithTimeout<T>(key: string, value: T, timeout: number): Promise<void> {
    await this.redisService.set(key, JSON.stringify(value), 'EX', timeout);
  }

  /**
   * 设置有效时间
   *
   * @param key Redis键
   * @param timeout 超时时间
   * @return true=设置成功；false=设置失败
   */
  public async expire(key: string, timeout: number): Promise<boolean> {
    const result = await this.redisService.expire(key, timeout);
    return result === 1;
  }

  /**
   * 获取有效时间
   *
   * @param key Redis键
   * @return 有效时间
   */
  public async getExpire(key: string): Promise<number> {
    return await this.redisService.ttl(key);
  }

  /**
   * 判断 key是否存在
   *
   * @param key 键
   * @return true 存在 false不存在
   */
  public async hasKey(key: string): Promise<boolean> {
    const result = await this.redisService.exists(key);
    return result === 1;
  }

  /**
   * 获得缓存的基本对象。
   *
   * @param key 缓存键值
   * @return 缓存键值对应的数据
   */
  public async getCacheObject<T>(key: string): Promise<T> {
    const data = await this.redisService.get(key);
    return JSON.parse(data);
  }

  /**
   * 删除单个对象
   *
   * @param key
   */
  public async deleteObject(key: string): Promise<boolean> {
    const result = await this.redisService.del(key);
    return result === 1;
  }

  /**
   * 删除集合对象
   *
   * @param keys 多个对象
   * @return
   */
  public async deleteObjects(keys: string[]): Promise<number> {
    if(keys.length > 0){
      return await this.redisService.del(...keys);
    }
  }

  /**
   * 缓存List数据
   *
   * @param key 缓存的键值
   * @param dataList 待缓存的List数据
   * @return 缓存的对象
   */
  public async setCacheList<T>(key: string, dataList: T[]): Promise<number> {
    const result = await this.redisService.rpush(key, ...dataList.map(item => JSON.stringify(item)));
    return result;
  }

  /**
   * 获得缓存的list对象
   *
   * @param key 缓存的键值
   * @return 缓存键值对应的数据
   */
  public async getCacheList<T>(key: string): Promise<T[]> {
    const data = await this.redisService.lrange(key, 0, -1);
    return data.map(item => JSON.parse(item));
  }

  /**
   * 缓存Set
   *
   * @param key 缓存键值
   * @param dataSet 缓存的数据
   * @return 缓存数据的对象
   */
  public async setCacheSet<T>(key: string, dataSet: T[]): Promise<number> {
    const result = await this.redisService.sadd(key, ...dataSet.map(item => JSON.stringify(item)));
    return result;
  }

  /**
   * 获得缓存的set
   *
   * @param key
   * @return
   */
  public async getCacheSet<T>(key: string): Promise<T[]> {
    const data = await this.redisService.smembers(key);
    return data.map(item => JSON.parse(item));
  }

  /**
   * 缓存Map
   *
   * @param key
   * @param dataMap
   */
  public async setCacheMap<T>(key: string, dataMap: Record<string, T>): Promise<void> {
    const entries = Object.entries(dataMap).reduce((acc, [mapKey, value]) => {
      acc.push(mapKey, JSON.stringify(value));
      return acc;
    }, []);
    await this.redisService.hmset(key, ...entries);
  }

  /**
   * 获得缓存的Map
   *
   * @param key
   * @return
   */
  public async getCacheMap<T>(key: string): Promise<Record<string, T>> {
    const data = await this.redisService.hgetall(key);
    return Object.entries(data).reduce((acc, [mapKey, value]) => {
      acc[mapKey] = JSON.parse(value);
      return acc;
    }, {});
  }

  /**
   * 往Hash中存入数据
   *
   * @param key Redis键
   * @param hKey Hash键
   * @param value 值
   */
  public async setCacheMapValue<T>(key: string, hKey: string, value: T): Promise<void> {
    await this.redisService.hset(key, hKey, JSON.stringify(value));
  }

  /**
   * 获取Hash中的数据
   *
   * @param key Redis键
   * @param hKey Hash键
   * @return Hash中的对象
   */
  public async getCacheMapValue<T>(key: string, hKey: string): Promise<T> {
    const data = await this.redisService.hget(key, hKey);
    return JSON.parse(data);
  }

  /**
   * 获取多个Hash中的数据
   *
   * @param key Redis键
   * @param hKeys Hash键集合
   * @return Hash对象集合
   */
  public async getMultiCacheMapValue<T>(key: string, hKeys: string[]): Promise<T[]> {
    const data = await this.redisService.hmget(key, ...hKeys);
    return data.map(item => JSON.parse(item));
  }

  /**
   * 删除Hash中的某条数据
   *
   * @param key Redis键
   * @param hKey Hash键
   * @return 是否成功
   */
  public async deleteCacheMapValue(key: string, hKey: string): Promise<boolean> {
    const result = await this.redisService.hdel(key, hKey);
    return result === 1;
  }

  /**
   * 获得缓存的基本对象列表
   *
   * @param pattern 字符串前缀
   * @return 对象列表
   */
  public async keys(pattern: string): Promise<string[]> {
    return await this.redisService.keys(pattern);
  }
}
