import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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
            delete ret.password; // IMPORTANTE: nunca exponer el password
            return ret;
        }
    }
})
export class Usuario {
    @Prop({
        required: true,
        unique: true,
        index: true // Índice para búsquedas más rápidas
    })
    idusuario: number;

    @Prop({
        required: true,
        trim: true // Elimina espacios en blanco
    })
    nombre: string;

    @Prop({
        required: true,
        unique: true,
        index: true
    })
    documento: number;

    @Prop({ required: true, trim: true })
    cargo: string;

    @Prop({ trim: true, default: 'Ninguno' })
    vehiculo: string;

    @Prop({ trim: true, default: '' })
    matricula: string;

    @Prop({ 
        required: true,
        enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
    })
    RH: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true, 
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido'] 
    })
    correo: string;

    @Prop({ required: true, trim: true })
    direccion: string;

    @Prop({
        required: true,
        unique: true
    })
    celular: number;

    @Prop({ trim: true })
    elementos: string;

    @Prop({ 
        required: true,
        enum: ['Admin', 'Empleado', 'Supervisor', 'Vigilante','admin', 'empleado', 'supervisor', 'vigilante'],
        default: 'usuario'
    })
    rol: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    })
    username: string;

    @Prop({
        required: true,
        select: false // No incluir en queries por defecto
    })
    password: string;

    @Prop({ default: true })
    activo: boolean; // Para desactivar usuarios sin eliminarlos

    @Prop()
    ultimoLogin: Date;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

// Índices compuestos para mejorar rendimiento
UsuarioSchema.index({ username: 1, activo: 1 });
UsuarioSchema.index({ correo: 1, activo: 1 });