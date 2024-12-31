import { Module,Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { RuoYiSystemModule } from '~/ruoyi-system/ruoyi-system.module';
import { RuoYiFrameworkModule } from '~/ruoyi-framework/ruoyi-framework.module';
import { RuoYiQuartzModule } from '~/ruoyi-quartz/ruoyi-quartz.module';
import { SystemModule } from './system/system.module';
import { MonitorModule } from './monitor/monitor.module';
import { RedisModule } from '~/ruoyi-share/redis/redis.module';
import { ShareModule } from './share/share.module';
import { ShareConfigModule } from '~/ruoyi-share/config/share-config.module'; 
import { UtilsModule } from '~/ruoyi-share/utils/utils.module';
import { ServeStaticModule,ServeStaticModuleAsyncOptions } from '@nestjs/serve-static';
import { join } from 'path';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { RequestContextInterceptor } from '~/ruoyi-share/interceptors/request-context.interceptor';
import { LogInterceptor } from '~/ruoyi-share/interceptors/log.interceptor';

import { ScheduleModule } from '@nestjs/schedule';

import { RuoYiGeneratorModule } from '~/ruoyi-generator/ruoyi-generator.module'; 

/**
 * 启动程序
 * 
 * @author ruoyi
 */
@Module({
  imports: [
    RuoYiGeneratorModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRootAsync({
      inject: [RuoYiConfigService],
      useFactory: (ruoyiConfigService: RuoYiConfigService) => {
        return [{
          rootPath: ruoyiConfigService.getProfile(),
          serveRoot: '/profile'
        }]
      }
    }),
    ShareConfigModule,
    RuoYiQuartzModule,
    ConfigModule.forRoot({
      load: [() => {
        const applicationDruid = yaml.load(
          fs.readFileSync(path.join(__dirname, 'resources', 'application-druid.yml'), 'utf8'),
        ) as Record<string, any>;
        const application = yaml.load(
          fs.readFileSync(path.join(__dirname, 'resources', 'application.yml'), 'utf8'),
        ) as Record<string, any>;
        const gen = yaml.load(
          fs.readFileSync(path.join(__dirname, '../ruoyi-generator/resources/generator.yml'), 'utf8'),
        ) as Record<string, any>;
        const result = {
          ...applicationDruid,
          ...application,
          ...gen
        }
        return result;
      }],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get('datasource.host'),
            port: configService.get('datasource.port'),
            username: configService.get('datasource.username'),
            password: configService.get('datasource.password'),
            database: configService.get('datasource.database'),
            autoLoadEntities: configService.get('datasource.autoLoadEntities'),
            synchronize: configService.get('datasource.synchronize'),
            charset: configService.get('datasource.charset'),
            timezone: configService.get('datasource.timezone'),
            extra: {
              connectionLimit: configService.get('datasource.poolOptions.max'),     // 最大连接数
              waitForConnections: configService.get('datasource.poolOptions.waitForConnections'),
              queueLimit: configService.get('datasource.poolOptions.queueLimit'),
              connectTimeout: configService.get('datasource.poolOptions.connectTimeout'),
            },
            // logging: true,
            // logger: new QueryLogger()
      }),
      inject: [ConfigService],
    }),
    RuoYiSystemModule,
    RuoYiFrameworkModule,
    SystemModule,
    MonitorModule,
    RedisModule,
    ShareModule,
    UtilsModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor
    }
  ],
  controllers: [],
})
export class RuoYiAdminModule{
  constructor() {}


  static async bootstrap() {
    console.log(
        "\n" +
        "(♥◠‿◠)ﾉﾞ  若依启动成功   ლ(´ڡ`ლ)ﾞ  \n" +
        " .-------.       ____     __        \n" +
        " |  _ _   \\      \\   \\   /  /    \n" +
        " | ( ' )  |       \\  _. /  '       \n" +
        " |(_ o _) /        _( )_ .'         \n" +
        " | (_,_).' __  ___(_ o _)'          \n" +
        " |  |\\ \\  |  ||   |(_,_)'         \n" +
        " |  | \\ `'   /|   `-'  /           \n" +
        " |  |  \\    /  \\      /           \n" +
        " ''-'   `'-'    `-..-'              \n" +
        "\n" +
        `服务器启动成功: \n` +
        `- Local:   http://localhost:${process.env.PORT ?? 3000}\n` +
        // `- Network: ${serverUrl}${apiPrefix}\n` +
        // `- Swagger: ${swaggerUrl}\n` +
        // `- 运行环境: ${env}\n` +
        `- 当前时间: ${new Date().toLocaleString()}\n`
    );
  }
}