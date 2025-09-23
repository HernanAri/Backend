import { Controller, Post, Body } from '@nestjs/common';
import { AutenticadorService } from './autenticador.service';

@Controller('autenticador')
export class AutenticadorController {
    constructor(private readonly authService: AutenticadorService) {}

    @Post('login')
    async login(@Body() body: { username: string; password: string }) {
        const user = await this.authService.ValidarUser(body.username, body.password);
        if (!user) {
            return { message: 'Invalid credentials' };
        }
        return this.authService.login(user);
    }
}
