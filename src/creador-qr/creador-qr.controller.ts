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

    /**
     * Genera y retorna la imagen QR para un usuario
     * GET /qrcode/:idusuario
     */
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

    /**
     * Verifica un token QR y retorna información del usuario
     * POST /qrcode/verify
     * Body: { token: string }
     */
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verifyQrToken(@Body('token') token: string) {
        return this.qrcodeService.verifyQRToken(token);
    }

    /**
     * Realiza login con QR y retorna access_token
     * POST /qrcode/login
     * Body: { token: string }
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async loginWithQR(@Body('token') token: string) {
        return this.qrcodeService.loginWithQR(token);
    }

    /**
     * Obtiene información del usuario desde QR sin hacer login
     * Útil para registro de vehículos
     * POST /qrcode/info
     * Body: { token: string }
     */
    @Post('info')
    @HttpCode(HttpStatus.OK)
    async getUserInfo(@Body('token') token: string) {
        return this.qrcodeService.getUserInfoFromQR(token);
    }
}