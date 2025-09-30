import { Injectable, Logger } from '@nestjs/common';
import pm2 from 'pm2';
import { ProcessInfo } from '../common/interfaces/process.interface';

@Injectable()
export class Pm2Service {
  private readonly logger = new Logger(Pm2Service.name);

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          this.logger.error('Failed to connect to PM2:', err);
          reject(err);
        } else {
          this.logger.log('Successfully connected to PM2');
          resolve();
        }
      });
    });
  }

  disconnect(): void {
    pm2.disconnect();
    this.logger.log('Disconnected from PM2');
  }

  async getProcessList(): Promise<ProcessInfo[]> {
    await this.connect();

    return new Promise((resolve, reject) => {
      pm2.list((err, list) => {
        this.disconnect();

        if (err) {
          this.logger.error('Failed to get process list:', err);
          reject(err);
          return;
        }

        const processes: ProcessInfo[] = list.map((proc: any) => {
          // Extract port from environment variables or args
          let port: number | null = null;
          if (proc.pm2_env?.env?.PORT) {
            port = parseInt(proc.pm2_env.env.PORT);
          } else if (proc.pm2_env?.args) {
            // Try to extract port from args (e.g., --port 3000)
            const args = Array.isArray(proc.pm2_env.args) ? proc.pm2_env.args : [];
            const portIndex = args.indexOf('--port');
            if (portIndex !== -1 && portIndex < args.length - 1) {
              port = parseInt(args[portIndex + 1]);
            }
          }

          return {
            pm_id: proc.pm_id,
            name: proc.name || 'unknown',
            status: proc.pm2_env?.status || 'unknown',
            cpu: proc.monit?.cpu || 0,
            memory: proc.monit?.memory || 0,
            uptime: proc.pm2_env?.pm_uptime || 0,
            restarts: proc.pm2_env?.restart_time || 0,
            log_path: {
              out: proc.pm2_env?.pm_out_log_path || '',
              error: proc.pm2_env?.pm_err_log_path || '',
            },
            port,
            pid: proc.pid || null,
            createdAt: proc.pm2_env?.created_at || null,
            version: proc.pm2_env?.version || null,
            node_version: proc.pm2_env?.node_version || null,
            exec_mode: proc.pm2_env?.exec_mode || null,
            instances: proc.pm2_env?.instances || 1,
            exec_path: proc.pm2_env?.pm_exec_path || null,
          };
        });

        resolve(processes);
      });
    });
  }

  async getProcessDetails(processName: string): Promise<any> {
    await this.connect();

    return new Promise((resolve, reject) => {
      pm2.describe(processName, (err, processDescription) => {
        this.disconnect();

        if (err) {
          this.logger.error(`Failed to get process details for ${processName}:`, err);
          reject(err);
          return;
        }

        if (!processDescription || processDescription.length === 0) {
          reject(new Error(`Process ${processName} not found`));
          return;
        }

        resolve(processDescription[0]);
      });
    });
  }

  async restartProcess(processName: string): Promise<void> {
    await this.connect();

    return new Promise((resolve, reject) => {
      pm2.restart(processName, (err) => {
        this.disconnect();

        if (err) {
          this.logger.error(`Failed to restart process ${processName}:`, err);
          reject(err);
        } else {
          this.logger.log(`Process ${processName} restarted successfully`);
          resolve();
        }
      });
    });
  }

  async stopProcess(processName: string): Promise<void> {
    await this.connect();

    return new Promise((resolve, reject) => {
      pm2.stop(processName, (err) => {
        this.disconnect();

        if (err) {
          this.logger.error(`Failed to stop process ${processName}:`, err);
          reject(err);
        } else {
          this.logger.log(`Process ${processName} stopped successfully`);
          resolve();
        }
      });
    });
  }

  async startProcess(processName: string): Promise<void> {
    await this.connect();

    return new Promise((resolve, reject) => {
      pm2.start(processName, (err) => {
        this.disconnect();

        if (err) {
          this.logger.error(`Failed to start process ${processName}:`, err);
          reject(err);
        } else {
          this.logger.log(`Process ${processName} started successfully`);
          resolve();
        }
      });
    });
  }
}