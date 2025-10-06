import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SesionLaboral, SesionLaboralDocument } from './registro.schema';
import { Model } from 'mongoose';

@Injectable()
export class RegistroService {
  constructor(
    @InjectModel(SesionLaboral.name)
    private sesionModel: Model<SesionLaboralDocument>
  ) {}

  async iniciarSesion(idusuario: string) {
  const usuario = await this.sesionModel.findOne({ idusuario });
  if (!usuario) {
    throw new NotFoundException('Usuario no encontrado');
  }

    const nuevaSesion = new this.sesionModel({
      idusuario,
      inicio: new Date(),
      estado: 'activa'
    });

    return nuevaSesion.save();
  }

  async finalizarSesion(idusuario: string) {
    const sesion = await this.sesionModel.findOne({ idusuario, estado: 'activa' });
    if (!sesion) throw new NotFoundException('No hay sesión activa');

    const fin = new Date();
    const duracion = Math.floor((fin.getTime() - sesion.inicio.getTime()) / 1000);

    sesion.fin = fin;
    sesion.duracion = duracion;
    sesion.estado = 'finalizada';

    return sesion.save();
  }

  async obtenerSesiones(idusuario: string) {
    return this.sesionModel.find({ idusuario }).sort({ inicio: -1 }).exec();
  }
}
