import type { Prisma } from "@prisma/client";

type Tx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * 4 haneli benzersiz bayi kodu. İsteğe bağlı `provided` tam 4 rakam ve müsait olmalı.
 */
export async function assignBayiKoduForNewUser(
  tx: Tx,
  providedRaw?: string | null
): Promise<string> {
  const provided = providedRaw?.trim() ?? "";
  if (provided !== "") {
    if (!/^\d{4}$/.test(provided)) {
      throw new Error("Bayi kodu tam 4 rakam olmalıdır (örn. 2847).");
    }
    const taken = await tx.user.findUnique({ where: { bayiKodu: provided } });
    if (taken) {
      throw new Error("Bu bayi kodu zaten kullanılıyor.");
    }
    return provided;
  }

  for (let i = 0; i < 100; i++) {
    const generatedBayiKodu = Math.floor(1000 + Math.random() * 9000).toString();
    const taken = await tx.user.findUnique({
      where: { bayiKodu: generatedBayiKodu },
    });
    if (!taken) return generatedBayiKodu;
  }

  throw new Error("Benzersiz bayi kodu üretilemedi; tekrar deneyin.");
}
