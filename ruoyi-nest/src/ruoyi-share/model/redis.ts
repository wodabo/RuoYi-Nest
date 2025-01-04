export class Redis {
  info: {
    redis_version: string; // Redis版本
    redis_mode: string; // 运行模式
    tcp_port: number; // 端口
    connected_clients: number; // 客户端数
    uptime_in_days: number; // 运行时间(天)
    used_memory_human: string; // 使用内存
    used_cpu_user_children: number; // 使用CPU
    maxmemory_human: string; // 内存配置
    aof_enabled: string; // AOF是否开启
    rdb_last_bgsave_status: string; // RDB是否成功
    instantaneous_input_kbps: number; // 网络入口
    instantaneous_output_kbps: number; // 网络出口
  };
  dbSize: number; // Key数量
  commandStats: string; // 命令统计
}
