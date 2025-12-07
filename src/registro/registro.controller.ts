import { Controller, Post, Get, Param, Body, ParseIntPipe } from '@nestjs/common';
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
    iniciarSesion(@Param('idusuario', ParseIntPipe) idusuario: number) {
        return this.registroService.iniciarSesion(idusuario.toString());
    }

    @Post('salida/:idusuario')
    finalizarSesion(@Param('idusuario', ParseIntPipe) idusuario: number) {
        return this.registroService.finalizarSesion(idusuario.toString());
    }



    @Get('sesiones/:idusuario')
    obtenerSesiones(@Param('idusuario', ParseIntPipe) idusuario: number) {
        return this.registroService.obtenerSesiones(idusuario.toString());
    }

    @Get('resumen/:idusuario')
    obtenerResumenSemanal(@Param('idusuario', ParseIntPipe) idusuario: number) {
        return this.registroService.obtenerResumenSemanal(idusuario.toString());
    }
}
