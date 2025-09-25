import {Controller,Get,Post, Delete, Put,Body, Param, NotFoundException,ConflictException, HttpCode,BadRequestException,HttpStatus, ParseIntPipe} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CrearUsuarioDto } from './usuario.dto';



@Controller('usuario')
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService ){}

    @Get()
    findAll(){
        return this.usuarioService.findAll()
    }
    

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id:number){
        const user = await this.usuarioService.findByIdUsuario(id);
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

        @Delete(':id')
        @HttpCode(HttpStatus.NO_CONTENT)
        async eliminar(@Param('id') id: string) {
            try {
            const user = await this.usuarioService.eliminar(id);
            if (!user) throw new NotFoundException('Usuario no encontrado');
            return user;
            } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw new BadRequestException(error.message || 'Error al eliminar usuario');
            }
        }

    @Put(':id')
    async actualizar(@Param('id') id:string, @Body() body:any){
        const user = await this.usuarioService.actualizar(id, body);
        if(!user) throw new NotFoundException('User no encontrado')
        return user;
    }

}