import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { User } from '@app/models/identity/User';

import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AccountService]
    });
    service = TestBed.inject(AccountService);
    http = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');
  });
  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('atualiza o menu quando cadastra uma conta depois de sair de outra', () => {
    const estados: Array<string | null> = [];
    service.currentUser$.subscribe(user => estados.push(user?.userName || null));
    service.setCurrentUser({ userName: 'primeiro' } as User);
    service.logout();
    service.register({ userName: 'novo' }).subscribe();
    http.expectOne(service.baseUrl + 'register').flush({ userName: 'novo', token: 'token-teste' });
    expect(estados).toEqual([null, 'primeiro', null, 'novo']);
  });
  it('continua atualizando a sessao depois de varios logins e logouts', () => {
    let usuario: User | null = null;
    service.currentUser$.subscribe(user => usuario = user);
    service.logout();
    service.login({}).subscribe();
    http.expectOne(service.baseUrl + 'login').flush({ userName: 'ana', token: 'token-teste' });
    expect(usuario?.userName).toBe('ana');
    service.logout();
    service.login({}).subscribe();
    http.expectOne(service.baseUrl + 'login').flush({ userName: 'bia', token: 'token-teste' });
    expect(usuario?.userName).toBe('bia');
  });
});
