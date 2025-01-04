/**
 * 服务相关配置
 *
 * @author ruoyi
 */
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ServerConfigUtils {
  /**
   * 获取完整的请求路径，包括：域名，端口，上下文访问路径
   *
   * @return 服务地址
   */
  public getUrl(request: Request): string {
    return this.getDomain(request);
  }

  public getDomain(request: any): string {
    const url: any = request.getRequestURL();
    const contextPath: string = request.getServletContext().getContextPath();
    return url
      .delete(url.length - request.getRequestURI().length, url.length)
      .append(contextPath)
      .toString();
  }
}
