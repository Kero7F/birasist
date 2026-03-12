"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CreateAgentState = { error?: string; success?: boolean };

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
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

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
      const newUser = await tx.user.create({
        data: {
          tc_no: uniqueTcNo,
          first_name: firstName,
          last_name: lastName,
          phone: placeholderPhone,
          email,
          password_hash: hashedPassword,
          role: "AGENT",
          is_active: true,
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
    if (message.includes("Unique constraint") || message.includes("email")) {
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    }
    return { error: "Acente oluşturulurken bir hata oluştu." };
  }

  revalidatePath("/dashboard/admin/agents");
  revalidatePath("/dashboard/admin/wallets");
  return { success: true };
}
