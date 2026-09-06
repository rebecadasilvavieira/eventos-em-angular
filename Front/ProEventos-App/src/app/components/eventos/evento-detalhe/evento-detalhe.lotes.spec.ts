import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { EventoDetalheComponent } from './evento-detalhe.component';

describe('Lotes do evento', () => {
  let component: EventoDetalheComponent;
  let service: any;
  const salvo = { id: 8, nome: 'Primeiro lote', quantidade: 50, preco: 20, dataInicio: null, dataFim: null };

  beforeEach(() => {
    service = {
      getLotesById: jasmine.createSpy('getLotesById').and.returnValue(of([salvo])),
      saveLote: jasmine.createSpy('saveLote').and.returnValue(of([salvo]))
    };
    component = new EventoDetalheComponent(new FormBuilder(), { use: () => {} } as any,
      null as any, null as any, { show: () => {}, hide: () => {} } as any,
      { success: () => {}, error: () => {} } as any, null as any, null as any, service, null as any);
    component.validation();
    component.eventoId = 7;
  });

  it('recarrega lotes sem duplicar os campos', () => {
    component.carregarLotes();
    component.carregarLotes();
    expect(component.lotes.length).toBe(1);
    expect(component.lotes.at(0).value.id).toBe(8);
  });

  it('mantem o ID retornado para atualizar o mesmo lote ao salvar novamente', () => {
    component.adicionarLote();
    component.lotes.at(0).patchValue({ nome: 'Primeiro lote', quantidade: 50, preco: 20 });
    component.salvarLotes();
    component.salvarLotes();
    expect(service.saveLote.calls.argsFor(0)[1][0].id).toBe(0);
    expect(service.saveLote.calls.argsFor(1)[1][0].id).toBe(8);
    expect(component.lotes.length).toBe(1);
  });

  it('preserva a data escolhida ao editar outro campo do lote', () => {
    component.adicionarLote();
    const data = new Date(2026, 8, 9);
    component.mudarValorData(data, 0, 'dataInicio');
    component.lotes.at(0).get('nome')?.setValue('Primeiro lote');
    expect(component.form.value.lotes[0].dataInicio).toBe(data);
  });
});
