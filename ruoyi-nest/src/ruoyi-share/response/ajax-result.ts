import { HttpStatus } from '~/ruoyi-share/constant/HttpStatus';

export class AjaxResult<T = any> {
  /** 状态码 */
  static readonly CODE_TAG = 'code';

  /** 返回内容 */
  static readonly MSG_TAG = 'msg';

  /** 数据对象 */
  static readonly DATA_TAG = 'data';

  constructor(
    public code: number = HttpStatus.SUCCESS,
    public msg: string = 'success',
    public data?: T,
  ) {}

  static success<T>(data?: T, msg: string = 'success'): any {
    return new AjaxResult(HttpStatus.SUCCESS, msg, data);
  }

  static error(msg: string = 'error', code: number = HttpStatus.ERROR): any {
    return new AjaxResult(code, msg);
  }

  static warn(msg: string): any {
    return new AjaxResult(HttpStatus.WARN, msg, null);
  }
}

// export function AjaxResult():any{
//     function success(data:any,msg:string='success'): any{
//         return {
//             code:200,
//             msg,
//             data
//         }
//     }
//     function error(msg:string='error',code:number=500):any{
//         return {
//             code,
//             msg
//         }
//     }

//     return {
//         success,
//         error
//     }
// }
