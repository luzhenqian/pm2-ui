import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChildProcess, exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as readline from 'readline';

@Injectable()
export class LogService {
  private readonly logger = new Logger(LogService.name);
  private tailProcesses: Map<string, ChildProcess> = new Map();

  constructor(private eventEmitter: EventEmitter2) {}

  async getRecentLogs(logPath: string, lines: number = 100): Promise<string[]> {
    return new Promise((resolve, reject) => {
      exec(
        `tail -n ${lines} "${logPath}"`,
        { maxBuffer: 10 * 1024 * 1024 },
        (err, stdout) => {
          if (err) {
            this.logger.error(`Failed to read recent logs from ${logPath}:`, err);
            reject(err);
          } else {
            resolve(stdout.split('\n').filter((line) => line.trim()));
          }
        },
      );
    });
  }

  startTailing(
    processName: string,
    logPath: string,
    logType: 'out' | 'error',
    socketId: string,
  ): void {
    this.stopTailing(processName);

    const tailProcess = spawn('tail', ['-f', logPath]);
    this.tailProcesses.set(`${processName}-${socketId}`, tailProcess);

    tailProcess.stdout.on('data', (data) => {
      const lines = data
        .toString()
        .split('\n')
        .filter((line: string) => line.trim());

      lines.forEach((line: string) => {
        this.eventEmitter.emit('log.new', {
          processName,
          logType,
          message: line,
          timestamp: new Date().toISOString(),
          socketId,
        });
      });
    });

    tailProcess.stderr.on('data', (data) => {
      this.logger.error(`Tail process error for ${processName}:`, data.toString());
      this.eventEmitter.emit('log.error', {
        processName,
        message: data.toString(),
        socketId,
      });
    });

    tailProcess.on('close', (code) => {
      this.logger.log(`Tail process for ${processName} closed with code ${code}`);
      this.tailProcesses.delete(`${processName}-${socketId}`);
    });
  }

  stopTailing(processName: string, socketId?: string): void {
    const key = socketId ? `${processName}-${socketId}` : processName;
    const process = this.tailProcesses.get(key);

    if (process) {
      process.kill();
      this.tailProcesses.delete(key);
      this.logger.log(`Stopped tailing logs for ${processName}`);
    }
  }

  stopAllTailing(socketId?: string): void {
    if (socketId) {
      this.tailProcesses.forEach((process, key) => {
        if (key.endsWith(`-${socketId}`)) {
          process.kill();
          this.tailProcesses.delete(key);
        }
      });
    } else {
      this.tailProcesses.forEach((process, name) => {
        process.kill();
        this.logger.log(`Stopped tailing logs for ${name}`);
      });
      this.tailProcesses.clear();
    }
  }

  async searchInLogs(
    logPath: string,
    pattern: string,
    maxResults: number = 100,
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const results: string[] = [];
      const stream = fs.createReadStream(logPath);
      const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
      });

      rl.on('line', (line) => {
        if (line.includes(pattern) && results.length < maxResults) {
          results.push(line);
        }
      });

      rl.on('close', () => {
        resolve(results);
      });

      rl.on('error', (err) => {
        this.logger.error(`Failed to search in logs ${logPath}:`, err);
        reject(err);
      });
    });
  }

  async getLogFileStats(logPath: string): Promise<fs.Stats | null> {
    try {
      return await fs.promises.stat(logPath);
    } catch (err) {
      this.logger.error(`Failed to get log file stats for ${logPath}:`, err);
      return null;
    }
  }
}