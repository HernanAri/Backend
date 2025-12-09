import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '../usuario/usuario.schema';
import { randomBytes } from 'crypto';

interface QRSession {
    token: string;
    idusuario: number;
    username: string;
    password: string;
    createdAt: Date;
}

@Injectable()
export class QrcodeService {
    // Almacenamiento en memoria de tokens QR activos
    private qrSessions: Map<string, QRSession> = new Map();
    
    constructor(
        @InjectModel(Usuario.name)
        private usuarioModel: Model<Usuario>,
        private jwtService: JwtService
    ) {
        // Limpieza automática de tokens expirados cada hora
        setInterval(() => this.cleanExpiredSessions(), 3600000);
    }

    /**
     * Genera un código QR ultra-compacto usando solo un ID corto
     * El ID es una referencia a datos almacenados en memoria
     */
    async generateQRCode(idusuario: number): Promise<string> {
        const usuario = await this.usuarioModel
            .findOne({ idusuario })
            .exec();
            
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        try {
            // Generar token corto y único (8 caracteres)
            const shortToken = randomBytes(6).toString('base64url'); // ~8 caracteres
            
            // Guardar sesión en memoria
            const session: QRSession = {
                token: shortToken,
                idusuario: usuario.idusuario,
                username: usuario.username,
                password: usuario.password,
                createdAt: new Date()
            };
            
            this.qrSessions.set(shortToken, session);
            
            console.log('📝 QR generado para:', usuario.username, '| Token:', shortToken);

            // Generar QR con solo el token corto
            const qrCodeDataUrl = await QRCode.toDataURL(shortToken, {
                errorCorrectionLevel: 'L',  // Mínima corrección = QR más simple
                type: 'image/png',
                width: 500,                  // Más pequeño
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            console.log('✅ QR ultra-compacto generado. Token length:', shortToken.length);
            return qrCodeDataUrl;
        } catch (err) {
            console.error('❌ Error generando QR:', err);
            throw new Error(`Error al generar el código QR: ${err.message}`);
        }
    }

    /**
     * Limpia sesiones QR expiradas (más de 7 días)
     */
    private cleanExpiredSessions() {
        const now = new Date();
        const expiredTime = 7 * 24 * 60 * 60 * 1000; // 7 días
        
        for (const [token, session] of this.qrSessions.entries()) {
            if (now.getTime() - session.createdAt.getTime() > expiredTime) {
                this.qrSessions.delete(token);
                console.log('🧹 Token QR expirado eliminado:', token);
            }
        }
    }

    /**
     * Verifica el token QR corto
     */
    async verifyQRToken(token: string) {
        try {
            console.log('🔍 Verificando token QR:', token);
            
            // Buscar sesión en memoria
            const session = this.qrSessions.get(token);
            
            if (!session) {
                console.error('❌ Token QR no encontrado o expirado');
                throw new UnauthorizedException('QR inválido o expirado');
            }

            // Verificar que el usuario sigue existiendo
            const usuario = await this.usuarioModel
                .findOne({ 
                    idusuario: session.idusuario,
                    username: session.username
                })
                .exec();

            if (!usuario) {
                // Eliminar sesión inválida
                this.qrSessions.delete(token);
                console.error('❌ Usuario no encontrado');
                throw new NotFoundException('Usuario no encontrado');
            }

            // Verificar password
            if (usuario.password !== session.password) {
                this.qrSessions.delete(token);
                console.error('❌ Credenciales modificadas');
                throw new UnauthorizedException('Credenciales inválidas');
            }

            console.log('✅ Token verificado:', usuario.nombre);

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
            
            if (err instanceof NotFoundException || err instanceof UnauthorizedException) {
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
     * Obtiene información del usuario desde el QR
     */
    async getUserInfoFromQR(token: string) {
        console.log('ℹ️ Obteniendo info de usuario desde QR...');
        return await this.verifyQRToken(token);
    }

    /**
     * Invalida un token QR específico (útil para logout o regeneración)
     */
    invalidateQRToken(token: string): boolean {
        return this.qrSessions.delete(token);
    }

    /**
     * Invalida todos los QR de un usuario (útil al cambiar password)
     */
    invalidateUserQRs(idusuario: number): number {
        let count = 0;
        for (const [token, session] of this.qrSessions.entries()) {
            if (session.idusuario === idusuario) {
                this.qrSessions.delete(token);
                count++;
            }
        }
        console.log(`🗑️ ${count} tokens QR invalidados para usuario ${idusuario}`);
        return count;
    }
}