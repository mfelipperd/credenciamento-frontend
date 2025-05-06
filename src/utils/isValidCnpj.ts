// src/utils/cnpjValidator.ts
/**
 * Verifica se um CNPJ é válido:
 * - Remove tudo que não for dígito
 * - Verifica comprimento igual a 14
 * - Calcula dígitos verificadores conforme regra oficial
 */
export function isValidCNPJ(cnpj: string): boolean {
  const onlyDigits = cnpj.replace(/\D/g, "");
  if (!/^\d{14}$/.test(onlyDigits)) return false;
  if (/^(\d)\1{13}$/.test(onlyDigits)) return false; // rejeita sequências repetidas

  const calculateVerifier = (digits: string): number => {
    const sequence = digits.length - 7;
    let sum = 0;
    let pos = sequence;
    for (let i = digits.length; i >= 1; i--) {
      sum += Number(digits[digits.length - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };

  const base = onlyDigits.slice(0, 12);
  const dv1 = calculateVerifier(base);
  const dv2 = calculateVerifier(base + dv1.toString());
  return onlyDigits.endsWith(`${dv1}${dv2}`);
}
