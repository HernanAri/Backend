import {IsString, MinLength, MaxLength} from 'class-validator'

export class CrearLoginDto{
    @IsString()
    username:string;

    @MinLength(4)
    @MaxLength(12)
    password:string;
}