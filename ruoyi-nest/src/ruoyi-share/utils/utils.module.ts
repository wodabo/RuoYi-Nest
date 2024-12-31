import { Module, Global, Injectable, NestMiddleware, MiddlewareConsumer, NestModule, ExecutionContext, CallHandler, NestInterceptor } from '@nestjs/common';
import { AddressUtils } from './address.utils';
import { ShareConfigModule } from '../config/share-config.module';
import { GifUtils } from './gif.utils';
import { IpUtils } from './ip.utils';
import { QueryUtils } from './query.utils';
import { DataScopeUtils } from './data-scope.utils';
import { SecurityUtils } from './security.utils';
import { SqlLoggerUtils } from './sql-logger.utils';
import { FileUploadUtils } from './file-upload.utils';
import { MimeTypeUtils } from './mime-type.utils';
import { SeqUtils } from './seq.utils';
import { UuidUtils } from './uuid.utils';
import { ExcelUtils } from './excel.utils';
import { EntityValidatorUtils } from './entity-validator.utils';
import { TreeUtils } from './tree.utils';
import { ContextHolderUtils } from './context-holder.utils';
import { StringUtils } from './string.utils';
import { DictUtils } from './dict.utils';
import { RedisModule } from '../redis/redis.module';
import { PasswordUtils } from './password.utils';
import { ShareUtils } from './share.utils';
import { LogUtils } from './log.utils';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SysLogininforModule } from '~/ruoyi-system/sys-logininfor/sys-logininfor.module';
import { SysOperlogModule } from '~/ruoyi-system/sys-operlog/sys-operlog.module';
import { FileUtils } from './file.utils';
import { FileTypeUtils } from './file-type.utils';
import { ServerConfigUtils } from './server-config.utils';  
import { ScheduleUtils } from './schedule.utils';
import { SqlUtils } from './sql.utils';
import { GenUtils } from './gen.utils';
import { HbsUtils } from './hbs.utils';

import { GenConfigModule } from '~/ruoyi-generator/gen-config/gen-config.module';

const providers = [
  AddressUtils,
  GifUtils,
  IpUtils,
  QueryUtils,
  DataScopeUtils,
  SecurityUtils,
  SqlLoggerUtils,
  FileUploadUtils,
  MimeTypeUtils,
  SeqUtils,
  UuidUtils,
  ExcelUtils,
  EntityValidatorUtils,
  TreeUtils,
  ContextHolderUtils,
  StringUtils,
  DictUtils,
  PasswordUtils,
  ShareUtils,
  LogUtils,
  FileUtils,
  FileTypeUtils,
  ServerConfigUtils,
  ScheduleUtils,
  SqlUtils,
  GenUtils,
  HbsUtils
];

@Global()
@Module({
  imports: [
    ShareConfigModule, 
    RedisModule, 
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          redis: {
            host: configService.get('nest.redis.host'),
            port: configService.get('nest.redis.port'),
          },
        }
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'logs',
    }),
    SysLogininforModule,
    SysOperlogModule,
    GenConfigModule
  ],
  providers: providers,
  exports: providers
})
export class UtilsModule {

}

