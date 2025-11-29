import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehiculo, VehiculoDocument } from './vehiculo.schema';
import { CrearVehiculoDto, RegistrarSalidaDto } from './vehiculo.dto';

@Injectable()
export class VehiculoService {
    constructor(
        @InjectModel(Vehiculo.name)
        private vehiculoModel: Model<VehiculoDocument>
    ) {}

    async registrarIngreso(crearVehiculoDto: CrearVehiculoDto): Promise<Vehiculo> {
        // Verifica si el vehículo ya está dentro
        const vehiculoExistente = await this.vehiculoModel.findOne({
            matricula: crearVehiculoDto.matricula.toUpperCase(),
            estado: 'dentro'
        }).exec();

        if (vehiculoExistente) {
            throw new BadRequestException('Este vehículo ya está registrado como dentro de las instalaciones');
        }

        // Genera un ID único
        const ultimoVehiculo = await this.vehiculoModel
            .findOne()
            .sort({ idvehiculo: -1 })
            .exec();
        
        const nuevoId = ultimoVehiculo ? ultimoVehiculo.idvehiculo + 1 : 1;

        const nuevoVehiculo = new this.vehiculoModel({
            ...crearVehiculoDto,
            idvehiculo: nuevoId,
            matricula: crearVehiculoDto.matricula.toUpperCase(),
            horaIngreso: new Date(),
            estado: 'dentro'
        });

        return await nuevoVehiculo.save();
    }

    async registrarSalida(registrarSalidaDto: RegistrarSalidaDto): Promise<Vehiculo> {
        const vehiculo = await this.vehiculoModel.findOne({
            matricula: registrarSalidaDto.matricula.toUpperCase(),
            estado: 'dentro'
        }).exec();

        if (!vehiculo) {
            throw new NotFoundException('No se encontró el vehículo dentro de las instalaciones');
        }

        vehiculo.horaSalida = new Date();
        vehiculo.estado = 'fuera';
        
        if (registrarSalidaDto.observaciones) {
            vehiculo.observaciones = registrarSalidaDto.observaciones;
        }

        return await vehiculo.save();
    }

    async obtenerVehiculosDentro(): Promise<Vehiculo[]> {
        return await this.vehiculoModel
            .find({ estado: 'dentro' })
            .sort({ horaIngreso: -1 })
            .exec();
    }

    async obtenerTodosVehiculos(): Promise<Vehiculo[]> {
        return await this.vehiculoModel
            .find()
            .sort({ horaIngreso: -1 })
            .exec();
    }

    async obtenerVehiculosPorUsuario(idusuario: number): Promise<Vehiculo[]> {
        return await this.vehiculoModel
            .find({ idusuario })
            .sort({ horaIngreso: -1 })
            .exec();
    }

    async obtenerVehiculoPorMatricula(matricula: string): Promise<Vehiculo> {
        const vehiculo = await this.vehiculoModel
            .findOne({ 
                matricula: matricula.toUpperCase(),
                estado: 'dentro'
            })
            .exec();

        if (!vehiculo) {
            throw new NotFoundException('Vehículo no encontrado o ya ha salido');
        }

        return vehiculo;
    }

    async obtenerEstadisticas() {
        const total = await this.vehiculoModel.countDocuments().exec();
        const dentro = await this.vehiculoModel.countDocuments({ estado: 'dentro' }).exec();
        const fuera = await this.vehiculoModel.countDocuments({ estado: 'fuera' }).exec();
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const ingresoHoy = await this.vehiculoModel.countDocuments({
            horaIngreso: { $gte: hoy }
        }).exec();

        return {
            total,
            dentro,
            fuera,
            ingresoHoy
        };
    }
}