import { Module } from '@nestjs/common';
import { ProcessController } from './process.controller';
import { Pm2Service } from './pm2.service';

@Module({
  controllers: [ProcessController],
  providers: [Pm2Service],
  exports: [Pm2Service],
})
export class ProcessModule {}