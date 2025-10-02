import  { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

@Schema({
    timestamps: true,
    toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret.idusuario; 
        delete ret._id;
        delete ret.__v;
        return ret;
    }
}
})


export class Usuario {
    @Prop({
        required: true,
        unique: true
    })
    idusuario: number;

    @Prop({
        required: true,
        unique: true
    })
    nombre:string;

    @Prop({
        required: true,
        unique: true
    })
    documento:number;

    @Prop({
        required: true
    })
    cargo:string;

    @Prop({
        required: true
    })
    vehiculo:string;

    @Prop({
        required: true,
    })
    matricula:string;

    @Prop({
        required: true
    })
    RH:string

    @Prop({
        required: true,
        unique: true
    })
    correo:string;

    @Prop({
        required: true
    })
    direccion:string

    @Prop({
        required: true,
        unique: true
    })
    celular:number

    @Prop({
        required: true
    })
    elementos:string

    @Prop({
        required: true
    })
    rol:string

    @Prop({
        required:true,
        unique: true
    })
    username:string

    @Prop({
        required:true,
        unique:true
    })
    password:string
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario)
