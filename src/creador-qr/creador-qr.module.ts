import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { QrcodeController } from './creador-qr.controller';
import { QrcodeService } from './creador-qr.service';
import { Usuario, UsuarioSchema } from 'src/usuario/usuario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema }
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'tu-secret-key-super-seguro', 
    }),
  ],
  controllers: [QrcodeController],
  providers: [QrcodeService],
})
export class QrcodeModule {}