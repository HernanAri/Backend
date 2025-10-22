import { Injectable ,NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './usuario.schema';
import { CrearUsuarioDto } from './usuario.dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsuarioService {
    constructor(@InjectModel(Usuario.name) private userModel: Model<Usuario>) {}

    findAll(){
        return this.userModel.find()
    }

    async crear(dto: CrearUsuarioDto){
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = new this.userModel({...dto, password:hashedPassword});
        return user.save();
    }

    async findOne(idusuario: string) {
        const usuario = await this.userModel.findOne({ idusuario });
        if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
        }
        return usuario;
    }

    async eliminar(username: string) {
        const usuario = await this.userModel.findOneAndDelete({ username });
    
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
