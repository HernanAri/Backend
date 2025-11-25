import { 
  Injectable, 
  ConflictException, 
  NotFoundException,
  UnauthorizedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { SesionLaboral, SesionLaboralDocument } from './registro.schema';
import { Usuario } from 'src/usuario/usuario.schema';

@Injectable()
export class RegistroService {
  constructor(
    @InjectModel(SesionLaboral.name)
    private sesionModel: Model<SesionLaboralDocument>,
    @InjectModel(Usuario.name)
    private usuarioModel: Model<Usuario>,
    private jwtService: JwtService
  ) {}

  // Método para verificar y extraer datos del token
  private async verificarToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      
      // Verifica que el token sea del tipo correcto
      if (decoded.tipo !== 'qr-auth') {
        throw new UnauthorizedException('Token inválido');
      }

      // Verifica que el usuario existe
      const usuario = await this.usuarioModel.findOne({ 
        idusuario: decoded.idusuario 
      }).exec();

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return {
        idusuario: decoded.idusuario,
        usuario: usuario
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('El código QR ha expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      }
      throw error;
    }
  }

  // Nuevo método para iniciar sesión con token
  async iniciarSesionConToken(token: string) {
    const { idusuario, usuario } = await this.verificarToken(token);

    // Verifica si hay una sesión activa
    const sesionActiva = await this.sesionModel.findOne({
      idusuario: idusuario.toString(),
      estado: 'activa'
    });

    if (sesionActiva) {
      throw new ConflictException('Ya existe una sesión activa para este usuario');
    }

    // Crea la nueva sesión
    const nuevaSesion = new this.sesionModel({
      idusuario: idusuario.toString(),
      inicio: new Date(),
      estado: 'activa'
    });

    const sesionGuardada = await nuevaSesion.save();

    return {
      mensaje: 'Sesión iniciada exitosamente',
      sesion: sesionGuardada,
      usuario: {
        idusuario: usuario.idusuario,
        nombre: usuario.nombre,
        // Agrega otros campos que necesites
      }
    };
  }

  // Nuevo método para finalizar sesión con token
  async finalizarSesionConToken(token: string) {
    const { idusuario, usuario } = await this.verificarToken(token);

    const sesion = await this.sesionModel.findOne({
      idusuario: idusuario.toString(),
      estado: 'activa'
    });

    if (!sesion) {
      throw new NotFoundException('No hay sesión activa para este usuario');
    }

    const fin = new Date();
    const duracion = Math.floor((fin.getTime() - sesion.inicio.getTime()) / 1000);

    sesion.fin = fin;
    sesion.duracion = duracion;
    sesion.estado = 'finalizada';

    const sesionFinalizada = await sesion.save();

    const horas = (duracion / 3600).toFixed(2);
    const minutos = Math.floor((duracion % 3600) / 60);

    return {
      mensaje: 'Sesión finalizada exitosamente',
      sesion: sesionFinalizada,
      usuario: {
        idusuario: usuario.idusuario,
        nombre: usuario.nombre,
      },
      duracion: {
        segundos: duracion,
        horas: horas,
        formato: `${horas} horas y ${minutos} minutos`
      }
    };
  }

  // Métodos antiguos (mantenerlos por compatibilidad)
  async iniciarSesion(idusuario: string) {
    const sesionActiva = await this.sesionModel.findOne({
      idusuario,
      estado: 'activa'
    });
    
    if (sesionActiva) {
      throw new ConflictException('La sesión ya está activa');
    }

    const nuevaSesion = new this.sesionModel({
      idusuario,
      inicio: new Date(),
      estado: 'activa'
    });
    
    return nuevaSesion.save();
  }

  async finalizarSesion(idusuario: string) {
    const sesion = await this.sesionModel.findOne({
      idusuario,
      estado: 'activa'
    });
    
    if (!sesion) {
      throw new NotFoundException('No hay sesión activa');
    }

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

  async obtenerResumenSemanal(idusuario: string) {
    const semanaPasada = new Date();
    semanaPasada.setDate(semanaPasada.getDate() - 7);

    const sesiones = await this.sesionModel.find({
      idusuario,
      inicio: { $gte: semanaPasada }
    });

    const totalSegundos = sesiones.reduce((acc, s) => acc + (s.duracion || 0), 0);
    const horas = (totalSegundos / 3600).toFixed(2);

    return {
      totalHoras: horas,
      cantidadSesiones: sesiones.length,
      sesiones
    };
  }
}