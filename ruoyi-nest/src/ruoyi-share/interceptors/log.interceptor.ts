import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';
import { SysOperlog } from '~/ruoyi-system/sys-operlog/entities/sys-operlog.entity';
import { BusinessStatus } from '../enums/BusinessStatus';
import { BusinessStatusMap } from '~/ruoyi-share/enums/BusinessStatus';
import { IpUtils } from '../utils/ip.utils';
import { SecurityUtils } from '../utils/security.utils';
import { LogUtils } from '../utils/log.utils';
import { LoginUser } from '../model/login-user';
import { Reflector } from '@nestjs/core';
import { LOG_KEY, LogOptions } from '~/ruoyi-share/annotation/Log';
import { BusineesTypeMap } from '../enums/BusinessType';
import { OperatorTypeMap } from '../enums/OperatorType';

@Injectable()
export class LogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LogInterceptor.name);

    constructor(
        private readonly ipUtils: IpUtils,
        private readonly securityUtils: SecurityUtils,
        private readonly logUtils: LogUtils,
        private readonly reflector: Reflector
    ) {

    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const loginUser: LoginUser = request.user

        // 获取 @Log 注解的元数据
        const logMetadata = this.reflector.get<LogOptions>(LOG_KEY, context.getHandler());

        const start = Date.now();

        const handleResponse = (response) => {
            if (loginUser) {
                const end = Date.now();
                const duration = end - start;
                const log = new SysOperlog();
                log.status = BusinessStatusMap[BusinessStatus.SUCCESS];
                log.requestMethod = request.method;
                log.operIp = this.ipUtils.getIpAddr(request);
                log.costTime = duration;
                log.operName = loginUser.getUsername();
                log.operUrl = request.originalUrl;
                log.operParam = 'body: ' + JSON.stringify(request.body, null, 2);
                if (request.query) {
                    log.operParam += ', query: ' + JSON.stringify(request.query, null, 2);
                }
                if (request.params) {
                    log.operParam += ', params: ' + JSON.stringify(request.params, null, 2);
                }
                log.jsonResult = JSON.stringify(response, null, 2);

                if (logMetadata) {
                    log.businessType = BusineesTypeMap[logMetadata.businessType]
                    log.title = logMetadata.title
                    log.operatorType = OperatorTypeMap[logMetadata.operatorType]
                }

                this.logUtils.recordOper(log);
            }

            return response;
        };

        return next
            .handle()
            .pipe(
                tap((response) => handleResponse(response)),
            );
    }
}
