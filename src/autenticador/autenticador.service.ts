import { 
  Injectable, 
  UnauthorizedException 
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
            // ✅ findOne ahora incluye el password automáticamente
            const user = await this.userService.findOne(username);
            
            if (!user) {
                console.log('❌ Usuario no encontrado:', username);
                return null;
            }

            // Verifica que el password exista
            if (!user.password) {
                console.error('❌ Usuario sin contraseña:', username);
                return null;
            }

            // Compara contraseñas
            const isPasswordValid = await bcrypt.compare(pass, user.password);
            
            if (!isPasswordValid) {
                console.log('❌ Contraseña incorrecta para:', username);
                return null;
            }

            console.log('✅ Usuario validado correctamente:', username);

            // Elimina información sensible
            const { password, ...result } = user.toObject();
            return result;
        } catch (error) {
            console.error('❌ Error en ValidarUser:', error);
            throw new UnauthorizedException('Error al validar credenciales');
        }
    }

    async login(user: any) {
        const payload = { 
            username: user.username,
            sub: user.idusuario,
            rol: user.rol,
            nombre: user.nombre,
            tipo: 'access_token'
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            user: {
                idusuario: user.idusuario,
                username: user.username,
                nombre: user.nombre,
                rol: user.rol,
                correo: user.correo
            }
        };
    }

    async verifyToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }

    decodeToken(token: string) {
        return this.jwtService.decode(token);
    }
}