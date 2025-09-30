export interface ProcessInfo {
  pm_id: number;
  name: string;
  status: string;
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
  log_path: {
    out: string;
    error: string;
  };
  port?: number | null;
  pid?: number;
  createdAt?: number;
  version?: string;
  node_version?: string;
  exec_mode?: string;
  instances?: number;
  exec_path?: string;
}

export interface ProcessMetrics {
  totalProcesses: number;
  runningProcesses: number;
  stoppedProcesses: number;
  erroringProcesses: number;
  totalCpu: number;
  totalMemory: number;
  processes: ProcessMetric[];
}

export interface ProcessMetric {
  name: string;
  status: string;
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
  port?: number | null;
  pid?: number;
}