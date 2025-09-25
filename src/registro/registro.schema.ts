import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SesionLaboralDocument = SesionLaboral & Document;

@Schema()
export class SesionLaboral {
  @Prop({ required: true })
  idusuario: string;

  @Prop({ required: true })
  inicio: Date;

  @Prop()
  fin?: Date;

  @Prop({ default: 'activa' })
  estado: 'activa' | 'finalizada';

  @Prop()
  duracion?: number; // en segundos
}

export const SesionLaboralSchema = SchemaFactory.createForClass(SesionLaboral);
