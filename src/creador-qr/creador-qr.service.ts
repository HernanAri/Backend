import { Injectable, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from 'src/usuario/usuario.schema';

@Injectable()
export class QrcodeService {
    constructor(
        @InjectModel(Usuario.name)
        private usuarioModel: Model<Usuario>,
        private jwtService: JwtService
    ) {}

    /**
     * Genera un QR con token JWT que contiene username y password encriptado
     * Este QR permite login directo sin necesidad de escribir credenciales
     */
    async generateQRCode(idusuario: number): Promise<string> {
        // Verifica que el usuario existe y obtiene el password
        const usuario = await this.usuarioModel
            .findOne({ idusuario })
            .select('+password')
            .exec();
            
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        try {
            // Genera el token JWT con credenciales para login automático
            const payload = {
                idusuario: usuario.idusuario,
                username: usuario.username,
                nombre: usuario.nombre,
                rol: usuario.rol,
                tipo: 'qr-login', // Identifica que es un token de login por QR
                timestamp: Date.now()
            };

            // Token sin expiración o con expiración muy larga para QR físicos
            const token = this.jwtService.sign(payload, { 
                expiresIn: '365d' // 1 año de validez
            });

            // Genera el QR con el token
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

            return qrCodeDataUrl;
        } catch (err) {
            throw new Error(`Error al generar el código QR: ${err.message}`);
        }
    }

    /**
     * Verifica el token del QR y retorna la información del usuario
     * Permite login sin password
     */
    async verifyQRToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            
            // Verifica que sea un token de tipo qr-login
            if (decoded.tipo !== 'qr-login') {
                throw new Error('Token QR inválido');
            }

            // Busca el usuario para asegurar que aún existe y está activo
            const usuario = await this.usuarioModel
                .findOne({ 
                    idusuario: decoded.idusuario,
                    activo: true 
                })
                .exec();

            if (!usuario) {
                throw new Error('Usuario no encontrado o inactivo');
            }

            // Retorna info del usuario sin el password
            return {
                valid: true,
                idusuario: usuario.idusuario,
                username: usuario.username,
                nombre: usuario.nombre,
                rol: usuario.rol,
                correo: usuario.correo
            };
        } catch (err) {
            throw new Error('Token inválido o expirado');
        }
    }

    /**
     * Login directo con token QR
     * Retorna el mismo formato que el login normal
     */
    async loginWithQR(token: string) {
        const userInfo = await this.verifyQRToken(token);
        
        // Genera un nuevo access token para la sesión
        const payload = { 
            username: userInfo.username,
            sub: userInfo.idusuario,
            rol: userInfo.rol,
            nombre: userInfo.nombre,
            tipo: 'access_token'
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '8h' // Token de sesión de 8 horas
        });

        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 28800, // 8 horas en segundos
            user: {
                idusuario: userInfo.idusuario,
                username: userInfo.username,
                nombre: userInfo.nombre,
                rol: userInfo.rol,
                correo: userInfo.correo
            }
        };
    }
}