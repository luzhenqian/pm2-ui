export interface LogEntry {
  processName: string;
  logType: 'out' | 'error';
  message: string;
  timestamp: string;
}

export interface SubscribeLogsDto {
  processName: string;
  logType?: 'out' | 'error';
}

export interface SearchLogsDto {
  processName: string;
  pattern: string;
  logType?: 'out' | 'error';
}

export interface SearchResult {
  processName: string;
  pattern: string;
  results: string[];
  count: number;
}