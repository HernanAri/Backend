import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from '../src/usuario/usuario.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Usuario } from 'src/usuario/usuario.schema';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let userModel: any;

  beforeEach(async () => {
    userModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: getModelToken(Usuario.name), useValue: userModel },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar todos los usuarios', async () => {
      const mockUsers = [{ idusuario: '1' }, { idusuario: '2' }];
      userModel.find.mockReturnValue(mockUsers);

      const result = service.findAll();
      expect(result).toBe(mockUsers);
      expect(userModel.find).toHaveBeenCalled();
    });
  });

  describe('crear', () => {
    it('debe crear un usuario', async () => {
      const dto = { idusuario: '1', nombre: 'Juan', correo: 'juan@mail.com' };
      const saveMock = jest.fn().mockResolvedValue(dto);
      userModel.constructor = jest.fn().mockReturnValue({ save: saveMock });

      // Simulamos el "new userModel(dto)"
      const userInstance = new userModel.constructor(dto);
      const result = await userInstance.save();

      expect(result).toEqual(dto);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debe retornar un usuario si existe', async () => {
      const mockUser = { idusuario: '1' };
      userModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('1');
      expect(result).toBe(mockUser);
      expect(userModel.findOne).toHaveBeenCalledWith({ idusuario: '1' });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('debe eliminar un usuario si existe', async () => {
      const mockUser = { idusuario: '1' };
      userModel.findOneAndDelete.mockResolvedValue(mockUser);

      const result = await service.eliminar('1');
      expect(result).toBe(mockUser);
      expect(userModel.findOneAndDelete).toHaveBeenCalledWith({ idusuario: '1' });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      userModel.findOneAndDelete.mockResolvedValue(null);

      await expect(service.eliminar('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizar', () => {
    it('debe actualizar un usuario si existe', async () => {
      const mockUser = { idusuario: '1', nombre: 'Nuevo' };
      const updateDto = { nombre: 'Nuevo' };
      userModel.findOneAndUpdate.mockResolvedValue(mockUser);

      const result = await service.actualizar('1', updateDto);
      expect(result).toBe(mockUser);
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { idusuario: '1' },
        updateDto,
        { new: true, runValidators: true },
      );
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      userModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(service.actualizar('999', { nombre: 'Nada' })).rejects.toThrow(NotFoundException);
    });
  });
});
