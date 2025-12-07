import {
    Controller,
    Get,
    Param,
    Res,
    ParseIntPipe,
    Post,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { QrcodeService } from './creador-qr.service';
import { Response } from 'express';

@Controller('qrcode')
export class QrcodeController {
    constructor(private readonly qrcodeService: QrcodeService) {}

    @Get(':idusuario')
    async getQrCode(
        @Param('idusuario', ParseIntPipe) idusuario: number,
        @Res() res: Response,
    ) {
        const qrCodeDataUrl = await this.qrcodeService.generateQRCode(idusuario);
        const base64 = qrCodeDataUrl.split(',')[1];
        const buffer = Buffer.from(base64, 'base64');
        return res.type('image/png').send(buffer);
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verifyQrToken(@Body('token') token: string) {
        return this.qrcodeService.verifyQRToken(token);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async loginWithQR(@Body('token') token: string) {
        return this.qrcodeService.loginWithQR(token);
    }
}
