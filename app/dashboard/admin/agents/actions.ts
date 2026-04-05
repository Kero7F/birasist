"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assignBayiKoduForNewUser } from "@/lib/bayiKodu";

export type CreateAgentState = { error?: string; success?: boolean };

export type DeleteAgencyState = { error?: string; success?: boolean };

export async function deleteAgencyAction(
  agencyId: string
): Promise<DeleteAgencyState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const id = agencyId?.trim();
  if (!id) {
    return { error: "Geçersiz acente." };
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!target || target.role !== "AGENT") {
    return { error: "Acente bulunamadı veya silinemez." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { wallet: { user_id: id } },
      });

      await tx.wallet.deleteMany({
        where: { user_id: id },
      });

      await tx.vehicle.deleteMany({
        where: { customer: { agent_id: id } },
      });

      await tx.sale.deleteMany({
        where: { agent_id: id },
      });

      await tx.customer.deleteMany({
        where: { agent_id: id },
      });

      await tx.user.delete({
        where: { id },
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    console.error("deleteAgencyAction", e);
    return {
      error:
        message || "Acente silinirken bir hata oluştu. Bağımlı kayıtlar kontrol edin.",
    };
  }

  revalidatePath("/dashboard/admin/agents");
  revalidatePath("/dashboard/admin/wallets");
  revalidatePath("/dashboard/policeler");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function createAgent(
  _prevState: CreateAgentState,
  formData: FormData
): Promise<CreateAgentState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const firstName = (formData.get("firstName") as string | null)?.trim() ?? "";
  const lastName = (formData.get("lastName") as string | null)?.trim() ?? "";
  const sirketAdiRaw = (formData.get("sirketAdi") as string | null)?.trim() ?? "";
  const sirketAdi = sirketAdiRaw === "" ? null : sirketAdiRaw;
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const bayiKoduInput = (formData.get("bayiKodu") as string | null) ?? "";

  if (/\d/.test(firstName) || /\d/.test(lastName)) {
    return { error: "Ad ve Soyad alanları rakam içeremez." };
  }

  const bayiKoduTrimmed = bayiKoduInput.trim();
  if (bayiKoduTrimmed !== "" && !/^\d{4}$/.test(bayiKoduTrimmed)) {
    return {
      error: "Bayi kodu sadece 4 haneli rakamlardan oluşmalıdır.",
    };
  }

  if (!firstName) {
    return { error: "Ad zorunludur." };
  }
  if (!lastName) {
    return { error: "Soyad zorunludur." };
  }
  if (!email) {
    return { error: "E-posta zorunludur." };
  }
  if (!isValidEmail(email)) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }
  if (!password || password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const uniqueTcNo = `A-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const placeholderPhone = "+900000000000";

  try {
    await prisma.$transaction(async (tx) => {
      const generatedBayiKodu = await assignBayiKoduForNewUser(
        tx,
        bayiKoduTrimmed || undefined
      );

      const newUser = await tx.user.create({
        data: {
          tc_no: uniqueTcNo,
          first_name: firstName,
          last_name: lastName,
          sirketAdi,
          phone: placeholderPhone,
          email,
          password_hash: hashedPassword,
          role: "AGENT",
          is_active: true,
          bayiKodu: generatedBayiKodu,
        },
      });
      await tx.wallet.create({
        data: {
          user_id: newUser.id,
          balance: 0,
        },
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (
      message.includes("Bayi kodu") ||
      message.includes("bayi kodu") ||
      message.includes("Benzersiz bayi")
    ) {
      return { error: message };
    }
    if (message.includes("Unique constraint") || message.includes("email")) {
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    }
    return { error: "Acente oluşturulurken bir hata oluştu." };
  }

  revalidatePath("/dashboard/admin/agents");
  revalidatePath("/dashboard/admin/wallets");
  return { success: true };
}
