import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioModule } from './usuario/usuario.module';
import { RegistroModule } from './registro/registro.module';
import { LoginModule } from './login/login.module';
import { CreadorQrModule } from './creador-qr/creador-qr.module';


@Module({
  imports: [
    UsuarioModule, 
    RegistroModule, 
    LoginModule, 
    CreadorQrModule,
    MongooseModule.forRoot('mongodb+srv://proyecto_final:proyectofinal2@bd.qssnf.mongodb.net/')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}