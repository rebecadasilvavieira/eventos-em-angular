import { FormGroup } from '@angular/forms';

export function formatarNome(form: FormGroup): void {
  ['primeiroNome', 'ultimoNome'].forEach(campo => {
    const control = form.get(campo);
    if (!control || typeof control.value !== 'string') return;

    const nome = control.value.replace(/(^|[\s'’\-])([^\s'’\-])/g,
      (_, separador: string, letra: string) => separador + letra.toLocaleUpperCase('pt-BR'));
    if (nome !== control.value) control.setValue(nome);
  });
}
