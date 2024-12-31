import { Injectable } from '@nestjs/common';
import { Constants } from '~/ruoyi-share/constant/Constants';
import { IpUtils } from './ip.utils';
import { QueryUtils } from './query.utils';
import { SqlLoggerUtils } from './sql-logger.utils';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { LoginUser } from '../model/login-user';
import { AddressUtils } from './address.utils';
import { SecurityUtils } from './security.utils';
import { TokenConfigService } from '../config/token-config.service';
import { SysLogininfor } from '~/ruoyi-system/sys-logininfor/entities/sys-logininfor.entity';
import { ShareUtils } from './share.utils';
import { SysLogininforService } from '~/ruoyi-system/sys-logininfor/sys-logininfor.service';
import { SysOperlog } from '~/ruoyi-system/sys-operlog/entities/sys-operlog.entity';
import { SysOperlogService } from '~/ruoyi-system/sys-operlog/sys-operlog.service';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { ContextHolderUtils } from './context-holder.utils';

/**
 * 异步工厂（产生任务用）
 * 
 * @author ruoyi
 */
@Injectable()
@Processor('logs')
export class LogUtils
{

    constructor(
        private readonly queryUtils: QueryUtils,
        private readonly sqlLoggerUtils: SqlLoggerUtils,
        private readonly contextHolderUtils: ContextHolderUtils,
        private readonly addressUtils: AddressUtils,
        private readonly ipUtils: IpUtils,
        private readonly shareUtils: ShareUtils,
        private readonly logininforService: SysLogininforService  ,
        private readonly operlogService: SysOperlogService,
        @InjectQueue('logs') private logsQueue: Queue,
    ) {}

    /**
     * 记录登录信息
     * 
     * @param username 用户名
     * @param status 状态
     * @param message 消息
     * @param args 列表
     * @return 任务task
     */
    public async recordLogininfor(username: string, status: string, message: string, ...args: any[])
    {
        const request = await this.contextHolderUtils.getContext('request');
        const userAgent = request.headers['user-agent'];
        const ip = this.ipUtils.getIpAddr(request);
        const address = await this.addressUtils.getLocation(ip);
        let s = `[${ip}][${address}][${username}][${status}][${message}]`;
        // 打印信息到日志
        console.info(s);
        // 获取客户端操作系统
        const os = this.shareUtils.parseOS(userAgent);
        // 获取客户端浏览器
        const browser = this.shareUtils.parseBrowser(userAgent);
        // 封装对象
        const logininfor = new SysLogininfor();
        logininfor.userName = username;
        logininfor.ipaddr = ip;
        logininfor.loginLocation = address;
        logininfor.browser = browser;
        logininfor.os = os;
        logininfor.msg = message;
        // 日志状态
        if ([Constants.LOGIN_SUCCESS, Constants.LOGOUT, Constants.REGISTER].every(s => s === status))
        {
            logininfor.status = Constants.SUCCESS;
        }
        else if (Constants.LOGIN_FAIL === status)
        {
            logininfor.status = Constants.FAIL;
        }
        // 插入数据
        // this.logininforService.insertLogininfor(logininfor);

        // 将任务添加到队列而不是直接执行
       await this.logsQueue.add('recordLogininfor', logininfor);
    }

    /**
     * 操作日志记录
     * 
     * @param operLog 操作日志信息
     * @return 任务task
     */
    public async recordOper(operLog: SysOperlog)
    {
        // 远程查询操作地点

        await this.logsQueue.add('recordOper', operLog);
    }


     /**
    * 处理登录日志队列任务
    */
   @Process('recordLogininfor')
   private async handleRecordLogininfor(job: Job) {
       const logininfor = job.data;

       await this.logininforService.insertLogininfor(logininfor);
   }
    /**
    * 处理操作日志队列任务
    */
   @Process('recordOper')
   private async handleRecordOper(job: Job) {
       const operLog = job.data;
       operLog.operLocation = await this.addressUtils.getLocation(operLog.operIp);
       await this.operlogService.insertOperlog(operLog);
   }
}



