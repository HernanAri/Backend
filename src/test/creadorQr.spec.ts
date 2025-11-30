import { QrcodeService } from '../creador-qr/creador-qr.service';
import * as QRCode from 'qrcode';
import { JwtService } from '@nestjs/jwt';

describe('QrcodeService', () => {
  let service: QrcodeService;
  let usuarioModel: any;
  let jwtService: JwtService;
  let fakeQuery: any;

  beforeEach(() => {
    fakeQuery = {
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    usuarioModel = {
      findOne: jest.fn().mockReturnValue(fakeQuery),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('token-mock'),
      verify: jest.fn(),
    } as any;

    service = new QrcodeService(usuarioModel, jwtService);
  });

  it('debería generar código QR si el usuario existe', async () => {
    fakeQuery.exec.mockResolvedValue({ idusuario: 1 });

    jest
      .spyOn(QRCode as any, 'toDataURL')
      .mockImplementation(async () => 'data:image/png;base64,qrcode');

    const result = await service.generateQRCode(1);
    expect(result).toContain('data:image/png');
  });

  it('debería lanzar error si el usuario no existe', async () => {
    fakeQuery.exec.mockResolvedValue(null);

    await expect(service.generateQRCode(1)).rejects.toThrow('Usuario no encontrado');
  });
});
