import { fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NEVER, of, Subject, throwError } from 'rxjs';
import { EventoDetalheComponent } from './evento-detalhe.component';

describe('Carregamento do evento', () => {
  let component: EventoDetalheComponent;
  let spinner: any;
  let service: any;
  let toastr: any;
  beforeEach(() => {
    spinner = { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') };
    service = {
      post: jasmine.createSpy('post').and.returnValue(of({ id: 7 })),
      put: jasmine.createSpy('put').and.returnValue(of({ id: 7 })),
      postUpload: jasmine.createSpy('postUpload').and.returnValue(of({})),
      getEventoById: jasmine.createSpy('get').and.returnValue(NEVER)
    };
    toastr = { success: () => {}, warning: jasmine.createSpy('warning'), error: jasmine.createSpy('error') };
    component = new EventoDetalheComponent(new FormBuilder(), { use: () => {} } as any,
      { snapshot: { paramMap: { get: () => '7' } } } as any, service, spinner, toastr,
      null as any, { navigate: () => {} } as any, { getLotesById: () => of([]) } as any, null as any);
    component.validation();
    spyOn(console, 'error');
  });
  function preencher(): void {
    component.form.patchValue({ tema: 'Evento Angular', local: 'Sao Paulo', dataEvento: '2026-09-09', qtdPessoas: 100, email: 'teste@example.com' });
  }
  it('envia a imagem somente depois de receber o id do novo evento', () => {
    preencher();
    const resposta = new Subject<any>();
    service.post.and.returnValue(resposta);
    service.postUpload.and.returnValue(of({ id: 7, imagemURL: 'foto-salva.png' }));
    const arquivo = new File(['foto'], 'evento.png', { type: 'image/png' });
    component.file = arquivo;
    component.salvarEvento();
    expect(service.postUpload).not.toHaveBeenCalled();
    component.salvarEvento();
    expect(service.post).toHaveBeenCalledTimes(1);
    resposta.next({ id: 7 });
    resposta.complete();
    expect(service.postUpload).toHaveBeenCalledWith(7, arquivo);
    expect(component.file).toBeUndefined();
    expect(component.form.value.imagemURL).toBe('foto-salva.png');
    expect(component.salvandoEvento).toBeFalse();
  });
  it('preserva a foto e usa o mesmo evento ao tentar novamente apos falha no upload', () => {
    preencher();
    const arquivo = new File(['foto'], 'evento.png', { type: 'image/png' });
    component.file = arquivo;
    service.postUpload.and.returnValue(throwError(new Error('Falha na imagem')));
    component.salvarEvento();
    expect(component.eventoId).toBe(7);
    expect(component.file).toBe(arquivo);
    expect(component.salvandoEvento).toBeFalse();
    service.postUpload.and.returnValue(of({}));
    component.salvarEvento();
    expect(service.post).toHaveBeenCalledTimes(1);
    expect(service.put).toHaveBeenCalledTimes(1);
    expect(component.file).toBeUndefined();
  });
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
    component.carregarEvento();
    expect(component.carregandoEvento).toBeTrue();
    expect(spinner.show).not.toHaveBeenCalled();
    tick(30001);
    expect(component.carregandoEvento).toBeFalse();
    expect(spinner.hide).toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalled();
  }));
  it('libera o formulario quando recebe o evento', () => {
    service.getEventoById.and.returnValue(of({ id: 7, imagemURL: '' }));
    component.carregarEvento();
    expect(component.carregandoEvento).toBeFalse();
    expect(component.evento.id).toBe(7);
    expect(spinner.show).not.toHaveBeenCalled();
  });
  it('cancela requisicoes e fecha o indicador ao sair da pagina', fakeAsync(() => {
    component.carregarEvento(); component.ngOnDestroy(); tick(30001);
    expect(spinner.hide).toHaveBeenCalled();
    expect(toastr.error).not.toHaveBeenCalled();
  }));
});
