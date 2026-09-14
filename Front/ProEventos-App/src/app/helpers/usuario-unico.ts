import { AsyncValidatorFn } from '@angular/forms';
import { of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AccountService } from '@app/services/account.service';

export function usuarioUnico(account: AccountService, editing = false): AsyncValidatorFn {
  return control => {
    if (!String(control.value || '').trim()) return of({ required: true });
    return timer(400).pipe(
      switchMap(() => account.userNameExists(control.value, editing)),
      map(result => result.exists ? { usuarioExiste: true } : null),
      catchError(() => of({ verificacaoUsuario: true }))
    );
  };
}
