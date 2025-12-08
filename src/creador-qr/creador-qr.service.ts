import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '../usuario/usuario.schema';

@Injectable()
export class QrcodeService {
    constructor(
        @InjectModel(Usuario.name)
        private usuarioModel: Model<Usuario>,
        private jwtService: JwtService
    ) {}

    /**
     * Genera un código QR permanente para login y registro de vehículos
     */
    async generateQRCode(idusuario: number): Promise<string> {
        const usuario = await this.usuarioModel
            .findOne({ idusuario })
            .exec();
            
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        try {
            const payload = {
                idusuario: usuario.idusuario,
                username: usuario.username,
                nombre: usuario.nombre,
                documento: usuario.documento,
                cargo: usuario.cargo,
                rol: usuario.rol,
                correo: usuario.correo,
                vehiculo: usuario.vehiculo || 'Ninguno',
                matricula: usuario.matricula || '',
                celular: usuario.celular,
                tipo: 'qr-universal',
                timestamp: Date.now()
            };

            console.log('📝 Generando QR para usuario:', payload);

            // Token de larga duración (1 año)
            const token = this.jwtService.sign(payload, { 
                secret: 'Pollo', // Mismo secret que autenticador
                expiresIn: '365d'
            });

            const qrCodeDataUrl = await QRCode.toDataURL(token, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                width: 300,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            console.log('✅ QR generado exitosamente');
            return qrCodeDataUrl;
        } catch (err) {
            console.error('❌ Error generando QR:', err);
            throw new Error(`Error al generar el código QR: ${err.message}`);
        }
    }

    /**
     * Verifica y decodifica el token QR
     */
    async verifyQRToken(token: string) {
        try {
            console.log('🔍 Verificando token QR...');
            
            // Decodificar token con el mismo secret
            const decoded = this.jwtService.verify(token, {
                secret: 'Pollo'
            });

            console.log('✅ Token decodificado:', decoded);

            if (decoded.tipo !== 'qr-universal' && decoded.tipo !== 'qr-login') {
                console.warn('⚠️ Tipo de token no válido:', decoded.tipo);
                throw new UnauthorizedException('Token QR inválido');
            }

            // Verificar que el usuario sigue activo
            const usuario = await this.usuarioModel
                .findOne({ 
                    idusuario: decoded.idusuario
                })
                .exec();

            if (!usuario) {
                console.error('❌ Usuario no encontrado:', decoded.idusuario);
                throw new NotFoundException('Usuario no encontrado o inactivo');
            }

            console.log('✅ Usuario verificado:', usuario.nombre);

            // Retornar información completa del usuario
            return {
                valid: true,
                idusuario: usuario.idusuario,
                username: usuario.username,
                nombre: usuario.nombre,
                documento: usuario.documento,
                cargo: usuario.cargo,
                rol: usuario.rol,
                correo: usuario.correo,
                vehiculo: usuario.vehiculo || 'Ninguno',
                matricula: usuario.matricula || '',
                celular: usuario.celular,
                direccion: usuario.direccion,
                RH: usuario.RH
            };
        } catch (err) {
            console.error('❌ Error verificando token:', err);
            
            if (err.name === 'TokenExpiredError') {
                throw new UnauthorizedException('El código QR ha expirado');
            }
            if (err.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Token QR inválido o corrupto');
            }
            if (err instanceof NotFoundException) {
                throw err;
            }
            
            throw new UnauthorizedException('Error al verificar el código QR');
        }
    }

    /**
     * Realiza login con QR y retorna access token
     */
    async loginWithQR(token: string) {
        try {
            console.log('🔐 Iniciando login con QR...');
            
            const userInfo = await this.verifyQRToken(token);

            const payload = { 
                username: userInfo.username,
                sub: userInfo.idusuario,
                rol: userInfo.rol,
                nombre: userInfo.nombre,
                tipo: 'access_token'
            };

            // Token de sesión (8 horas)
            const accessToken = this.jwtService.sign(payload, {
                secret: 'Pollo',
                expiresIn: '8h' 
            });

            console.log('✅ Login exitoso para:', userInfo.nombre);

            return {
                access_token: accessToken,
                token_type: 'Bearer',
                expires_in: 28800,
                user: {
                    idusuario: userInfo.idusuario,
                    username: userInfo.username,
                    nombre: userInfo.nombre,
                    rol: userInfo.rol,
                    correo: userInfo.correo,
                    vehiculo: userInfo.vehiculo,
                    matricula: userInfo.matricula
                }
            };
        } catch (err) {
            console.error('❌ Error en login con QR:', err);
            throw err;
        }
    }

    /**
     * Obtiene información del usuario desde el QR sin hacer login
     */
    async getUserInfoFromQR(token: string) {
        console.log('ℹ️ Obteniendo info de usuario desde QR...');
        return await this.verifyQRToken(token);
    }
}