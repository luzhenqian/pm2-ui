import {
  Controller,
  Get,
  Post,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Pm2Service } from './pm2.service';
import { ProcessInfo } from '../common/interfaces/process.interface';

@Controller('api/processes')
export class ProcessController {
  constructor(private readonly pm2Service: Pm2Service) {}

  @Get()
  async getProcesses(): Promise<ProcessInfo[]> {
    try {
      return await this.pm2Service.getProcessList();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve process list',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':name')
  async getProcessDetails(@Param('name') name: string) {
    try {
      return await this.pm2Service.getProcessDetails(name);
    } catch (error) {
      throw new HttpException('Process not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post(':name/restart')
  async restartProcess(@Param('name') name: string) {
    try {
      await this.pm2Service.restartProcess(name);
      return {
        success: true,
        message: `Process ${name} restarted`,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to restart process',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':name/stop')
  async stopProcess(@Param('name') name: string) {
    try {
      await this.pm2Service.stopProcess(name);
      return {
        success: true,
        message: `Process ${name} stopped`,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to stop process',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':name/start')
  async startProcess(@Param('name') name: string) {
    try {
      await this.pm2Service.startProcess(name);
      return {
        success: true,
        message: `Process ${name} started`,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to start process',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}