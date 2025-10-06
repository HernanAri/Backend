import { Injectable ,NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './usuario.schema';
import { CrearUsuarioDto } from './usuario.dto';
import { Model } from 'mongoose';
import { ActualizarUserDto } from './ActualizarUsuario.dto';


@Injectable()
export class UsuarioService {
    constructor(@InjectModel(Usuario.name) private userModel: Model<Usuario>) {}

    findAll(){
        return this.userModel.find()
    }

    async crear(crearUsuario: CrearUsuarioDto){
        const user = new this.userModel(crearUsuario);
        return await user.save()
    }

    async findOne(idusuario: string) {
        const usuario = await this.userModel.findOne({ idusuario });
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
