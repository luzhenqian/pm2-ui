import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  const port = process.env.PORT || 3030;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  console.log(`PM2 UI server running at http://${host}:${port}`);
}
bootstrap();