import { Controller, Get, Delete, Body, Param, Query, Res, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
import { SysUserOnlineService } from '~/ruoyi-system/sys-user-online/sys-user-online.service';
import { SysUserOnline } from '~/ruoyi-system/sys-user-online/entities/sys-user-online.entity';
import { RedisCacheService } from '~/ruoyi-share/redis/redis-cache.service';
import { CacheConstants } from '~/ruoyi-share/constant/CacheConstants';
import { LoginUser } from '~/ruoyi-share/model/login-user';

/**
 * 在线用户监控
 * 
 * @author ruoyi
 */
@ApiTags('在线用户监控')
@Controller('monitor/online')
export class SysUserOnlineController extends BaseController {
  constructor(
    private readonly userOnlineService: SysUserOnlineService,
    private readonly excelUtils: ExcelUtils,
    private readonly redisCacheService: RedisCacheService
  ) {
    super();
  }

  /**
   * 获取在线用户列表
   * 
   * @param query 查询参数
   */
  @ApiOperation({ summary: '获取在线用户列表' })
  @PreAuthorize('hasPermi("monitor:online:list")')
  @Get('list')
  async list(@Query() query: SysUserOnline, @Request() req) {
    // 获取所有在线用户的token
    const keys = await this.redisCacheService.keys(CacheConstants.LOGIN_TOKEN_KEY + "*");
    let userOnlineList: SysUserOnline[] = [];
    
    // 遍历token获取在线用户信息
    for (const key of keys) {
      const loginUser = new LoginUser(await this.redisCacheService.getCacheObject<LoginUser>(key));
      if (loginUser.ipaddr && loginUser.getUsername()) {
        userOnlineList.push(await this.userOnlineService.selectOnlineByInfo(loginUser.ipaddr, loginUser.getUsername(), loginUser));
      } else if (loginUser.ipaddr) {
        userOnlineList.push(await this.userOnlineService.selectOnlineByIpaddr(loginUser.ipaddr, loginUser));
      } else if (loginUser.getUsername() && loginUser.user) {
        userOnlineList.push(await this.userOnlineService.selectOnlineByUserName(loginUser.getUsername(), loginUser));
      } else {
        userOnlineList.push(await this.userOnlineService.loginUserToUserOnline(loginUser));
      }
    }
    
    // 倒序排列并过滤空值
    userOnlineList.reverse();
    userOnlineList = userOnlineList.filter(Boolean);
    return this.getDataTable(userOnlineList, userOnlineList.length);
  }

  /**
   * 强退用户
   * 
   * @param tokenId 用户token
   */
  @ApiOperation({ summary: '强退用户' })
  @PreAuthorize('hasPermi("monitor:online:forceLogout")')
  @Log({ title: '在线用户', businessType: BusinessType.FORCE })
  @Delete(':tokenId')
  async forceLogout(@Param('tokenId') tokenId: string) {
    await this.redisCacheService.deleteObject(CacheConstants.LOGIN_TOKEN_KEY + tokenId);
    return this.success();
  }
}
