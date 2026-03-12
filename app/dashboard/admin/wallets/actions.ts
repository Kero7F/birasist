"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type TopUpState = { error?: string; success?: boolean };

function parseAmount(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, ".");
  if (trimmed === "") return null;
  const num = Number(trimmed);
  if (Number.isNaN(num) || num < 1) return null;
  return num;
}

export async function topUpWallet(
  _prevState: TopUpState,
  formData: FormData
): Promise<TopUpState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const agentId = (formData.get("agentId") as string | null)?.trim();
  const amountRaw = (formData.get("amount") as string | null) ?? "";

  if (!agentId) {
    return { error: "Lütfen bir acente seçin." };
  }

  const amount = parseAmount(amountRaw);
  if (amount === null) {
    return { error: "Geçerli bir tutar girin (en az 1)." };
  }

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: agentId },
      select: { id: true, balance: true },
    });

    if (!wallet) {
      return { error: "Bu acente için cüzdan bulunamadı." };
    }

    const balanceAfter = wallet.balance + amount;

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });
      await tx.transaction.create({
        data: {
          wallet_id: wallet.id,
          type: "EARN",
          amount,
          status: "COMPLETED",
          description: "Admin bakiye yüklemesi",
        },
      });
    });
  } catch {
    return { error: "Bakiye yüklenirken bir hata oluştu." };
  }

  revalidatePath("/dashboard/admin/wallets");
  revalidatePath("/dashboard/admin/agents");
  return { success: true };
}
