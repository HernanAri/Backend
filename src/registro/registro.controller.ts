import { Controller, Post, Get, Param, Body, ParseIntPipe } from '@nestjs/common';
import { RegistroService } from './registro.service';
import { IniciarSesionDto } from './registro.dto';

@Controller('registro')
export class RegistroController {
    constructor(private readonly registroService: RegistroService) {}

    /**
     * Inicia sesión con token QR
     * POST /registro/entrada
     * Body: { token: string }
     */
    @Post('entrada')
    iniciarSesionConQR(@Body() dto: IniciarSesionDto) {
        return this.registroService.iniciarSesionConToken(dto.token);
    }

    /**
     * Finaliza sesión con token QR
     * POST /registro/salida
     * Body: { token: string }
     */
    @Post('salida')
    finalizarSesionConQR(@Body() dto: IniciarSesionDto) {
        return this.registroService.finalizarSesionConToken(dto.token);
    }

    /**
     * Inicia sesión por ID de usuario
     * POST /registro/entrada/:idusuario
     */
    @Post('entrada/:idusuario')
    async iniciarSesion(@Param('idusuario', ParseIntPipe) idusuario: number) {
        const sesiones = await this.registroService.obtenerSesiones(idusuario.toString());
        const sesionActiva = sesiones.find(s => s.estado === 'activa');
        
        if (sesionActiva) {
            return {
                message: 'Ya tienes una sesión activa',
                sesion: sesionActiva,
                duplicado: true
            };
        }
        
        const resultado = await this.registroService.iniciarSesion(idusuario.toString());
        return {
            message: 'Sesión iniciada correctamente',
            sesion: resultado,
            duplicado: false
        };
    }

    /**
     * Finaliza sesión por ID de usuario
     * POST /registro/salida/:idusuario
     */
    @Post('salida/:idusuario')
    finalizarSesion(@Param('idusuario', ParseIntPipe) idusuario: number) {
        return this.registroService.finalizarSesion(idusuario.toString());
    }

    /**
     * Obtiene todas las sesiones de un usuario
     * GET /registro/usuario/:idusuario
     */
    @Get('usuario/:idusuario')
    async obtenerSesionesUsuario(@Param('idusuario', ParseIntPipe) idusuario: number) {
        return this.registroService.obtenerSesiones(idusuario.toString());
    }

    /**
     * Obtiene sesiones de un usuario (alias)
     * GET /registro/sesiones/:idusuario
     */
    @Get('sesiones/:idusuario')
    obtenerSesiones(@Param('idusuario', ParseIntPipe) idusuario: number) {
        return this.registroService.obtenerSesiones(idusuario.toString());
    }

    /**
     * Obtiene resumen semanal de un usuario
     * GET /registro/resumen/:idusuario
     */
    @Get('resumen/:idusuario')
    obtenerResumenSemanal(@Param('idusuario', ParseIntPipe) idusuario: number) {
        return this.registroService.obtenerResumenSemanal(idusuario.toString());
    }
}