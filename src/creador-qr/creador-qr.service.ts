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

            const qrCodeDataUrl = await QRCode.toDataURL(shortToken, {
                errorCorrectionLevel: 'L', 
                type: 'image/png',
                width: 500,               
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            return qrCodeDataUrl;
        } catch (err) {
            throw new Error(`Error al generar el código QR: ${err.message}`);
        }
    }

    /**
     * Limpia sesiones QR expiradas (más de 7 días)
     */
    private cleanExpiredSessions() {
        const now = new Date();
        const expiredTime = 7 * 24 * 60 * 60 * 1000; 
        
        for (const [token, session] of this.qrSessions.entries()) {
            if (now.getTime() - session.createdAt.getTime() > expiredTime) {
                this.qrSessions.delete(token);
            }
        }
    }

    /**
     * Verifica el token QR corto
     */
    async verifyQRToken(token: string) {
        try {
            const session = this.qrSessions.get(token);
            
            if (!session) {
                throw new UnauthorizedException('QR inválido o expirado');
            }

            const usuario = await this.usuarioModel
                .findOne({ 
                    idusuario: session.idusuario,
                    username: session.username
                })
                .exec();

            if (!usuario) {
                this.qrSessions.delete(token);
                throw new NotFoundException('Usuario no encontrado');
            }

            if (usuario.password !== session.password) {
                this.qrSessions.delete(token);
                throw new UnauthorizedException('Credenciales inválidas');
            }

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
            throw err;
        }
    }

    /**
     * Obtiene información del usuario desde el QR
     */
    async getUserInfoFromQR(token: string) {
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
        return count;
    }
}