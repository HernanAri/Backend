import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from 'src/usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { AutenticadorService } from 'src/autenticador/autenticador.service';

describe('AutenticadorService', () => {
  let service: AutenticadorService;
  let usuarioService: Partial<UsuarioService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    // Mock de UsuarioService
    usuarioService = {
      findOne: jest.fn(),
    };

    // Mock de JwtService
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticadorService,
        { provide: UsuarioService, useValue: usuarioService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AutenticadorService>(AutenticadorService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('ValidarUser', () => {
    it('debe retornar el usuario sin contraseña si las credenciales son correctas', async () => {
      const mockUser = { idusuario: 1, username: 'test', password: '1234', email: 'a@b.com' };
      (usuarioService.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.ValidarUser('test', '1234');

      expect(result).toEqual({
        idusuario: 1,
        username: 'test',
        email: 'a@b.com',
      });
      expect(usuarioService.findOne).toHaveBeenCalledWith('test');
    });

    it('debe retornar null si el usuario no existe', async () => {
      (usuarioService.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.ValidarUser('noexiste', '1234');

      expect(result).toBeNull();
    });

    it('debe retornar null si la contraseña es incorrecta', async () => {
      const mockUser = { idusuario: 1, username: 'test', password: '1234' };
      (usuarioService.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.ValidarUser('test', 'wrongpass');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('debe retornar un token JWT', async () => {
      const mockUser = { idusuario: 1, username: 'test' };
      (jwtService.sign as jest.Mock).mockReturnValue('mocked_token');

      const result = await service.login(mockUser);

      expect(result).toEqual({ access_token: 'mocked_token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'test',
        sub: 1,
      });
    });
  });
});
