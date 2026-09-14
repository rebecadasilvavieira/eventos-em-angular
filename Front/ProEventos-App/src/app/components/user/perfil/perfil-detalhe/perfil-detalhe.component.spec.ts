/* tslint:disable:no-unused-variable */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { PerfilDetalheComponent } from './perfil-detalhe.component';
import { AccountService } from '@app/services/account.service';
import { PalestranteService } from '@app/services/palestrante.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

describe('PerfilDetalheComponent', () => {
  let component: PerfilDetalheComponent;
  let fixture: ComponentFixture<PerfilDetalheComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [PerfilDetalheComponent],
      providers: [
        {
          provide: AccountService,
          useValue: {
            getUser: jasmine.createSpy('getUser').and.returnValue(of({})),
            updateUser: jasmine.createSpy('updateUser').and.returnValue(of({})),
          },
        },
        {
          provide: PalestranteService,
          useValue: {
            post: jasmine.createSpy('post').and.returnValue(of({})),
          },
        },
        { provide: ToastrService, useValue: { success: jasmine.createSpy('success'), error: jasmine.createSpy('error') } },
        { provide: NgxSpinnerService, useValue: { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.f.userName.clearAsyncValidators();
    component.f.userName.setValue('usuario-teste');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('carrega o nome cadastrado no campo usuario e o email no campo separado', () => {
    (TestBed.inject(AccountService).getUser as jasmine.Spy).and.returnValue(of({
      userName: 'Fernanda', email: 'fernanda@example.com'
    }));
    (component as any).carregarUsuario();
    fixture.detectChanges();
    const usuario: HTMLInputElement = fixture.nativeElement.querySelector('#perfil-usuario');
    const email: HTMLInputElement = fixture.nativeElement.querySelector('[formControlName="email"]');
    expect(usuario.value).toBe('Fernanda');
    expect(email.value).toBe('fernanda@example.com');
    expect(usuario.autocomplete).toBe('off');
  });
  it('nao envia a foto antiga ao salvar os dados do perfil', () => {
    component.form.patchValue({ userName: 'novo', imagemURL: 'antiga.png', funcao: 'Participante' });
    component.atualizarUsuario();
    const dados = (TestBed.inject(AccountService).updateUser as jasmine.Spy).calls.mostRecent().args[0];
    expect(dados.imagemURL).toBeUndefined();
  });
  it('atualiza a previa ao digitar sem publicar alteracoes de funcao ou senha', () => {
    spyOn(component.previewChange, 'emit');
    spyOn(component.changeFormValue, 'emit');
    component.form.patchValue({ primeiroNome: 'Lucas', ultimoNome: 'Almeida', descricao: 'Nova descrição', funcao: 'Participante', password: 'segredo' });
    expect(component.previewChange.emit).toHaveBeenCalledWith({ primeiroNome: 'Lucas', ultimoNome: 'Almeida', descricao: 'Nova descrição' });
    expect(component.changeFormValue.emit).not.toHaveBeenCalled();
    expect(TestBed.inject(AccountService).updateUser).not.toHaveBeenCalled();
  });
  it('restaura a previa salva ao cancelar alteracoes', () => {
    component.userUpdate.primeiroNome = 'Lucas';
    component.userUpdate.ultimoNome = 'Almeida';
    component.userUpdate.descricao = 'Descrição salva';
    component.form.patchValue({ descricao: 'Rascunho' });
    spyOn(component.previewChange, 'emit');
    component.resetForm({ preventDefault: () => {} });
    expect(component.previewChange.emit).toHaveBeenCalledWith({ primeiroNome: 'Lucas', ultimoNome: 'Almeida', descricao: 'Descrição salva' });
  });
  it('publica a funcao e os contadores retornados apos salvar como participante', () => {
    const account = TestBed.inject(AccountService);
    const retorno = { funcao: 'Participante', totalEventosCriados: 2, totalEventosComoPalestrante: 0 };
    (account.getUser as jasmine.Spy).and.returnValue(of(retorno));
    component.form.patchValue({ funcao: 'Participante' });
    spyOn(component.changeFormValue, 'emit');
    component.atualizarUsuario();
    expect(account.updateUser).toHaveBeenCalled();
    expect(component.changeFormValue.emit).toHaveBeenCalledWith(retorno);
    expect(TestBed.inject(PalestranteService).post).not.toHaveBeenCalled();
  });
  it('nao altera o perfil exibido se o salvamento falha', () => {
    (TestBed.inject(AccountService).updateUser as jasmine.Spy).and.returnValue(throwError(new Error('Falha')));
    component.userUpdate.funcao = 'Palestrante';
    component.form.patchValue({ funcao: 'Participante' });
    spyOn(component.changeFormValue, 'emit');
    spyOn(console, 'error');
    component.atualizarUsuario();
    expect(component.changeFormValue.emit).not.toHaveBeenCalled();
    expect(component.userUpdate.funcao).toBe('Palestrante');
  });
});
