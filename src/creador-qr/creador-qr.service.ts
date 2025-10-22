import { Injectable, NotFoundException} from '@nestjs/common';
import * as QRCode from 'qrcode';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/usuario.schema';
import { error } from 'console';
import { UsuarioService } from 'src/usuario/usuario.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutenticadorService } from 'src/autenticador/autenticador.service';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class QrcodeService {
    constructor(
        @InjectModel(Usuario.name)
        private usuarioModel: Model<Usuario>,
        private jwtService:JwtService
    ) {}

    async generateQRCode(idusuario: number) : Promise<string> {
        const usuario = await this.usuarioModel.findOne({ idusuario}).exec();
        if (!usuario){
            throw new NotFoundException ('Usuario no encontrado');
        }

        try {
            const qrData = this.jwtService.sign({idusuario},{expiresIn:'5m'})
            const qrCodeDataUrl = await QRCode.toDataURL(qrData);
            return qrCodeDataUrl;
        } catch (err) {
            throw new Error(`Error al generar el código QR: ${err.message}`);
        }
    }
}
