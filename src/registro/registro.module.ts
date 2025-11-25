import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { RegistroController } from './registro.controller';
import { RegistroService } from './registro.service';
import { SesionLaboral, SesionLaboralSchema } from './registro.schema';
import { Usuario, UsuarioSchema } from 'src/usuario/usuario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SesionLaboral.name, schema: SesionLaboralSchema },
      { name: Usuario.name, schema: UsuarioSchema }
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'tu-secret-key-super-seguro',
      signOptions: { expiresIn: '5m' },
    }),
  ],
  controllers: [RegistroController],
  providers: [RegistroService],
  exports: [RegistroService]
})
export class RegistroModule {}