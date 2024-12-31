/**
 * 演示模式异常
 * 
 * @author ruoyi
 */
export class DemoModeException extends Error {
    constructor() {
        super();
        this.name = 'DemoModeException';
    }
}