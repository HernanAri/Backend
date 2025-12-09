import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario/usuario.schema';

@Injectable()
export class PasswordMigrationService implements OnModuleInit {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  async onModuleInit() {
    // Descomenta para ejecutar
    //await this.checkAndHashPasswords();
  }

  async checkAndHashPasswords() {
    
    try {
      const users = await this.usuarioModel
        .find({})
        .select('+password') 
        .exec();
      
      let alreadyHashed = 0;
      let plainText = 0;
      let missing = 0;

      for (const user of users) {
        
        if (!user.password || user.password === '') {
          missing++;
        }
        // Caso 2: Ya hasheada
        else if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
          alreadyHashed++;
        }
        // Caso 3: Texto plano - hashear
        else {
          
          const hashedPassword = await bcrypt.hash(user.password, 10);
          
          await this.usuarioModel.updateOne(
            { _id: user._id },
            { password: hashedPassword }
          );
          plainText++;
        }
      }
      if (missing > 0) {
        console.log('⚠️  ATENCIÓN: Hay usuarios sin contraseña.');
        console.log('💡 Usa el siguiente endpoint para asignar contraseñas:');
        console.log('   POST /usuario/set-password');
        console.log('   { "username": "usuario", "password": "nueva_contraseña" }\n');
      }

    } catch (error) {
      console.error('❌ Error durante la verificación:', error);
      throw error;
    }
  }
}