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
    console.log('🔐 Verificando contraseñas en la base de datos...\n');
    
    try {
      // ✅ CRÍTICO: Incluye el campo password con select('+password')
      const users = await this.usuarioModel
        .find({})
        .select('+password') // ← ESTO ES CLAVE
        .exec();
      
      console.log(`📊 Total de usuarios encontrados: ${users.length}\n`);

      let alreadyHashed = 0;
      let plainText = 0;
      let missing = 0;

      for (const user of users) {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`👤 Usuario: ${user.username} (ID: ${user.idusuario})`);
        
        // Caso 1: Sin contraseña
        if (!user.password || user.password === '') {
          console.log(`   ⚠️  Estado: SIN CONTRASEÑA`);
          console.log(`   💡 Acción necesaria: Crear contraseña para este usuario`);
          missing++;
        }
        // Caso 2: Ya hasheada
        else if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
          console.log(`   ✅ Estado: Ya hasheada`);
          console.log(`   🔐 Hash: ${user.password.substring(0, 25)}...`);
          alreadyHashed++;
        }
        // Caso 3: Texto plano - hashear
        else {
          console.log(`   ⚠️  Estado: TEXTO PLANO DETECTADO`);
          console.log(`   🔓 Contraseña actual: ${user.password}`);
          
          const hashedPassword = await bcrypt.hash(user.password, 10);
          
          await this.usuarioModel.updateOne(
            { _id: user._id },
            { password: hashedPassword }
          );
          
          console.log(`   ✅ Contraseña hasheada correctamente`);
          console.log(`   🔐 Nuevo hash: ${hashedPassword.substring(0, 25)}...`);
          plainText++;
        }
      }
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log('📊 RESUMEN FINAL:');
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`✅ Ya hasheadas: ${alreadyHashed}`);
      console.log(`🔄 Convertidas a hash: ${plainText}`);
      console.log(`⚠️  Sin contraseña: ${missing}`);
      console.log(`📝 Total procesados: ${users.length}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

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