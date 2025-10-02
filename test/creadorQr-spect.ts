import { Test, TestingModule } from '@nestjs/testing';
import { QrcodeService } from './qrcode.service';
import { getModelToken } from '@nestjs/mongoose';
import { Usuario } from 'src/usuario/usuario.schema';
import * as QRCode from 'qrcode';
import { NotFoundException } from '@nestjs/common';

describe('QrcodeService', () => {
  let service: QrcodeService;
  let usuarioModel: any;

  beforeEach(async () => {
    usuarioModel = {
      findOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrcodeService,
        { provide: getModelToken(Usuario.name), useValue: usuarioModel },
      ],
    }).compile();

    service = module.get<QrcodeService>(QrcodeService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('generateQRCode', () => {
    it('debe generar un código QR correctamente', async () => {
      const mockUsuario = { idusuario: 1, nombre: 'Juan', correo: 'juan@mail.com' };
      usuarioModel.exec.mockResolvedValue(mockUsuario);

      // Mock de QRCode
      const qrDataUrl = 'data:image/png;base64,mock';
      jest.spyOn(QRCode, 'toDataURL').mockResolvedValue(qrDataUrl);

      const result = await service.generateQRCode(1);

      expect(usuarioModel.findOne).toHaveBeenCalledWith({ idusuario: 1 });
      expect(result).toBe(qrDataUrl);
    });

    it('debe lanzar NotFoundException si no existe el usuario', async () => {
      usuarioModel.exec.mockResolvedValue(null);

      await expect(service.generateQRCode(999)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar un error si falla QRCode.toDataURL', async () => {
      const mockUsuario = { idusuario: 1, nombre: 'Juan', correo: 'juan@mail.com' };
      usuarioModel.exec.mockResolvedValue(mockUsuario);

      jest.spyOn(QRCode, 'toDataURL').mockRejectedValue(new Error('QR error'));

      await expect(service.generateQRCode(1)).rejects.toThrow('Error al generar el código QR: QR error');
    });
  });
});
