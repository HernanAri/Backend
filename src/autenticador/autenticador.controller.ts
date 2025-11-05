import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Request,
  UnauthorizedException
} from '@nestjs/common';
import { AutenticadorService } from './autenticador.service';
import { LoginDto } from '../login/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard'; // Ajustar la ruta

@Controller('autenticador')
export class AutenticadorController {
    constructor(private readonly authService: AutenticadorService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.ValidarUser(
            loginDto.username, 
            loginDto.password
        );
        
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        
        return this.authService.login(user);
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    async refresh(@Request() req) {
        return this.authService.login(req.user);
    }
}