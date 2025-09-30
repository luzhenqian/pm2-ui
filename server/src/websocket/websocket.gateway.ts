import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { LogService } from '../logs/log.service';
import { Pm2Service } from '../process/pm2.service';
import {
  SubscribeLogsDto,
  SearchLogsDto,
} from '../common/interfaces/log.interface';
import {
  ProcessInfo,
  ProcessMetrics,
} from '../common/interfaces/process.interface';

@WSGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(
    private readonly logService: LogService,
    private readonly pm2Service: Pm2Service,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.logService.stopAllTailing(client.id);
  }

  @SubscribeMessage('subscribe-logs')
  async handleSubscribeLogs(
    @MessageBody() data: SubscribeLogsDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { processName, logType = 'out' } = data;

    try {
      const processDetails = await this.pm2Service.getProcessDetails(
        processName,
      );

      if (!processDetails) {
        client.emit('error', { message: `Process ${processName} not found` });
        return;
      }

      const logPath =
        logType === 'error'
          ? processDetails.pm2_env.pm_err_log_path
          : processDetails.pm2_env.pm_out_log_path;

      if (!logPath) {
        client.emit('error', {
          message: 'Log path not found for process',
        });
        return;
      }

      const recentLogs = await this.logService.getRecentLogs(
        logPath,
        parseInt(process.env.INITIAL_LOG_LINES || '100', 10),
      );
      client.emit('initial-logs', recentLogs);

      this.logService.startTailing(processName, logPath, logType, client.id);

      client.emit('subscription-success', {
        processName,
        logType,
        message: `Successfully subscribed to ${processName} ${logType} logs`,
      });
    } catch (error) {
      this.logger.error('Failed to subscribe to logs:', error);
      client.emit('error', {
        message: `Failed to subscribe to logs: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    }
  }

  @SubscribeMessage('unsubscribe-logs')
  handleUnsubscribeLogs(@ConnectedSocket() client: Socket) {
    this.logService.stopAllTailing(client.id);
    client.emit('unsubscribed', {
      message: 'Successfully unsubscribed from logs',
    });
  }

  @SubscribeMessage('search-logs')
  async handleSearchLogs(
    @MessageBody() data: SearchLogsDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { processName, pattern, logType = 'out' } = data;

    try {
      const processDetails = await this.pm2Service.getProcessDetails(
        processName,
      );

      const logPath =
        logType === 'error'
          ? processDetails.pm2_env.pm_err_log_path
          : processDetails.pm2_env.pm_out_log_path;

      const results = await this.logService.searchInLogs(logPath, pattern);

      client.emit('search-results', {
        processName,
        pattern,
        results,
        count: results.length,
      });
    } catch (error) {
      this.logger.error('Failed to search logs:', error);
      client.emit('error', {
        message: `Failed to search logs: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    }
  }

  @SubscribeMessage('get-metrics')
  async handleGetMetrics(@ConnectedSocket() client: Socket) {
    try {
      const processes = await this.pm2Service.getProcessList();

      const metrics: ProcessMetrics = {
        totalProcesses: processes.length,
        runningProcesses: processes.filter((p) => p.status === 'online')
          .length,
        stoppedProcesses: processes.filter((p) => p.status === 'stopped')
          .length,
        erroringProcesses: processes.filter((p) => p.status === 'errored')
          .length,
        totalCpu: processes.reduce((sum, p) => sum + p.cpu, 0),
        totalMemory: processes.reduce((sum, p) => sum + p.memory, 0),
        processes: processes.map((p) => ({
          name: p.name,
          status: p.status,
          cpu: p.cpu,
          memory: p.memory,
          uptime: p.uptime,
          restarts: p.restarts,
          port: p.port,
          pid: p.pid,
        })),
      };

      client.emit('metrics', metrics);
    } catch (error) {
      this.logger.error('Failed to get metrics:', error);
      client.emit('error', { message: 'Failed to retrieve metrics' });
    }
  }

  @OnEvent('log.new')
  handleNewLog(data: any) {
    const client = this.server.sockets.sockets.get(data.socketId);
    if (client) {
      client.emit('log', {
        processName: data.processName,
        logType: data.logType,
        message: data.message,
        timestamp: data.timestamp,
      });
    }
  }

  @OnEvent('log.error')
  handleLogError(data: any) {
    const client = this.server.sockets.sockets.get(data.socketId);
    if (client) {
      client.emit('error', {
        message: data.message,
      });
    }
  }
}