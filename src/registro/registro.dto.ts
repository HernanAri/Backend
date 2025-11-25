import { IsString, IsNotEmpty } from 'class-validator';

export class IniciarSesionDto {
  @IsString()
  @IsNotEmpty()
  token: string; // Token JWT del QR escaneado
}