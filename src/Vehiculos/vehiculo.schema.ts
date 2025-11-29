import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehiculoDocument = Vehiculo & Document;

@Schema({
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
})
export class Vehiculo {
    @Prop({
        required: true,
        unique: true,
        index: true
    })
    idvehiculo: number;

    @Prop({
        required: true,
        index: true
    })
    idusuario: number;

    @Prop({ required: true, trim: true })
    nombrePropietario: string;

    @Prop({ required: true, trim: true })
    documentoPropietario: string;

    @Prop({ 
        required: true,
        enum: ['Moto', 'Carro'],
        trim: true
    })
    tipoVehiculo: string;

    @Prop({ 
        required: true,
        uppercase: true,
        trim: true,
        index: true
    })
    matricula: string;

    @Prop({ trim: true })
    marca: string;

    @Prop({ trim: true })
    modelo: string;

    @Prop({ trim: true })
    color: string;

    @Prop({ 
        required: true,
        default: Date.now
    })
    horaIngreso: Date;

    @Prop({ 
        default: null
    })
    horaSalida: Date;

    @Prop({ 
        required: true,
        enum: ['dentro', 'fuera'],
        default: 'dentro'
    })
    estado: string;

    @Prop({ 
        required: true,
        trim: true
    })
    registradoPor: string; // Username del vigilante

    @Prop({ trim: true })
    observaciones: string;
}

export const VehiculoSchema = SchemaFactory.createForClass(Vehiculo);

// Índices compuestos
VehiculoSchema.index({ matricula: 1, estado: 1 });
VehiculoSchema.index({ idusuario: 1, estado: 1 });
VehiculoSchema.index({ horaIngreso: -1 });