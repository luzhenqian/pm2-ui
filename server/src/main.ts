import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from './config/config.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: config.server.cors.origins,
    methods: config.server.cors.methods,
  });

  const port = process.env.PORT || config.server.port;
  const host = process.env.HOST || config.server.host;

  await app.listen(port, host);
  console.log(`PM2 UI server running at http://${host}:${port}`);
}
bootstrap();