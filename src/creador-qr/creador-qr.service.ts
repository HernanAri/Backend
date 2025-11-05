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

    async generateQRCode(idusuario: number): Promise<string> {
        // Verifica que el usuario existe
        const usuario = await this.usuarioModel.findOne({ idusuario }).exec();
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        try {
            // Genera el token JWT con información del usuario
            const payload = {
                idusuario: usuario.idusuario,
                sub: usuario._id, // ID de MongoDB
                tipo: 'qr-auth', // Tipo de token para identificarlo
                timestamp: Date.now()
            };

            const token = this.jwtService.sign(payload);

            // Genera el QR con el token
            const qrCodeDataUrl = await QRCode.toDataURL(token, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                width: 300,
                margin: 1
            });

            return qrCodeDataUrl;
        } catch (err) {
            throw new Error(`Error al generar el código QR: ${err.message}`);
        }
    }

    // Método adicional para verificar el token del QR
    async verifyQRToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return decoded;
        } catch (err) {
            throw new Error('Token inválido o expirado');
        }
    }
}