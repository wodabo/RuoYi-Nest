import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'properties-parser';

// 加载 properties 文件
const filePath = path.join(__dirname, '../../ruoyi-admin/resources/i18n/messages.properties');
const content = fs.readFileSync(filePath, 'utf-8');

export class MessageUtils {

  
  private static messages: Record<string, string> = parse(content);

  /**
   * 根据消息键和参数获取消息
   *
   * @param code 消息键
   * @param args 参数
   * @returns 获取国际化翻译值
   */
  static message(code: string, args?: Record<string, any>): string {
   
        
    let message = MessageUtils.messages[code] || code;

    if (args) {
      Object.entries(args).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{${key}}`, 'g'), value);
      });
    }
    
    return message;
  }
}