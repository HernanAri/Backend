import {
    Controller,
    Get,
    Post,
    Delete,
    Put,
    Body,
    Param,
    NotFoundException,
    ConflictException,
    BadRequestException,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CrearUsuarioDto } from './usuario.dto';
import { ActualizarUserDto } from './ActualizarUsuario.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { QrcodeService } from 'src/creador-qr/creador-qr.service';

@Controller('usuario')
export class UsuarioController {
    private transporter;

    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly qrcodeService: QrcodeService
    ) {
        // Configurar el transporter de nodemailer
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT ?? '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    @Get()
    findAll() {
        return this.usuarioService.findAll();
    }

    @Get(':idusuario')
    async findOne(@Param('idusuario', ParseIntPipe) idusuario: number) {
        const user = await this.usuarioService.findByIdUsuario(idusuario);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    @Post()
    async crear(@Body() body: CrearUsuarioDto) {
        try {
            const usuario = await this.usuarioService.crear(body);
            
            // Generar QR
            const qrImage = await this.qrcodeService.generateQRCode(usuario.idusuario);
            
            // Enviar correo con credenciales y QR
            try {
                await this.transporter.sendMail({
                    from: '"CLOKIFY Sistema" <noreply@clokify.com>',
                    to: usuario.correo,
                    subject: 'Bienvenido a CLOKIFY - Tus Credenciales de Acceso',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                                .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
                                .qr-section { text-align: center; margin: 30px 0; }
                                .qr-section img { max-width: 300px; border: 2px solid #3B82F6; border-radius: 10px; padding: 10px; background: white; }
                                .vehicle-info { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; }
                                .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
                                ul { list-style: none; padding: 0; }
                                li { padding: 8px 0; }
                                strong { color: #1F2937; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🕐 CLOKIFY</h1>
                                    <p>Sistema de Control de Asistencia</p>
                                </div>
                                
                                <div class="content">
                                    <h2>¡Bienvenido ${usuario.nombre}!</h2>
                                    <p>Tu cuenta ha sido creada exitosamente en CLOKIFY.</p>
                                    
                                    <div class="credentials">
                                        <h3>📋 Tus credenciales de acceso:</h3>
                                        <ul>
                                            <li><strong>Usuario:</strong> ${usuario.username}</li>
                                            <li><strong>Contraseña:</strong> ${body.password}</li>
                                            <li><strong>Rol:</strong> ${usuario.rol}</li>
                                        </ul>
                                    </div>
                                    
                                    <div class="qr-section">
                                        <h3>📱 Tu código QR personal</h3>
                                        <p>Usa este código para iniciar sesión rápidamente:</p>
                                        <img src="${qrImage}" alt="Tu Código QR"/>
                                        <p style="color: #3B82F6; font-weight: bold; margin-top: 10px;">
                                            ${usuario.rol.toLowerCase() === 'usuario' ? '✨ Tu jornada laboral iniciará automáticamente al escanear el QR' : ''}
                                        </p>
                                    </div>
                                    
                                    ${usuario.vehiculo !== 'Ninguno' ? `
                                        <div class="vehicle-info">
                                            <h3>🚗 Información de tu vehículo registrado:</h3>
                                            <ul>
                                                <li><strong>Tipo:</strong> ${usuario.vehiculo}</li>
                                                <li><strong>Matrícula:</strong> ${usuario.matricula}</li>
                                            </ul>
                                            <p style="font-size: 14px; color: #666; margin-top: 10px;">
                                                El vigilante podrá registrar tu entrada/salida escaneando este QR
                                            </p>
                                        </div>
                                    ` : ''}
                                    
                                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                                        <p><strong>⚠️ Importante:</strong></p>
                                        <ul style="margin: 10px 0;">
                                            <li>• Guarda este correo de forma segura</li>
                                            <li>• Puedes imprimir tu código QR para uso diario</li>
                                            <li>• Se recomienda cambiar tu contraseña después del primer inicio de sesión</li>
                                            <li>• No compartas tus credenciales ni tu código QR</li>
                                        </ul>
                                    </div>
                                    
                                    <div style="text-align: center; margin-top: 30px;">
                                        <p><strong>¿Necesitas ayuda?</strong></p>
                                        <p>Contacta al administrador del sistema</p>
                                    </div>
                                </div>
                                
                                <div class="footer">
                                    <p>Este es un correo automático, por favor no responder.</p>
                                    <p>© ${new Date().getFullYear()} CLOKIFY - Sistema de Control de Asistencia</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                });
            } catch (emailError) {
                console.error('❌ Error al enviar correo:', emailError);
            }
            
            return usuario;
        } catch (error) {

            if (error.code === 11000) {
                const duplicated = Object.keys(error.keyPattern || {});
                throw new ConflictException(`Ya existe un usuario con ${duplicated.join(', ')}`);
            }

            if (error instanceof ConflictException) throw error;

            throw new BadRequestException(error.message || 'No se pudo crear el usuario');
        }
    }

    @Delete(':idusuario')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('idusuario', ParseIntPipe) idusuario: number) {
        try {
            const user = await this.usuarioService.eliminar(idusuario.toString());
            if (!user) throw new NotFoundException('Usuario no encontrado');
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException(error.message || 'Error al eliminar usuario');
        }
    }

    @Put(':idusuario')
    async actualizar(
        @Param('idusuario', ParseIntPipe) idusuario: number,
        @Body() body: ActualizarUserDto,
    ) {
        const user = await this.usuarioService.actualizar(idusuario.toString(), body);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    @Post('set-password')
    async setPassword(@Body() body: { username: string; password: string }) {
        try {
            const hashed = await bcrypt.hash(body.password, 10);

            const usuario = await this.usuarioService['userModel'].findOneAndUpdate(
                { username: body.username },
                { password: hashed },
                { new: true },
            );

            if (!usuario) throw new NotFoundException('Usuario no encontrado');

            return {
                message: 'Contraseña actualizada correctamente',
                username: body.username,
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException('Error al actualizar contraseña');
        }
    }
}