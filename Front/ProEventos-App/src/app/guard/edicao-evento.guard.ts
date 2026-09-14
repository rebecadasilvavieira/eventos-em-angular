import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AccountService } from '@app/services/account.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EventoService } from '@app/services/evento.service';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EdicaoEventoGuard implements CanActivate {
  constructor(private account: AccountService, private router: Router, private eventos: EventoService) {}

  canActivate(route: ActivatedRouteSnapshot) {
    return this.account.getUser().pipe(
      switchMap(() => {
        const id = route.paramMap.get('id');
        const consulta = this.router.createUrlTree(id ? ['/eventos/visualizar', id] : ['/eventos/lista']);
        return id ? this.eventos.getEventoById(+id).pipe(map(evento => evento?.podeEditar ? true : consulta)) : of(true);
      }),
      catchError(() => of(this.router.createUrlTree(['/eventos/lista'])))
    );
  }
}
