import { Constants } from '../constant/constants';
import { Injectable } from '@nestjs/common';
import { GenConstants } from '../constant/GenConstants';

@Injectable()
export class StringUtils {
    /**
     * 首字母大写
     */
    capitalize(str: string): string {
        if (!str || str.length === 0) {
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static capitalize(str: string): string {
        if (!str || str.length === 0) {
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * 是否为http(s)://开头
     * 
     * @param link 链接
     * @return 结果
     */
    isHttp(link: string): boolean {
        return link.startsWith(Constants.HTTP) || link.startsWith(Constants.HTTPS);
    }

    static isHttp(link: string): boolean {
        return link.startsWith(Constants.HTTP) || link.startsWith(Constants.HTTPS);
    }

    /**
     * 批量替换字符串
     * @param text 原始字符串
     * @param searchList 要查找的字符串数组
     * @param replacementList 替换值数组
     */
    replaceEach(text: string, searchList: string[], replacementList: string[]): string {
        if (!text || !searchList?.length || !replacementList?.length) {
            return text;
        }

        // 使用 reduce 依次执行替换
        return searchList.reduce((result, search, index) => {
            return result.replace(new RegExp(search, 'g'), replacementList[index] || '');
        }, text);
    }

    static replaceEach(text: string, searchList: string[], replacementList: string[]): string {
        if (!text || !searchList?.length || !replacementList?.length) {
            return text;
        }

        // 使用 reduce 依次执行替换
        return searchList.reduce((result, search, index) => {
            return result.replace(new RegExp(search, 'g'), replacementList[index] || '');
        }, text);
    }

    // 或者更简单的方式，使用对象映射
    replaceMultiple(text: string, replacements: Record<string, string>): string {
        return Object.entries(replacements).reduce(
            (result, [search, replace]) => result.replace(new RegExp(search, 'g'), replace),
            text
        );
    }

    static replaceMultiple(text: string, replacements: Record<string, string>): string {
        return Object.entries(replacements).reduce(
            (result, [search, replace]) => result.replace(new RegExp(search, 'g'), replace),
            text
        );
    }

    /**
     * 判断一个字符串是否为空串
     * 
     * @param str 字符串
     * @return true：为空 false：非空
     */
    isEmpty(str: any): boolean {
        if (Object.prototype.toString.call(str) === '[object String]') {
            return str.trim() === ''
        }
        return !str
    }

    static isEmpty(str: any): boolean {
        if (Object.prototype.toString.call(str) === '[object String]') {
            return str.trim() === ''
        }
        return !str
    }

    isNull(o: any): boolean {
        return o === null || o === undefined;
    }

    static isNull(o: any): boolean {
        return o === null || o === undefined;
    }

    /**
     * 判断一个字符串是否为非空串
     * 
     * @param str 字符串
     * @return true：非空串 false：空串
     */
    isNotEmpty(str: string): boolean {
        return !this.isEmpty(str);
    }

    static isNotEmpty(str: string): boolean {
        return !StringUtils.isEmpty(str);
    }

    /**
     * 判断一个对象数组是否非空
     * 
     * @param objects 要判断的对象数组
     * @return true：非空 false：空
     */
    isArrayNotEmpty(objects: any[]): boolean {
        return !this.isEmpty(objects);
    }

    static isArrayNotEmpty(objects: any[]): boolean {
        return !StringUtils.isEmpty(objects);
    }

    /**
     * 判断一个对象是否非空
     * 
     * @param object Object
     * @return true：非空 false：空
     */
    isNotNull(object: any): boolean {
        return !this.isNull(object);
    }

    static isNotNull(object: any): boolean {
        return !StringUtils.isNull(object);
    }

    /**
     * 判断给定的字符串中是否包含给定的任意一个子字符串
     *
     * @param str 给定的字符串
     * @param substrings 给定的子字符串数组
     * @return boolean 结果
     */
    containsAny(str: string, ...substrings: string[]): boolean {
        if (this.isEmpty(str) || this.isEmpty(substrings)) {
            return false;
        } else {
            for (const substring of substrings) {
                if (str.includes(substring)) {
                    return true;
                }
            }
            return false;
        }
    }

    static containsAny(str: string, ...substrings: string[]): boolean {
        if (StringUtils.isEmpty(str) || StringUtils.isEmpty(substrings)) {
            return false;
        } else {
            for (const substring of substrings) {
                if (str.includes(substring)) {
                    return true;
                }
            }
            return false;
        }
    }

    /**
   * 获取两个字符串之间的内容
   * @param str 原字符串
   * @param start 开始字符串
   * @param end 结束字符串
   * @returns 两个字符串之间的内容，如果未找到则返回空字符串
   */
    substringBetween(str: string, start: string, end: string): string {
        return StringUtils.substringBetween(str, start, end);

    }

    static substringBetween(str: string, start: string, end: string): string {
        // 方法1：使用indexOf
        const startIndex = str.indexOf(start);
        if (startIndex === -1) return '';

        const subStr = str.substring(startIndex + start.length);
        const endIndex = subStr.indexOf(end);
        if (endIndex === -1) return '';

        return subStr.substring(0, endIndex);
    }


    static toCamelCase(str: string): string {
        return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    }

      /**
     * 获取分隔符之前的子字符串
     * @param str 原字符串
     * @param separator 分隔符
     */
      static substringBefore(str: string, separator: string): string {
        if (!str || !separator) return str;
        if (separator === '') return '';
        
        const pos = str.indexOf(separator);
        return pos === -1 ? str : str.substring(0, pos);
    }

    /**
     * 将字符串的首字母转换为小写
     * @param str 原字符串
     * @returns 首字母小写的字符串
     */
    static uncapitalize(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    uncapitalize(str: string): string {
        return StringUtils.uncapitalize(str);
    }
}
