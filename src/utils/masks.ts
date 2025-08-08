// src/utils/masks.ts

/**
 * Mascarar CNPJ no formato 00.000.000/0000-00
 */
export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, "$1/$2")
    .replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/, "$1-$2");
}

/**
 * Mascarar CEP no formato 00000-000
 */
export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

/**
 * Mascarar telefone BR no formato (00) 00000-0000 ou (00) 0000-0000
 */
export function maskPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/^(\(\d{2}\) \d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/^(\(\d{2}\) \d{5})(\d)/, "$1-$2");
}

/**
 * Normaliza email: retira espaços e mantém letras minúsculas
 */
export function maskEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function unmaskString(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Mascarar valor monetário BRL no formato R$ 0.000,00
 */
export function maskCurrencyBRL(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  const cents = parseInt(digits, 10);
  const reais = cents / 100;

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
}

/**
 * Formatar valor em centavos para moeda BRL
 */
export function formatCurrencyFromCents(cents: number): string {
  const reais = cents / 100;

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
}

/**
 * Remove máscara de moeda BRL e retorna valor em centavos
 */
export function unmaskCurrencyBRL(value: string): number {
  const digits = value.replace(/\D/g, "");
  return parseInt(digits, 10) || 0;
}
