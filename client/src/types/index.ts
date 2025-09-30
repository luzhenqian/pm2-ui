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

export interface LogEntry {
  processName: string;
  logType: 'out' | 'error';
  message: string;
  timestamp: string;
  id?: string;
}

export interface Metrics {
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

export type LogType = 'out' | 'error';

export interface SearchResult {
  processName: string;
  pattern: string;
  results: string[];
  count: number;
}