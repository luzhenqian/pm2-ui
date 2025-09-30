import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LogService } from './log.service';
import { Pm2Service } from '../process/pm2.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [LogService, Pm2Service],
  exports: [LogService],
})
export class LogsModule {}