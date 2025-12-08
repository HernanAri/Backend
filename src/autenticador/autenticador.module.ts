import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AutenticadorService } from './autenticador.service';
import { AutenticadorController } from './autenticador.controller';
import { Usuario, UsuarioSchema } from 'src/usuario/usuario.schema';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsuarioModule,
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema }
    ]),
    JwtModule.register({
      secret: 'Pollo',
      signOptions: { 
        expiresIn: '1h'
      },
    }),
  ],
  providers: [AutenticadorService, JwtStrategy],
  controllers: [AutenticadorController],
  exports: [AutenticadorService, JwtStrategy, PassportModule]
})
export class AutenticadorModule {}