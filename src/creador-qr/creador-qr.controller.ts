import { Controller, Get, Param, Res, ParseIntPipe, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { QrcodeService } from './creador-qr.service';
import { Response } from 'express';

@Controller('qrcode')
export class QrcodeController {
    constructor(private readonly qrcodeService: QrcodeService) {}

    /**
     * Genera y devuelve imagen del QR para un usuario
     * GET /qrcode/:idusuario
     */
    @Get(':idusuario')
    async getQrCode(
        @Param('idusuario', ParseIntPipe) idusuario: number,
        @Res() res: Response
    ) {
        const qrCodeDataUrl = await this.qrcodeService.generateQRCode(idusuario);
        const qrCodeBase64 = qrCodeDataUrl.split(',')[1];
        const qrCodeBuffer = Buffer.from(qrCodeBase64, 'base64');
        return res.type('image/png').send(qrCodeBuffer);
    }

    /**
     * Verifica el token escaneado
     * POST /qrcode/verify
     */
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verifyQrToken(@Body('token') token: string) {
        return await this.qrcodeService.verifyQRToken(token);
    }

    /**
     * Login directo con QR
     * POST /qrcode/login
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async loginWithQR(@Body('token') token: string) {
        return await this.qrcodeService.loginWithQR(token);
    }
}