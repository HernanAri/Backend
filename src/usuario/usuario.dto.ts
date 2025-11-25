import {  IsEmail, IsNotEmpty, IsNumber, IsString, IsIn, MinLength, MaxLength} from 'class-validator'
import { Type } from 'class-transformer'

export class CrearUsuarioDto{
    @IsNotEmpty()
    idusuario: number;

    @IsString()
    nombre: string;

    @Type(()=>Number)
    @IsNumber()
    documento: number;

    @IsString()
    cargo: string;

    @IsIn(['Moto', 'Carro', 'Ninguno'])
    vehiculo?:string;

    @IsString()
    matricula: string;

    @IsString()
    RH: string;

    @IsEmail()
    @IsString()
    correo: string;

    @IsString()
    direccion:string;

    @Type(()=>Number)
    @IsNumber()
    celular: number;

    @IsString()
    elementos: string;

    @IsString()
    rol: string;

    @IsString()
    @IsNotEmpty()
    username:string;

    @MinLength(4)
    @MaxLength(12)
    password:string;
}