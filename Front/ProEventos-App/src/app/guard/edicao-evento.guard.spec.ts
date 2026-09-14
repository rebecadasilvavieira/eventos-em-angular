import { convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EdicaoEventoGuard } from './edicao-evento.guard';

describe('Permissao de editar eventos', () => {
  const route = (id?: string) => ({ paramMap: convertToParamMap(id ? { id } : {}) } as any);
  let account: any;
  let guard: EdicaoEventoGuard;
  let eventos: any;
  beforeEach(() => {
    account = { getUser: jasmine.createSpy().and.returnValue(of({ funcao: 'Participante' })) };
    eventos = { getEventoById: jasmine.createSpy().and.returnValue(of({ podeEditar: true })) };
    guard = new EdicaoEventoGuard(account, { createUrlTree: (url: string[]) => url } as any, eventos);
  });
  it('abre somente para consulta quando o participante nao e dono', () => {
    eventos.getEventoById.and.returnValue(of({ podeEditar: false }));
    guard.canActivate(route('7')).subscribe(result => expect(result as any).toEqual(['/eventos/visualizar', '7']));
  });
  it('permite ao participante acessar o formulario de novo evento', () => {
    guard.canActivate(route()).subscribe(result => expect(result).toBeTrue());
  });
  it('permite criar eventos com conta nova sem funcao definida', () => {
    account.getUser.and.returnValue(of({}));
    guard.canActivate(route()).subscribe(result => expect(result).toBeTrue());
  });
  it('permite editar o proprio evento mesmo depois de mudar para participante', () => {
    account.getUser.and.returnValue(of({ funcao: 'Palestrante' }));
    guard.canActivate(route('7')).subscribe(result => expect(result).toBeTrue());
    account.getUser.and.returnValue(of({ funcao: 'Participante' }));
    guard.canActivate(route('7')).subscribe(result => expect(result).toBeTrue());
  });
  it('nao libera edicao se a consulta de permissoes falhar', () => {
    account.getUser.and.returnValue(throwError(new Error('Falha')));
    guard.canActivate(route('7')).subscribe(result => expect(result as any).toEqual(['/eventos/lista']));
  });
  it('abre somente a visualizacao de eventos de outro palestrante', () => {
    account.getUser.and.returnValue(of({ funcao: 'Palestrante' }));
    eventos.getEventoById.and.returnValue(of({ podeEditar: false }));
    guard.canActivate(route('7')).subscribe(result => expect(result as any).toEqual(['/eventos/visualizar', '7']));
  });
});
