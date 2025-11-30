import { RegistroService } from '../registro/registro.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RegistroService', () => {
  let service: RegistroService;
  let sesionModel: any;
  let usuarioModel: any;
  let jwtService: any;

  beforeEach(() => {

    sesionModel = jest.fn();              
    sesionModel.findOne = jest.fn();
    sesionModel.find = jest.fn();

    usuarioModel = {
      findOne: jest.fn(),
    };

    jwtService = {
      verify: jest.fn(),
    };

    service = new RegistroService(
      sesionModel as any,
      usuarioModel as any,
      jwtService as any,
    );
  });


  it('debería iniciar sesión con token válido', async () => {
    jwtService.verify.mockReturnValue({
      idusuario: 1,
      tipo: 'qr-auth',
    });

    usuarioModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ idusuario: 1, nombre: 'Juan' }),
    });

    sesionModel.findOne.mockResolvedValue(null);


    const mockSave = jest.fn().mockResolvedValue({
      idusuario: '1',
      estado: 'activa',
    });


    sesionModel.mockImplementation(() => ({
      save: mockSave,
    }));

    const result = await service.iniciarSesionConToken('token123');

    expect(result.mensaje).toBe('Sesión iniciada exitosamente');
    expect(result.usuario.nombre).toBe('Juan');
  });

  it('debería fallar si ya existe una sesión activa', async () => {
    jwtService.verify.mockReturnValue({
      idusuario: 1,
      tipo: 'qr-auth',
    });

    usuarioModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ idusuario: 1 }),
    });

    sesionModel.findOne.mockResolvedValue({ estado: 'activa' });

    await expect(service.iniciarSesionConToken('token'))
      .rejects.toThrow(ConflictException);
  });

  it('debería finalizar sesión con token válido', async () => {
    jwtService.verify.mockReturnValue({
      idusuario: 1,
      tipo: 'qr-auth',
    });

    usuarioModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ idusuario: 1, nombre: 'Juan' }),
    });

    sesionModel.findOne.mockResolvedValue({
      inicio: new Date(Date.now() - 5000),
      estado: 'activa',
      save: jest.fn().mockResolvedValue({ estado: 'finalizada' }),
    });

    const result = await service.finalizarSesionConToken('token');

    expect(result.mensaje).toBe('Sesión finalizada exitosamente');
    expect(result.usuario.nombre).toBe('Juan');
  });

  it('debería fallar si no existe sesión activa', async () => {
    jwtService.verify.mockReturnValue({
      idusuario: 1,
      tipo: 'qr-auth',
    });

    usuarioModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ idusuario: 1 }),
    });

    sesionModel.findOne.mockResolvedValue(null);

    await expect(service.finalizarSesionConToken('token'))
      .rejects.toThrow(NotFoundException);
  });

  it('debería iniciar sesión antigua', async () => {
    sesionModel.findOne.mockResolvedValue(null);

    const mockSave = jest.fn().mockResolvedValue({ estado: 'activa' });

    sesionModel.mockImplementation(() => ({
      save: mockSave,
    }));

    const result = await service.iniciarSesion('10');
    expect(result.estado).toBe('activa');
  });

  it('debería fallar al iniciar sesión si ya está activa', async () => {
    sesionModel.findOne.mockResolvedValue({ estado: 'activa' });

    await expect(service.iniciarSesion('10'))
      .rejects.toThrow(ConflictException);
  });

  it('debería finalizar sesión antigua', async () => {
    sesionModel.findOne.mockResolvedValue({
      inicio: new Date(Date.now() - 3000),
      estado: 'activa',
      save: jest.fn().mockResolvedValue({ estado: 'finalizada' }),
    });

    const result = await service.finalizarSesion('10');
    expect(result.estado).toBe('finalizada');
  });

  it('debería fallar al finalizar si no hay sesión activa', async () => {
    sesionModel.findOne.mockResolvedValue(null);

    await expect(service.finalizarSesion('10'))
      .rejects.toThrow(NotFoundException);
  });
});
