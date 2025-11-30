import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RegistroService } from './registro.service';
import { IniciarSesionDto } from './registro.dto';

@Controller('registro')
export class RegistroController {
  constructor(private readonly registroService: RegistroService) {}


  @Post('entrada')
  iniciarSesionConQR(@Body() dto: IniciarSesionDto) {
    return this.registroService.iniciarSesionConToken(dto.token);
  }

  @Post('salida')
  finalizarSesionConQR(@Body() dto: IniciarSesionDto) {
    return this.registroService.finalizarSesionConToken(dto.token);
  }


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

  @Get('resumen/:idusuario')
  obtenerResumenSemanal(@Param('idusuario') idusuario: string) {
    return this.registroService.obtenerResumenSemanal(idusuario);
  }
}