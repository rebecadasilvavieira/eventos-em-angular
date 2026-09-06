import { fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NEVER, of, throwError } from 'rxjs';
import { EventoDetalheComponent } from './evento-detalhe.component';

describe('Carregamento do evento', () => {
  let component: EventoDetalheComponent;
  let spinner: any;
  let service: any;
  let toastr: any;
  beforeEach(() => {
    spinner = { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') };
    service = { post: jasmine.createSpy('post').and.returnValue(of({ id: 7 })), getEventoById: jasmine.createSpy('get').and.returnValue(NEVER) };
    toastr = { success: () => {}, warning: jasmine.createSpy('warning'), error: jasmine.createSpy('error') };
    component = new EventoDetalheComponent(new FormBuilder(), { use: () => {} } as any,
      { snapshot: { paramMap: { get: () => '7' } } } as any, service, spinner, toastr,
      null as any, { navigate: () => {} } as any, { getLotesById: () => of([]) } as any, null as any);
    component.validation();
    spyOn(console, 'error');
  });
  function preencher(): void {
    component.form.patchValue({ tema: 'Evento Angular', local: 'Sao Paulo', dataEvento: '2026-09-09', qtdPessoas: 100, telefone: '(11) 99999-9999', email: 'teste@example.com' });
  }
  it('nao abre o indicador quando o formulario esta invalido', () => {
    component.salvarEvento();
    expect(spinner.show).not.toHaveBeenCalled();
    expect(service.post).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalled();
    expect(component.form.get('tema')?.touched).toBeTrue();
  });
  it('nao bloqueia a pagina se houver um lote incompleto', () => {
    preencher();
    component.adicionarLote();
    component.salvarEvento();
    expect(spinner.show).not.toHaveBeenCalled();
  });
  it('fecha o indicador apos salvar', () => {
    preencher(); component.salvarEvento();
    expect(spinner.show).toHaveBeenCalled();
    expect(spinner.hide).toHaveBeenCalled();
  });
  it('fecha o indicador quando a API retorna erro', () => {
    preencher(); service.post.and.returnValue(throwError(new Error('Falha')));
    component.salvarEvento();
    expect(spinner.hide).toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalled();
  });
  it('encerra a espera quando a API nao responde ao salvamento', fakeAsync(() => {
    preencher(); service.post.and.returnValue(NEVER);
    component.salvarEvento(); tick(30001);
    expect(spinner.hide).toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalled();
  }));
  it('encerra a espera quando o carregamento inicial nao responde', fakeAsync(() => {
    component.carregarEvento(); tick(30001);
    expect(spinner.hide).toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalled();
  }));
  it('cancela requisicoes e fecha o indicador ao sair da pagina', fakeAsync(() => {
    component.carregarEvento(); component.ngOnDestroy(); tick(30001);
    expect(spinner.hide).toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  }));
});
