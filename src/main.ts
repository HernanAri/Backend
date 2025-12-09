// Ubicación: back/Backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS Configuration for Production
  const allowedOrigins = [
    'http://localhost',
    'http://localhost:5173',
    'http://localhost:80',
    process.env.FRONTEND_URL, // Desde .env
  ].filter(Boolean); // Elimina valores undefined

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como Postman, apps móviles, etc.)
      if (!origin) return callback(null, true);
      
      // Verificar si el origin está en la lista permitida
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS bloqueado para origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`========================================`);
  console.log(`🚀 CLOKIFY Backend`);
  console.log(`========================================`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server running on: http://localhost:${port}`);
  console.log(`Allowed CORS origins:`);
  allowedOrigins.forEach(origin => console.log(`  - ${origin}`));
  console.log(`========================================`);
}
bootstrap();