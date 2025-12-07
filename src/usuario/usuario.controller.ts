import {
    Controller,
    Get,
    Post,
    Delete,
    Put,
    Body,
    Param,
    NotFoundException,
    ConflictException,
    BadRequestException,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CrearUsuarioDto } from './usuario.dto';
import { ActualizarUserDto } from './ActualizarUsuario.dto';
import * as bcrypt from 'bcrypt';

@Controller('usuario')
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) {}


    @Get()
    findAll() {
        return this.usuarioService.findAll();
    }

    @Get(':idusuario')
    async findOne(@Param('idusuario', ParseIntPipe) idusuario: number) {
        const user = await this.usuarioService.findByIdUsuario(idusuario);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }


    @Post()
    async crear(@Body() body: CrearUsuarioDto) {
        try {
            return await this.usuarioService.crear(body);
        } catch (error) {
            console.error('Error al crear usuario:', error);


            if (error.code === 11000) {
                const duplicated = Object.keys(error.keyPattern || {});
                throw new ConflictException(`Ya existe un usuario con ${duplicated.join(', ')}`);
            }

            if (error instanceof ConflictException) throw error;

            throw new BadRequestException(error.message || 'No se pudo crear el usuario');
        }
    }


    @Delete(':idusuario')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('idusuario', ParseIntPipe) idusuario: number) {
        try {
            const user = await this.usuarioService.eliminar(idusuario.toString());
            if (!user) throw new NotFoundException('Usuario no encontrado');
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException(error.message || 'Error al eliminar usuario');
        }
    }


    @Put(':idusuario')
    async actualizar(
        @Param('idusuario', ParseIntPipe) idusuario: number,
        @Body() body: ActualizarUserDto,
    ) {
        const user = await this.usuarioService.actualizar(idusuario.toString(), body);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    @Post('set-password')
    async setPassword(@Body() body: { username: string; password: string }) {
        try {
            const hashed = await bcrypt.hash(body.password, 10);

            const usuario = await this.usuarioService['userModel'].findOneAndUpdate(
                { username: body.username },
                { password: hashed },
                { new: true },
            );

            if (!usuario) throw new NotFoundException('Usuario no encontrado');

            return {
                message: 'Contraseña actualizada correctamente',
                username: body.username,
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException('Error al actualizar contraseña');
        }
    }
}
