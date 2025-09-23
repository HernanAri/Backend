import {IsString} from 'class-validator';

export class CrearRegistroDto{
    @IsString()
    nombre: string
}