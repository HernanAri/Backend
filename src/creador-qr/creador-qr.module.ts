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
      secret: 'Pollo', // IMPORTANTE: Mismo secret en todo el proyecto
      signOptions: { 
        expiresIn: '365d' 
      },
    }),
  ],
  controllers: [QrcodeController],
  providers: [QrcodeService],
  exports: [QrcodeService],
})
export class QrcodeModule {}