import type { PolicySaleRow } from "@/components/policy-sale-row";

/** PDF / makbuz: önce şirket adı, sonra bayiAdi, sonra acente adı. */
export function resolvePolicyBayiAdi(sale: PolicySaleRow): string {
  const s = sale.sirketAdi?.trim();
  if (s) return s;
  const b = sale.bayiAdi?.trim();
  if (b) return b;
  const a = sale.agency?.trim();
  if (a) return a;
  return "Bilinmeyen Bayi";
}
