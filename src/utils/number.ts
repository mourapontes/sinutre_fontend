/** Formata números no padrão pt-BR (vírgula decimal). */
export function formatNumber(
  value: number,
  maximumFractionDigits = 1,
): string {
  return value.toLocaleString('pt-BR', {
    maximumFractionDigits,
  });
}
