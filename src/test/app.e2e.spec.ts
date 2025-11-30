import { AppService } from '../app.service';


describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('debería retornar una cadena vacía', () => {
    expect(service.getHello()).toBe('');
  });
});
