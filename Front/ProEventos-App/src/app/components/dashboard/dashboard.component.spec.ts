import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { Evento } from '@app/models/Evento';

describe('Agenda do dashboard', () => {
  let component: DashboardComponent;
  let eventosService: any;

  // A API serializa a data como texto, embora o modelo local declare Date.
  const evento = (id: number, dataEvento: string) => ({ id, dataEvento } as unknown as Evento);
  const pagina = (result: Evento[], currentPage = 1, totalPages = 1, totalItems = result.length) => ({
    result, pagination: { currentPage, totalPages, totalItems, itemsPerPage: 50 }
  });

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 8, 7));
    eventosService = { getEventos: jasmine.createSpy() };
    component = new DashboardComponent(eventosService, {
      getPalestrantes: () => of(pagina([]))
    } as any, { getUser: () => of({ funcao: 'Palestrante' }) } as any);
  });

  afterEach(() => jasmine.clock().uninstall());

  it('inclui o novo evento com data brasileira e ordena por data', () => {
    eventosService.getEventos.and.returnValue(of(pagina([
      evento(8, '16/08/2028 13:40:03'),
      evento(7, '09/09/2026 19:54:42'),
      evento(1, '30/07/2026 19:00:00')
    ])));
    component.carregarResumo();
    expect(component.eventos.map(item => item.id)).toEqual([7, 8]);
    expect(component.dataEvento(component.eventos[1]).getMonth()).toBe(7);
    expect(component.carregando).toBeFalse();
  });

  it('busca as outras paginas antes de escolher os tres proximos', () => {
    eventosService.getEventos.and.callFake((page: number) => of(page === 1
      ? pagina([evento(1, '2026-12-01T10:00:00'), evento(2, '2026-11-01T10:00:00'),
          evento(3, '2026-10-01T10:00:00')], 1, 2, 4)
      : pagina([evento(4, '2026-09-08T10:00:00')], 2, 2, 4)));
    component.carregarResumo();
    expect(eventosService.getEventos).toHaveBeenCalledWith(2, 50);
    expect(component.eventos.map(item => item.id)).toEqual([4, 3, 2]);
    expect(component.totalEventos).toBe(4);
  });

  it('ignora eventos passados, sem data ou com data invalida', () => {
    eventosService.getEventos.and.returnValue(of(pagina([
      evento(1, '2025-01-01T00:00:00'), evento(2, ''), evento(3, 'invalida')
    ])));
    component.carregarResumo();
    expect(component.eventos).toEqual([]);
    expect(component.totalEventos).toBe(3);
  });
});
