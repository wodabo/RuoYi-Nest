import { Cpu } from "./server/cpu";
import { Mem } from "./server/mem";
import { V8 } from "./server/v8";
import { Sys } from "./server/sys";
import { SysFile } from "./server/sys-file";
import * as si from 'systeminformation';
import * as dayjs from 'dayjs';


export class Server {
    private static OSHI_WAIT_SECOND = 1000;

    private cpu: Cpu;
    private mem: Mem;
    private v8: V8;
    private jvm: V8;
    private sys: Sys;
    private sysFiles: SysFile[];

    constructor() {
        this.cpu = new Cpu();
        this.mem = new Mem();
        this.v8 = new V8();
        this.sys = new Sys();
        this.sysFiles = [];
    }

    getCpu(): Cpu {
        return this.cpu;
    }

    setCpu(cpu: Cpu): void {
        this.cpu = cpu;
    }

    getMem(): Mem {
        return this.mem;
    }

    setMem(mem: Mem): void {
        this.mem = mem;
    }

    getV8(): V8 {
        return this.v8;
    }

    setV8(v8: V8): void {
        this.v8 = v8;
    }

    getSys(): Sys {
        return this.sys;
    }

    setSys(sys: Sys): void {
        this.sys = sys;
    }

    getSysFiles(): SysFile[] {
        return this.sysFiles;
    }

    async copyTo(): Promise<void> {
        const systemInfo = await si.system(); // Changed to use 'systeminformation' module

        const processor = await si.cpu();
        await this.setCpuInfo(processor);

        const memory = await si.mem();
        await this.setMemInfo(memory);

        await this.setSysInfo();

        await this.setV8Info();

        await this.setSysFiles();
    }

    private async setCpuInfo(processor): Promise<void> {
        const load = await si.currentLoad();
        // CPU信息
        const prevTicks = processor.speed;
        await new Promise(resolve => setTimeout(resolve, Server.OSHI_WAIT_SECOND));
        const ticks = processor.speed;
        const nice = ticks - prevTicks;
        const irq = 0; // Assuming IRQ is not directly available from 'systeminformation' module
        const softirq = 0; // Assuming softirq is not directly available from 'systeminformation' module
        const steal = 0; // Assuming steal is not directly available from 'systeminformation' module
        const cSys = load.currentLoadSystem; // Assuming system CPU usage is not directly available from 'systeminformation' module
        const user = load.currentLoadUser; // Assuming user CPU usage is the total CPU usage
        const iowait = 0; // Assuming iowait is not directly available from 'systeminformation' module
        const idle = load.currentLoadIdle; // Assuming idle is not directly available from 'systeminformation' module
        const totalCpu = user + nice + cSys + idle + iowait + irq + softirq + steal;
        this.cpu.setCpuNum(processor.cores);
        this.cpu.setTotal(totalCpu);
        this.cpu.setSys(Number((cSys / totalCpu * 100).toFixed(1)));
        this.cpu.setUsed(Number((user / totalCpu * 100).toFixed(1)));
        this.cpu.setWait(iowait);
        this.cpu.setFree(Number((idle / totalCpu * 100).toFixed(1)));
    }

    private setMemInfo(memory): void {
        this.mem.setTotal(Number((memory.total / 1024 / 1024 / 1024).toFixed(2)));
        this.mem.setUsed(Number((memory.used / 1024 / 1024 / 1024).toFixed(2)));
        this.mem.setFree(Number((memory.free / 1024 / 1024 / 1024).toFixed(2)));
        this.mem.setUsage(Number(((memory.used / memory.total) * 100).toFixed(2)));
    }

    private async setSysInfo(): Promise<void> {
        const os = await si.osInfo() // Changed to use 'systeminformation' module
        // 获取网络信息
        const networkInterfaces = await si.networkInterfaces();

        if (networkInterfaces instanceof Array) {

            // 获取第一个非内部IPv4地址
            const mainInterface = networkInterfaces.find(net =>
                net.ip4 &&
                net.ip4 !== '127.0.0.1' &&
                net.ip4 !== ''
            );
            this.sys.setComputerIp(mainInterface?.ip4 || 'localhost');

        }

        this.sys.setComputerName(os.hostname);
        this.sys.setOsName(os.platform);
        this.sys.setOsArch(os.arch);
        this.sys.setUserDir(process.cwd());
    }

    private async setV8Info(): Promise<void> {
        const memory = process.memoryUsage();
        // 设置总内存 (堆内存总量) - 以M为单位
        this.v8.setTotal(Number((memory.heapTotal / 1024 / 1024).toFixed(2)));

        // 设置名称
        this.v8.setName('Node.js')

        // 设置nodejs版本
        this.v8.setVersion(process.versions.node)

        // 设置nodejs启动时间
        this.v8.setStartTime(dayjs(Date.now() - process.uptime() * 1000).format('YYYY-MM-DD HH:mm:ss'));

        // 设置nodejs 运行时间
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const parts = [];
        if (days > 0) parts.push(`${days}天`);
        if (hours > 0) parts.push(`${hours}小时`);
        if (minutes > 0) parts.push(`${minutes}分`);
        if (seconds > 0) parts.push(`${seconds}秒`);
        this.v8.setRunTime(parts.join(' '));

        // 设置最大可用内存 (常驻内存集) - 以M为单位
        this.v8.setMax(Number((memory.rss / 1024 / 1024).toFixed(2)));

        // 设置已使用内存
        this.v8.setUsed(Number((memory.heapUsed / 1024 / 1024).toFixed(2)));

        // 设置空闲内存 (总内存 - 已用内存) - 以M为单位
        this.v8.setFree(Number(((memory.heapTotal - memory.heapUsed) / 1024 / 1024).toFixed(2)));

        // 设置使用率
        this.v8.setUsage(Number(((memory.heapUsed / memory.heapTotal) * 100).toFixed(2)));

        // 设置nodejs运行参数
        this.v8.setInputArgs(process.argv.slice(2).toString());

        // 设置Node.js路径
        this.v8.setHome(process.execPath);


        this.jvm = this.v8; // 适配
    }

    private async setSysFiles(): Promise<void> {
        const data = await si.fsSize();
        for (const disk of data) {
            const sysFile = new SysFile();
            sysFile.setDirName(disk.fs);
            sysFile.setSysTypeName(disk.type);
            sysFile.setTypeName(disk.mount);
            sysFile.setTotal(this.convertFileSize(disk.size));
            sysFile.setFree(this.convertFileSize(disk.available));
            sysFile.setUsed(this.convertFileSize(disk.used));
            sysFile.setUsage(Number((disk.used / disk.size * 100).toFixed(2)));
            this.sysFiles.push(sysFile);
        }
    }

    private convertFileSize(size: number): string {
        const kb = 1024;
        const mb = kb * 1024;
        const gb = mb * 1024;
        if (size >= gb) {
            return `${(size / gb).toFixed(1)} GB`;
        } else if (size >= mb) {
            const f = size / mb;
            return `${f > 100 ? Math.floor(f) : f.toFixed(1)} MB`;
        } else if (size >= kb) {
            const f = size / kb;
            return `${f > 100 ? Math.floor(f) : f.toFixed(1)} KB`;
        } else {
            return `${size} B`;
        }
    }
}
