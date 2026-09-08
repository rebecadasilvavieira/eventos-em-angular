import { convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EdicaoEventoGuard } from './edicao-evento.guard';

describe('Permissao de editar eventos', () => {
  const route = (id?: string) => ({ paramMap: convertToParamMap(id ? { id } : {}) } as any);
  let account: any;
  let guard: EdicaoEventoGuard;
  beforeEach(() => {
    account = { getUser: jasmine.createSpy().and.returnValue(of({ funcao: 'Participante' })) };
    guard = new EdicaoEventoGuard(account, { createUrlTree: (url: string[]) => url } as any);
  });
  it('abre os detalhes somente para consulta quando e participante', () => {
    guard.canActivate(route('7')).subscribe(result => expect(result as any).toEqual(['/eventos/visualizar', '7']));
  });
  it('impede acesso direto ao formulario de novo evento', () => {
    guard.canActivate(route()).subscribe(result => expect(result as any).toEqual(['/eventos/lista']));
  });
  it('consulta novamente a funcao depois da mudanca para participante', () => {
    account.getUser.and.returnValue(of({ funcao: 'Palestrante' }));
    guard.canActivate(route('7')).subscribe(result => expect(result).toBeTrue());
    account.getUser.and.returnValue(of({ funcao: 'Participante' }));
    guard.canActivate(route('7')).subscribe(result => expect(result as any).toEqual(['/eventos/visualizar', '7']));
  });
  it('nao libera edicao se a consulta de permissoes falhar', () => {
    account.getUser.and.returnValue(throwError(new Error('Falha')));
    guard.canActivate(route('7')).subscribe(result => expect(result as any).toEqual(['/eventos/lista']));
  });
});
