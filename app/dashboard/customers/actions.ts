"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const TC_NO_LENGTH = 11;
const TC_NO_REGEX = /^\d{11}$/;

export type CreateCustomerState = { error?: string; success?: boolean };

function validateTcNo(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length === TC_NO_LENGTH && TC_NO_REGEX.test(trimmed);
}

export async function createCustomer(
  _prevState: CreateCustomerState,
  formData: FormData
): Promise<CreateCustomerState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const agentId = session.user.id;

  const fullName = (formData.get("fullName") as string | null)?.trim() ?? "";
  const tcNo = (formData.get("tcNo") as string | null)?.trim().replace(/\s/g, "") ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";

  if (!fullName) {
    return { error: "Ad soyad zorunludur." };
  }
  if (!validateTcNo(tcNo)) {
    return { error: "TC kimlik numarası tam olarak 11 rakamdan oluşmalıdır." };
  }
  if (!phone) {
    return { error: "Telefon numarası zorunludur." };
  }

  try {
    const existing = await prisma.customer.findFirst({
      where: {
        agent_id: agentId,
        tc_no: tcNo,
      },
    });
    if (existing) {
      return { error: "Bu TC kimlik numarası ile kayıtlı bir müşteri zaten mevcut." };
    }

    await prisma.customer.create({
      data: {
        agent_id: agentId,
        full_name: fullName,
        tc_no: tcNo,
        phone,
      },
    });
  } catch {
    return { error: "Müşteri eklenirken bir hata oluştu." };
  }

  revalidatePath("/dashboard/customers");
  return { success: true };
}
