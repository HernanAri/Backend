import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private usuarioService: UsuarioService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'Pollo', 
        });
    }

    async validate(payload: any) {
        const user = await this.usuarioService.findOne(payload.username);
        
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        return {
            idusuario: payload.sub,
            username: payload.username,
            rol: payload.rol,
            nombre: payload.nombre
        };
    }
}