import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from '@app/models/identity/User';
import { AccountService } from '@app/services/account.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private accountService: AccountService) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    let currentUser: User | null = null;

    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user: User | null) => {
        currentUser = user;
      });

    if (currentUser !== null) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${(currentUser as User).token}`
        }
      });
    }

    return next.handle(request);
  }
}
