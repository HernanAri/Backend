import { 
  Injectable, 
  UnauthorizedException,
  NotFoundException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from 'src/usuario/usuario.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AutenticadorService {
    constructor(
        private userService: UsuarioService,
        private jwtService: JwtService,
    ) {}

    async ValidarUser(username: string, pass: string): Promise<any> {
        try {
            const user = await this.userService.findOne(username);
            
            if (!user) {
                return null;
            }

            const isPasswordValid = await bcrypt.compare(pass, user.password);
            
            if (!isPasswordValid) {
                return null;
            }

            // Elimina información sensible
            const { password, ...result } = user.toObject();
            return result;
        } catch (error) {
            throw new UnauthorizedException('Error al validar credenciales');
        }
    }

    async login(user: any) {
        // Payload con más información útil
        const payload = { 
            username: user.username,
            sub: user.idusuario,
            rol: user.rol,
            nombre: user.nombre,
            tipo: 'access_token' // Identifica el tipo de token
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600, // segundos
            user: {
                idusuario: user.idusuario,
                username: user.username,
                nombre: user.nombre,
                rol: user.rol,
                correo: user.correo
            }
        };
    }

    // Método para verificar token
    async verifyToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }

    // Método para decodificar sin verificar (útil para debugging)
    decodeToken(token: string) {
        return this.jwtService.decode(token);
    }
}