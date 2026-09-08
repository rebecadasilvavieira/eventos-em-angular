import { fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NEVER, of, throwError } from 'rxjs';
import { PalestranteDetalheComponent } from './palestrante-detalhe.component';

describe('Carregamento do perfil do palestrante', () => {
  let component: PalestranteDetalheComponent;
  let service: any;
  let spinner: any;
  let toastr: any;

  beforeEach(() => {
    service = { getPalestrante: jasmine.createSpy().and.returnValue(of({ miniCurriculo: 'Teste' })) };
    spinner = { show: jasmine.createSpy(), hide: jasmine.createSpy() };
    toastr = { error: jasmine.createSpy() };
    component = new PalestranteDetalheComponent(new FormBuilder(), service, toastr, spinner);
  });

  afterEach(() => component.ngOnDestroy());

  it('fecha o indicador ao receber o perfil', () => {
    component.ngOnInit();
    expect(component.form.value.miniCurriculo).toBe('Teste');
    expect(spinner.hide).toHaveBeenCalled();
  });

  it('fecha o indicador quando a consulta falha', () => {
    service.getPalestrante.and.returnValue(throwError(new Error('Falha')));
    component.ngOnInit();
    expect(spinner.hide).toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalled();
  });

  it('encerra a espera se a API nao responder', fakeAsync(() => {
    service.getPalestrante.and.returnValue(NEVER);
    component.ngOnInit();
    tick(30001);
    expect(spinner.hide).toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalled();
  }));

  it('cancela a consulta ao sair do perfil', fakeAsync(() => {
    service.getPalestrante.and.returnValue(NEVER);
    component.ngOnInit();
    component.ngOnDestroy();
    tick(30001);
    expect(spinner.hide).toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  }));
});
