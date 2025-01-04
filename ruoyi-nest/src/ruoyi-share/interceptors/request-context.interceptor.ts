import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { ContextHolderUtils } from '~/ruoyi-share/utils/context-holder.utils';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly contextHolderUtils: ContextHolderUtils) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    return this.contextHolderUtils.runWithContext(() => {
      this.contextHolderUtils.setContext('request', request);
      return next.handle().pipe(
        tap({
          finalize: () => {
            this.contextHolderUtils.setContext('request', null);
          },
        }),
      );
    });
  }
}
