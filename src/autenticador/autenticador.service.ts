import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CrearUsuarioDto } from 'src/usuario/usuario.dto';
import { Usuario } from 'src/usuario/usuario.schema';
import { UsuarioService } from 'src/usuario/usuario.service';

@Injectable()
export class AutenticadorService {
    constructor(
        private userService: UsuarioService,
        private jwtService: JwtService ,
    ){}

    async ValidarUser(username:string, pass:string): Promise<any> {
        const user = await this.userService.findOne(username);
        if( user && user.password=== pass){
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login (user: any){
        const payload = { username: user.username, sub: user.idusuario };
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
