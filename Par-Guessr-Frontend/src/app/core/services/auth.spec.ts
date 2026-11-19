import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register an account and authenticate it', () => {
    expect(service.register('Usuário Teste', 'TESTE@EXAMPLE.COM', '123456')).toBe(true);
    service.logout();

    expect(service.login('teste@example.com', '123456')).toBe(true);
    expect(service.user()?.nick).toBe('Usuário Teste');
  });

  it('should reject duplicate accounts and invalid credentials', () => {
    service.register('Usuário Teste', 'teste@example.com', '123456');

    expect(service.register('Outro Usuário', 'TESTE@EXAMPLE.COM', 'abcdef')).toBe(false);
    service.logout();
    expect(service.login('teste@example.com', 'senha-incorreta')).toBe(false);
  });
});
