import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { VehiculoService } from './vehiculo.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CrearVehiculoDto, RegistrarSalidaDto } from './vehiculo.dto';

@Controller('vehiculos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiculoController {
    constructor(private readonly vehiculoService: VehiculoService) {}

    @Post('ingreso')
    @Roles('vigilante', 'admin')
    @HttpCode(HttpStatus.CREATED)
    async registrarIngreso(@Body() crearVehiculoDto: CrearVehiculoDto) {
        return this.vehiculoService.registrarIngreso(crearVehiculoDto);
    }

    @Post('salida')
    @Roles('vigilante', 'admin')
    @HttpCode(HttpStatus.OK)
    async registrarSalida(@Body() registrarSalidaDto: RegistrarSalidaDto) {
        return this.vehiculoService.registrarSalida(registrarSalidaDto);
    }

    @Get('dentro')
    @Roles('vigilante', 'admin', 'gerente')
    async obtenerVehiculosDentro() {
        return this.vehiculoService.obtenerVehiculosDentro();
    }

    @Get('todos')
    @Roles('admin', 'gerente')
    async obtenerTodosVehiculos() {
        return this.vehiculoService.obtenerTodosVehiculos();
    }

    @Get('usuario/:idusuario')
    @Roles('admin', 'gerente', 'vigilante')
    async obtenerVehiculosPorUsuario(
        @Param('idusuario', ParseIntPipe) idusuario: number,
    ) {
        return this.vehiculoService.obtenerVehiculosPorUsuario(idusuario);
    }

    @Get('matricula/:matricula')
    @Roles('vigilante', 'admin', 'gerente')
    async obtenerVehiculoPorMatricula(@Param('matricula') matricula: string) {
        return this.vehiculoService.obtenerVehiculoPorMatricula(matricula);
    }

    @Get('estadisticas')
    @Roles('admin', 'gerente', 'vigilante')
    async obtenerEstadisticas() {
        return this.vehiculoService.obtenerEstadisticas();
    }
}
