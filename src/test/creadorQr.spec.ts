// src/test/creadorQr.spec.ts
import { QrcodeService } from 'src/creador-qr/creador-qr.service';
import * as QRCode from 'qrcode';

describe('QrcodeService', () => {
  let service: QrcodeService;
  let usuarioModel: any;

  beforeEach(() => {
    usuarioModel = {
      findOne: jest.fn(),
    };

    service = new QrcodeService(usuarioModel);
  });

  it('debería generar código QR si el usuario existe', async () => {
    usuarioModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ idusuario: 1 }),
    });

    jest.spyOn(QRCode, 'toDataURL').mockImplementation(async () => 'data:image/png;base64,qrcode');

    const result = await service.generateQRCode(1);
    expect(result).toContain('data:image/png');
  });

  it('debería lanzar error si el usuario no existe', async () => {
    usuarioModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.generateQRCode(1)).rejects.toThrow('Usuario no encontrado');
  });
});
