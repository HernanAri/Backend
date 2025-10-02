import { Module } from '@nestjs/common';
import { AutenticadorService } from './autenticador.service';
import { AutenticadorController } from './autenticador.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioSchema } from 'src/usuario/usuario.schema';
import { jwtConstants } from './constants';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports: [
    UsuarioModule,
    MongooseModule.forFeature([{'name': 'User', schema: UsuarioSchema}]),  JwtModule.register({
    global: true,
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '60s' },

  })],
  providers: [AutenticadorService],
  controllers: [AutenticadorController] 
})
export class AutenticadorModule {}
