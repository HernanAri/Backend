import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class ActualizarUserDto{
    @IsString()
    rol:string;

    @IsString()
    @IsNotEmpty()
    username:string;

    @IsEmail()
    @IsNotEmpty()
    email:string;

    @MinLength(4)
    @MaxLength(6)
    password:string;

}
