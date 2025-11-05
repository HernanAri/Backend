import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsuarioModule } from './usuario/usuario.module';
import { AutenticadorModule } from './autenticador/autenticador.module';
import { RegistroModule } from './registro/registro.module';
import { QrcodeModule } from './creador-qr/creador-qr.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigModule esté disponible globalmente
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://proyecto_final:proyectofinal2@bd.qssnf.mongodb.net/'),
    UsuarioModule,
    AutenticadorModule,
    QrcodeModule,
    RegistroModule,
  ],
})
export class AppModule {}