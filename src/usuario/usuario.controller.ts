import {Controller,Get,Post, Delete, Put,Body, Param, NotFoundException,ConflictException, HttpCode,BadRequestException,HttpStatus, ParseIntPipe} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CrearUsuarioDto } from './usuario.dto';
import { ActualizarUserDto } from './ActualizarUsuario.dto';



@Controller('usuario')
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService ){}

    @Get()
    findAll(){
        return this.usuarioService.findAll()
    }
    

    @Get(':idusuario')
    async findOne(@Param('idusuario', ParseIntPipe) idusuario:number){
        const user = await this.usuarioService.findByIdUsuario(idusuario);
        if(!user) throw new NotFoundException('Usuario no encontrado')
        return user;    
    }

    @Post()
    async crear(@Body() body: CrearUsuarioDto){
        try{
            return await this.usuarioService.crear(body)
        }  catch (error) {

            console.error('Error al crear usuario:', error);

            if (error.code === 11000) {

            const duplicatedFields = Object.keys(error.keyPattern || {});
            throw new ConflictException(`Ya existe un usuario con ${duplicatedFields.join(', ')}`);
            }

            if (error instanceof ConflictException) {
                throw error;
            }

            throw new BadRequestException(error.message || 'No se pudo crear el usuario');
            }
        }

        /*@Delete(':idusuario')
        @HttpCode(HttpStatus.NO_CONTENT)
        async eliminar(@Param('idusuario') idusuario: string) {
            try {
            const user = await this.usuarioService.eliminar(idusuario);
            if (!user) throw new NotFoundException('Usuario no encontrado');
            return user;
            } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw new BadRequestException(error.message || 'Error al eliminar usuario');
            }
        }

    @Put(':idusuario')
    async actualizar(@Param('idusuario') idusuario: string, @Body() body: any) {
        const user = await this.usuarioService.actualizar(idusuario, body);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }
}*/
        @Delete(':idusuario')
        @HttpCode(HttpStatus.NO_CONTENT)
        async eliminar(@Param('idusuario',ParseIntPipe) idusuario: number) {
        try {
            const user = await this.usuarioService.eliminar(idusuario.toString());
            if (!user) throw new NotFoundException('Usuario no encontrado');
        } catch (error) {
            console.error('Error al eliminar usuario:', error);

        if (error instanceof NotFoundException) {
        throw error; // Mantiene el 404
        }

        throw new BadRequestException(error.message || 'Error al eliminar usuario');
    }
}

    @Put(':idusuario')
        async actualizar(
        @Param('idusuario', ParseIntPipe) idusuario: number,
        @Body() body: ActualizarUserDto
        ) {
        const user = await this.usuarioService.actualizar(idusuario.toString(), body);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }
}