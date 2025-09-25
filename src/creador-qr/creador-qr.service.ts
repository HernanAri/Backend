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

@Injectable()
export class QrcodeService {
    constructor(
        @InjectModel(Usuario.name)
        private usuarioModel: Model<Usuario>,
        
    ) {}

    async generateQRCode(idusuario: number) : Promise<string> {
        const usuario = await this.usuarioModel.findOne({ idusuario}).exec();
        if (!usuario){
            throw new NotFoundException ('Usuario no encontrado');
        }

        try {
            const qrCodeDataUrl = await QRCode.toDataURL(idusuario.toString());
            return qrCodeDataUrl;
        } catch (err) {
            throw new Error(`Error al generar el código QR: ${err.message}`);
        }
    }
}
