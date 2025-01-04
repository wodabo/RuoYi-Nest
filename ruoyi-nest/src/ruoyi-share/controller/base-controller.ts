import { Logger } from '@nestjs/common';
import { Request } from 'express';
import { PageDto } from '../dto/page.dto';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
// import { LoginUser } from '../../ruoyi-system/sys-user/entities/login-user.entity';
// import { SecurityUtils } from '../utils/security.utils';
// import { StringUtils } from '../utils/string.utils';

/**
 * 控制器基类
 */
export class BaseController {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * 设置请求分页数据
   */
  protected startPage(query: any): void {
    // 设置默认值
    query.params = query.params || {};
    query.params.pageNum = query.pageNum;
    query.params.pageSize = query.pageSize;
  }

  /**
   * 设置请求排序数据
   */
  protected startOrderBy(pageDto: PageDto): void {
    // 实现排序逻辑
  }

  /**
   * 响应请求分页数据
   */
  protected getDataTable<T>(list: T[], total: number): TableDataInfo<T> {
    return new TableDataInfo(list, total);
  }

  /**
   * 返回失败消息
   */
  protected error(msg?: string): AjaxResult {
    return AjaxResult.error(msg);
  }

  //   /**
  //    * 返回成功消息
  //    */
  //   protected successWithMessage(message: string): AjaxResult {
  //     return AjaxResult.success(message);
  //   }

  /**
   * 返回成功数据
   */
  protected success(data?: any, msg?: string): AjaxResult {
    return AjaxResult.success(data, msg);
  }

  //   /**
  //    * 返回失败消息
  //    */
  //   protected errorWithMessage(message: string): AjaxResult {
  //     return AjaxResult.error(message);
  //   }

  /**
   * 返回警告消息
   */
  protected warn(message: string): AjaxResult {
    return AjaxResult.warn(message);
  }

  /**
   * 响应返回结果
   */
  protected toAjax(result: boolean | number): AjaxResult {
    return result ? this.success() : this.error();
  }

  //   /**
  //    * 页面跳转
  //    */
  //   protected redirect(url: string): string {
  //     return StringUtils.format('redirect:{}', url);
  //   }

  //   /**
  //    * 获取用户缓存信息
  //    */
  //   protected getLoginUser(req: Request): LoginUser {
  //     return SecurityUtils.getLoginUser(req);
  //   }

  //   /**
  //    * 获取登录用户id
  //    */
  //   protected getUserId(req: Request): number {
  //     return this.getLoginUser(req).userId;
  //   }

  //   /**
  //    * 获取登录部门id
  //    */
  //   protected getDeptId(req: Request): number {
  //     return this.getLoginUser(req).deptId;
  //   }

  //   /**
  //    * 获取登录用户名
  //    */
  //   protected getUsername(req: Request): string {
  //     return this.getLoginUser(req).username;
  //   }
}
