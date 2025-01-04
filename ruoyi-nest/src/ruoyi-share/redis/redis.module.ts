import { Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { RedisModule as NestRedisModule } from '@songkeys/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          host: configService.get('nest.redis.host'),
          port: configService.get('nest.redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisModule {}
