/**
 * CPU相关信息
 * 
 * @author ruoyi
 */
export class Cpu
{
    /**
     * 核心数
     */
    private cpuNum: number;

    /**
     * CPU总的使用率
     */
    private total: number;

    /**
     * CPU系统使用率
     */
    private sys: number;

    /**
     * CPU用户使用率
     */
    private used: number;

    /**
     * CPU当前等待率
     */
    private wait: number;

    /**
     * CPU当前空闲率
     */
    private free: number;

    public getCpuNum(): number
    {
        return this.cpuNum;
    }

    public setCpuNum(cpuNum: number)
    {
        this.cpuNum = cpuNum;
    }

    public getTotal(): number
    {
        return Math.round((this.total * 100) * 100) / 100;
    }

    public setTotal(total: number)
    {
        this.total = total;
    }

    public getSys(): number
    {
        return Math.round((this.sys / this.total * 100) * 100) / 100;
    }

    public setSys(sys: number)
    {
        this.sys = sys;
    }

    public getUsed(): number
    {
        return Math.round((this.used / this.total * 100) * 100) / 100;
    }

    public setUsed(used: number)
    {
        this.used = used;
    }

    public getWait(): number
    {
        return Math.round((this.wait / this.total * 100) * 100) / 100;
    }

    public setWait(wait: number)
    {
        this.wait = wait;
    }

    public getFree(): number
    {
        return Math.round((this.free / this.total * 100) * 100) / 100;
    }

    public setFree(free: number)
    {
        this.free = free;
    }
}
