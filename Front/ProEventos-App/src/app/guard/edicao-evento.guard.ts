import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AccountService } from '@app/services/account.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EdicaoEventoGuard implements CanActivate {
  constructor(private account: AccountService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot) {
    return this.account.getUser().pipe(
      map(user => user.funcao === 'Palestrante' ? true : this.router.createUrlTree(
        route.paramMap.get('id') ? ['/eventos/visualizar', route.paramMap.get('id')] : ['/eventos/lista'])),
      catchError(() => of(this.router.createUrlTree(['/eventos/lista'])))
    );
  }
}
