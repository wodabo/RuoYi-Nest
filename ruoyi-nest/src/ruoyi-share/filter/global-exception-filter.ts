import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  MethodNotAllowedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ServiceException } from '../exception/ServiceException';
import { AjaxResult } from '../response/ajax-result';
import { Logger } from '@nestjs/common';
import { DemoModeException } from '../exception/DemoModeException';
import { HttpStatus } from '~/ruoyi-share/constant/HttpStatus';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestURI = request.url;

    const error = exception as Error;
    const message = error.message;
    const stack = error.stack
      ?.split('\n')
      .map((line) => line.trim())
      .join('\n    ');

    const route = request.route;

    const matchedPath = route?.path || 'Unknown Path'; // 获取匹配到的路径

    // 用户认证失败
    if (exception instanceof UnauthorizedException) {
      this.logger.error(
        `请求地址'${requestURI}',匹配路径'${matchedPath}',用户认证失败.\n错误信息: ${message}\n调用堆栈:\n    ${stack}`,
      );
      response
        .status(200)
        .json(
          AjaxResult.error(
            `请求访问${requestURI}认证失败，无法访问系统资源`,
            HttpStatus.UNAUTHORIZED,
          ),
        );
      return;
    }

    // 权限校验异常
    if (exception instanceof ForbiddenException) {
      this.logger.error(
        `请求地址'${requestURI}',匹配路径'${matchedPath}',权限校验失败.\n错误信息: ${message}\n调用堆栈:\n    ${stack}`,
      );
      response
        .status(200)
        .json(
          AjaxResult.error('没有权限，请联系管理员授权', HttpStatus.FORBIDDEN),
        );
      return;
    }

    // 请求方式不支持
    if (exception instanceof MethodNotAllowedException) {
      this.logger.error(
        `请求地址'${requestURI}',匹配路径'${matchedPath}',不支持'${request.method}'请求.\n错误信息: ${message}\n调用堆栈:\n    ${stack}`,
      );
      response.status(200).json(AjaxResult.error(exception.message));
      return;
    }

    // 业务异常
    if (exception instanceof ServiceException) {
      this.logger.error(
        `请求地址'${requestURI}',匹配路径'${matchedPath}',业务异常.\n错误信息: ${message}\n调用堆栈:\n    ${stack}`,
      );
      const code = exception.getCode();
      response
        .status(200)
        .json(
          code
            ? AjaxResult.error(exception.message, code)
            : AjaxResult.error(exception.message),
        );
      return;
    }

    // 请求路径中缺少必需的路径变量
    if (exception instanceof NotFoundException) {
      this.logger.error(
        `请求地址'${requestURI}',匹配路径'${matchedPath}',请求路径中缺少必需的路径变量.\n错误信息: ${message}\n调用堆栈:\n    ${stack}`,
      );
      response.status(200).json(AjaxResult.error(exception.message));
      return;
    }

    // 参数验证异常
    if (exception instanceof BadRequestException) {
      this.logger.error(
        `请求地址'${requestURI}',匹配路径'${matchedPath}',参数验证异常.\n错误信息: ${message}\n调用堆栈:\n    ${stack}`,
      );
      response
        .status(200)
        .json(AjaxResult.error(exception.message, HttpStatus.BAD_REQUEST));
      return;
    }

    // 演示模式异常
    if (exception instanceof DemoModeException) {
      response.status(200).json(AjaxResult.error('演示模式，不允许操作'));
      return;
    }

    // 处理其他 HTTP 异常
    if (exception instanceof HttpException) {
      this.logger.error(
        `请求地址'${requestURI}',匹配路径'${matchedPath}',发生异常.\n错误信息: ${message}\n调用堆栈:\n    ${stack}`,
      );
      response.status(200).json(AjaxResult.error(message));
      return;
    }

    // 处理其他未知异常
    this.logger.error(
      `请求地址'${requestURI}',匹配路径'${matchedPath}',发生系统异常.\n错误信息: ${message}\n调用堆栈:\n    ${stack}`,
    );
    response
      .status(200)
      .json(AjaxResult.error(message || '服务器错误，请联系管理员'));
    return;
  }
}
