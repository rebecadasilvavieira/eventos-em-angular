export function formatarTelefone(valor: string): string {
  if (!valor) {
    return '';
  }

  const num = valor.replace(/\D/g, '').substring(0, 11);

  if (num.length <= 2) {
    return num ? `(${num}` : '';
  }
  if (num.length <= 7) {
    return `(${num.substring(0, 2)}) ${num.substring(2)}`;
  }

  return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
}

