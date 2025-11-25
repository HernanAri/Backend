// src/test/autenticador.spec.ts
import { AutenticadorService } from 'src/autenticador/autenticador.service';
import { UsuarioService } from 'src/usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';

describe('AutenticadorService', () => {
  let service: AutenticadorService;
  let usuarioService: UsuarioService;
  let jwtService: JwtService;

  beforeEach(() => {
    usuarioService = {
      findOne: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn().mockReturnValue('token123'),
    } as any;

    service = new AutenticadorService(usuarioService, jwtService);
  });

  it('debería validar usuario correctamente', async () => {
    const mockUser = { username: 'test', password: '1234', idusuario: '1' };
    (usuarioService.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await service.ValidarUser('test', '1234');
    expect(result).toEqual({ username: 'test', idusuario: '1' });
  });

  it('debería retornar null si la contraseña es incorrecta', async () => {
    const mockUser = { username: 'test', password: 'wrong' };
    (usuarioService.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await service.ValidarUser('test', '1234');
    expect(result).toBeNull();
  });

  it('debería generar token en login', async () => {
    const user = { username: 'test', idusuario: '1' };
    const result = await service.login(user);
    expect(result.access_token).toBe('token123');
  });
});
