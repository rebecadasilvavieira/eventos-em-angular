import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { usuarioUnico } from './usuario-unico';

describe('Nome de usuario unico', () => {
  it('mantem o erro para nomes ocupados e libera um nome disponivel', fakeAsync(() => {
    const account = { userNameExists: jasmine.createSpy().and.returnValue(of({ exists: true })) };
    const control = new FormControl('Rebeca', null, usuarioUnico(account as any));
    tick(400);
    expect(control.errors).toEqual({ usuarioExiste: true });
    control.setValue('REBECA');
    tick(400);
    expect(control.errors).toEqual({ usuarioExiste: true });
    account.userNameExists.and.returnValue(of({ exists: false }));
    control.setValue('rebeca.nova');
    tick(400);
    expect(control.valid).toBeTrue();
  }));
  it('informa que a consulta e de edicao para permitir o proprio nome', fakeAsync(() => {
    const account = { userNameExists: jasmine.createSpy().and.returnValue(of({ exists: false })) };
    const control = new FormControl('Rebeca', null, usuarioUnico(account as any, true));
    tick(400);
    expect(account.userNameExists).toHaveBeenCalledWith('Rebeca', true);
    expect(control.valid).toBeTrue();
  }));
});
