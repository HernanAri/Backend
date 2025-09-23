import { Module } from '@nestjs/common';
import { QrcodeController } from './creador-qr.controller';
import { QrcodeService } from './creador-qr.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario, UsuarioSchema } from 'src/usuario/usuario.schema';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    UsuarioModule
  ],
  controllers: [QrcodeController],
  providers: [QrcodeService],
  exports:[QrcodeService]
})
export class CreadorQrModule {}
