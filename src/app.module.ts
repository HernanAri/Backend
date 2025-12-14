import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsuarioModule } from './usuario/usuario.module';
import { AutenticadorModule } from './autenticador/autenticador.module';
import { RegistroModule } from './registro/registro.module';
import { QrcodeModule } from './creador-qr/creador-qr.module';
import { PasswordMigrationService } from './password-migration.service';
import { Usuario, UsuarioSchema } from './usuario/usuario.schema';
import { VehiculoModule } from './Vehiculos/vehiculo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 
      'mongodb+srv://proyecto_final:prueba@bd.qssnf.mongodb.net'
    ),
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema }
    ]),
    UsuarioModule,
    AutenticadorModule,
    QrcodeModule,
    RegistroModule,
    VehiculoModule
  ],
  providers: [PasswordMigrationService],
})
export class AppModule {}