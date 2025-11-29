import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiculoController } from './vehiculo.controller';
import { VehiculoService } from './vehiculo.service';
import { Vehiculo, VehiculoSchema } from './vehiculo.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Vehiculo.name, schema: VehiculoSchema }
        ])
    ],
    controllers: [VehiculoController],
    providers: [VehiculoService],
    exports: [VehiculoService]
})
export class VehiculoModule {}