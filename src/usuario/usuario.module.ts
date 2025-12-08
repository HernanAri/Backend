import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './usuario.schema';
import { QrcodeModule } from 'src/creador-qr/creador-qr.module';
import { QrcodeService } from 'src/creador-qr/creador-qr.service';

@Module({
  imports:[MongooseModule.forFeature([{name: Usuario.name, schema:UsuarioSchema}]),
  QrcodeModule
],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports:[UsuarioService]
})
export class UsuarioModule {}
