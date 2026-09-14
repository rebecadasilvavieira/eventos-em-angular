import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { Evento } from '@app/models/Evento';

describe('Eventos do dashboard', () => {
  let component: DashboardComponent;
  let eventosService: any;
  const evento = (id: number, dataEvento: string) => ({ id, dataEvento } as unknown as Evento);
  const pagina = (result: Evento[], totalItems = result.length) => ({
    result, pagination: { currentPage: 1, totalPages: Math.ceil(totalItems / 5), totalItems, itemsPerPage: 5 }
  });

  beforeEach(() => {
    eventosService = { getEventos: jasmine.createSpy() };
    component = new DashboardComponent(eventosService, {
      getPalestrantes: () => of(pagina([]))
    } as any, { getUser: () => of({ funcao: 'Palestrante' }) } as any);
  });

  it('mostra os tres eventos cadastrados incluindo o passado, na ordem da lista', () => {
    eventosService.getEventos.and.returnValue(of(pagina([
      evento(1, '09/09/2026 19:54:42'),
      evento(2, '16/08/2028 13:40:03'),
      evento(3, '17/08/2033 09:17:00')
    ])));
    component.carregarResumo();
    expect(component.eventos.map(item => item.id)).toEqual([1, 2, 3]);
    expect(component.dataEvento(component.eventos[1]).getMonth()).toBe(7);
    expect(component.totalEventos).toBe(3);
    expect(component.carregando).toBeFalse();
  });

  it('carrega apenas cinco eventos e preserva o total de todas as paginas', () => {
    eventosService.getEventos.and.returnValue(of(pagina(
      [1, 2, 3, 4, 5].map(id => evento(id, '2026-01-01T10:00:00')), 8
    )));
    component.carregarResumo();
    expect(eventosService.getEventos).toHaveBeenCalledOnceWith(1, 5);
    expect(component.eventos.length).toBe(5);
    expect(component.totalEventos).toBe(8);
  });

  it('mostra a lista vazia quando nao ha eventos cadastrados', () => {
    eventosService.getEventos.and.returnValue(of(pagina([])));
    component.carregarResumo();
    expect(component.eventos).toEqual([]);
    expect(component.totalEventos).toBe(0);
    expect(component.carregando).toBeFalse();
  });
});