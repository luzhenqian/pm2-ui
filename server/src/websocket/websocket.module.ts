import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { LogService } from '../logs/log.service';
import { Pm2Service } from '../process/pm2.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [WebSocketGateway, LogService, Pm2Service],
})
export class WebSocketModule {}