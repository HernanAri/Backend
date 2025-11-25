// src/test/usuario.spec.ts
import { UsuarioService } from 'src/usuario/usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let userModel: any;

  beforeEach(() => {
    userModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
      save: jest.fn(),
    };

    service = new UsuarioService(userModel);
  });

  it('debería retornar todos los usuarios', () => {
    userModel.find.mockReturnValue('todos');
    expect(service.findAll()).toBe('todos');
  });

  it('debería lanzar error si no encuentra usuario por id', async () => {
    userModel.findOne.mockResolvedValue(null);
    await expect(service.findOne('123')).rejects.toThrow('Usuario no encontrado');
  });

  it('debería eliminar usuario por username', async () => {
    userModel.findOneAndDelete.mockResolvedValue({ username: 'test' });
    const result = await service.eliminar('test');
    expect(result.username).toBe('test');
  });
});
