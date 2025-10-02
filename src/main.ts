import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { METHODS } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin:'http://localhost:5173',
    methods:['GET','HEAD','PUT','PATCH','POST','DELETE'],
    allowesHeaders: ['Content-Type', 'Authorization'],
    Credential: true,
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
