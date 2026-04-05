/**
 * Sözleşme numarası: `{bayiKodu}-{seg}-{seg}-{seg}` (segmentler `Math.random` tabanlı).
 */
export function generateContractNumber(bayiKodu: string): string {
  const trimmed = bayiKodu.trim();
  const seg = () => Math.random().toString().slice(2, 6);
  return `${trimmed}-${seg()}-${seg()}-${seg()}`;
}
