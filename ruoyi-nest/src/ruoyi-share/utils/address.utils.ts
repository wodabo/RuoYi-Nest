import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IpUtils } from './ip.utils';
import { ConfigService } from '@nestjs/config';
import { RuoYiConfigService } from '../config/ruoyi-config.service';
import { Constants } from '../constant/constants';

/**
 * 获取地址类
 * 
 * @author ruoyi
 */
@Injectable()
export class AddressUtils {
    private readonly logger = new Logger(AddressUtils.name);

    // IP地址查询
    private readonly IP_URL = 'http://whois.pconline.com.cn/ipJson.jsp';

    // 未知地址
    private readonly UNKNOWN = 'XX XX';

    constructor(
        private readonly ruoYiConfigService: RuoYiConfigService,
        private readonly ipUtils: IpUtils,
    ) {}

    /**
     * 根据IP获取实际地址
     */
    public async getLocation(ip: string): Promise<string> {
        // 内网不查询
        if (this.ipUtils.internalIp(ip)) {
            return '内网IP';
        }

        // 从配置中获取是否启用地址查询
        const addressEnabled = this.ruoYiConfigService.isAddressEnabled();

        if (addressEnabled) {
            try {
                const response = await axios.get(this.IP_URL, {
                    params: {
                        ip,
                        json: true
                    },
                    responseType: 'json',
                    responseEncoding: Constants.GBK
                });

                const data = response.data;
                if (!data) {
                    this.logger.error(`获取地理位置异常 ${ip}`);
                    return this.UNKNOWN;
                }

                const region = data.pro;
                const city = data.city;
                return `${region} ${city}`;

            } catch (e) {
                this.logger.error(`获取地理位置异常 ${ip}`);
            }
        }

        return this.UNKNOWN;
    }
}
