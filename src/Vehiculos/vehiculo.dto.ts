import { IsNotEmpty, IsString, IsNumber, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearVehiculoDto {
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    idusuario: number;

    @IsString()
    @IsNotEmpty()
    nombrePropietario: string;

    @IsString()
    @IsNotEmpty()
    documentoPropietario: string;

    @IsIn(['Moto', 'Carro'])
    @IsString()
    @IsNotEmpty()
    tipoVehiculo: string;

    @IsString()
    @IsNotEmpty()
    matricula: string;

    @IsString()
    @IsOptional()
    marca?: string;

    @IsString()
    @IsOptional()
    modelo?: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsNotEmpty()
    registradoPor: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}

export class RegistrarSalidaDto {
    @IsString()
    @IsNotEmpty()
    matricula: string;

    @IsString()
    @IsNotEmpty()
    registradoPor: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}