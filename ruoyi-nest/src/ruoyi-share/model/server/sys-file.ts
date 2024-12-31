/**
 * 系统文件相关信息
 * 
 * @author ruoyi
 */
export class SysFile
{
    /**
     * 盘符路径
     */
    private dirName: string;

    /**
     * 盘符类型
     */
    private sysTypeName: string;

    /**
     * 文件类型
     */
    private typeName: string;

    /**
     * 总大小
     */
    private total: string;

    /**
     * 剩余大小
     */
    private free: string;

    /**
     * 已经使用量
     */
    private used: string;

    /**
     * 资源的使用率
     */
    private usage: number;

    public getDirName(): string
    {
        return this.dirName;
    }

    public setDirName(dirName: string)
    {
        this.dirName = dirName;
    }

    public getSysTypeName(): string
    {
        return this.sysTypeName;
    }

    public setSysTypeName(sysTypeName: string)
    {
        this.sysTypeName = sysTypeName;
    }

    public getTypeName(): string
    {
        return this.typeName;
    }

    public setTypeName(typeName: string)
    {
        this.typeName = typeName;
    }

    public getTotal(): string
    {
        return this.total;
    }

    public setTotal(total: string)
    {
        this.total = total;
    }

    public getFree(): string
    {
        return this.free;
    }

    public setFree(free: string)
    {
        this.free = free;
    }

    public getUsed(): string
    {
        return this.used;
    }

    public setUsed(used: string)
    {
        this.used = used;
    }

    public getUsage(): number
    {
        return this.usage;
    }

    public setUsage(usage: number)
    {
        this.usage = usage;
    }
}
