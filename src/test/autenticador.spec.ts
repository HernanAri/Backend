import { AutenticadorService } from '../autenticador/autenticador.service';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

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

    (bcrypt.compare as jest.Mock).mockReset();

    service = new AutenticadorService(usuarioService, jwtService);
  });

  it('debería validar usuario correctamente', async () => {
    const mockUser = { username: 'test', password: 'hashedPass', idusuario: '1' };

    (usuarioService.findOne as jest.Mock).mockResolvedValue(mockUser);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.ValidarUser('test', '1234');

    expect(result).toEqual({
      username: 'test',
      idusuario: '1',
    });
  });

  it('debería retornar null si la contraseña es incorrecta', async () => {
    const mockUser = { username: 'test', password: 'hashedPass' };

    (usuarioService.findOne as jest.Mock).mockResolvedValue(mockUser);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await service.ValidarUser('test', '1234');

    expect(result).toBeNull();
  });

  it('debería generar token en login', async () => {
    const user = { username: 'test', idusuario: '1' };

    const result = await service.login(user);

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'test',
        sub: '1',
      })
    );

    expect(result.access_token).toBe('token123');
  });
});
