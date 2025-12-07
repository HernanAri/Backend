import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './usuario.schema';
import { CrearUsuarioDto } from './usuario.dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
    constructor(@InjectModel(Usuario.name) private userModel: Model<Usuario>) {}

    findAll() {
        return this.userModel.find();
    }

    async crear(dto: CrearUsuarioDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = new this.userModel({ ...dto, password: hashedPassword });
        return user.save();
    }


    async findOne(username: string) {
        const usuario = await this.userModel
            .findOne({ username })
            .select('+password') 
            .exec();
        
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return usuario;
    }

    async eliminar(idusuario: string) {
        const usuario = await this.userModel.findOneAndDelete({ idusuario });
        
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }
        
        return usuario;
    }

    async actualizar(idusuario: string, updateDto: Partial<CrearUsuarioDto>) {
        // Si se actualiza la contraseña, hashearla
        if (updateDto.password) {
            updateDto.password = await bcrypt.hash(updateDto.password, 10);
        }

        const usuario = await this.userModel.findOneAndUpdate(
            { idusuario },
            updateDto,
            { new: true, runValidators: true }
        );
        
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }
        
        return usuario;
    }

    async findByIdUsuario(idusuario: number) {
        const usuario = await this.userModel.findOne({ idusuario }).exec();
        if (!usuario) throw new NotFoundException('Usuario no encontrado');
        return usuario;
    }
}