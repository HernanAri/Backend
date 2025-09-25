import { Controller, Post, Param, Get } from '@nestjs/common';
import { RegistroService } from './registro.service';

@Controller('registro')
export class RegistroController {
  constructor(private readonly registroService: RegistroService) {}

  @Post('entrada/:idusuario')
  iniciarSesion(@Param('idusuario') idusuario: string) {
    return this.registroService.iniciarSesion(idusuario);
  }

  @Post('salida/:idusuario')
  finalizarSesion(@Param('idusuario') idusuario: string) {
    return this.registroService.finalizarSesion(idusuario);
  }

  @Get('sesiones/:idusuario')
  obtenerSesiones(@Param('idusuario') idusuario: string) {
    return this.registroService.obtenerSesiones(idusuario);
  }
}
