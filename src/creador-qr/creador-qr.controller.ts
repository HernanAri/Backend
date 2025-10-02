import { Controller, Get, Param, Res, ParseIntPipe} from '@nestjs/common';
import { QrcodeService } from './creador-qr.service';
import { Response } from 'express';

@Controller('qrcode')
export class QrcodeController {
    constructor (private readonly qrcodeService: QrcodeService){}

    @Get (':idusuario')
    async getQrCode(@Param('idusuario', ParseIntPipe) idusuario:number, @Res() res:Response){
        const qrCodeDataUrl= await this.qrcodeService.generateQRCode(idusuario);
        const qrCodeBase64=qrCodeDataUrl.split(',')[1];
        const qrCodeBuffer=Buffer.from(qrCodeBase64,'base64');
        return res.type('image/png').send(qrCodeBuffer);
    }
    
}
