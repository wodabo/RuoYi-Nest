// src/common/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                // // 如果已经是 ApiResponse 实例，直接返回
                // if (data instanceof ApiResponse) {
                //     return data;
                // }

                // // 处理分页数据
                // if (data && data.rows !== undefined && data.total !== undefined) {
                //     return ApiResponse.successWithRows(data.rows, data.total);
                // }

                // console.log('TransformInterceptor',JSON.parse(JSON.stringify(data)));

                // // 处理普通数据
                // return ApiResponse.success(data);

                return data;
            })
        );
    }


}