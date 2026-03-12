"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CreateVehicleState = { error?: string; success?: boolean };

export async function createVehicle(
  _prevState: CreateVehicleState,
  formData: FormData
): Promise<CreateVehicleState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const agentId = session.user.id;

  const customerId = (formData.get("customerId") as string | null)?.trim();
  const plateNumber = (formData.get("plateNumber") as string | null)?.trim() ?? "";
  const documentSerial = (formData.get("documentSerial") as string | null)?.trim() || undefined;
  const brand = (formData.get("brand") as string | null)?.trim() ?? "";
  const model = (formData.get("model") as string | null)?.trim() ?? "";
  const yearRaw = (formData.get("year") as string | null)?.trim();
  const usageType = (formData.get("usageType") as string | null)?.trim() ?? "";

  if (!customerId) {
    return { error: "Lütfen bir müşteri seçin." };
  }
  if (!plateNumber) {
    return { error: "Araç plakası zorunludur." };
  }
  if (!brand) {
    return { error: "Araç markası zorunludur." };
  }
  if (!model) {
    return { error: "Araç modeli zorunludur." };
  }
  const year = yearRaw ? parseInt(yearRaw, 10) : NaN;
  if (Number.isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) {
    return { error: "Geçerli bir model yılı seçin." };
  }
  if (!usageType) {
    return { error: "Araç kullanım türü zorunludur." };
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, agent_id: agentId },
    });
    if (!customer) {
      return { error: "Seçilen müşteri bulunamadı veya yetkiniz yok." };
    }

    await prisma.vehicle.create({
      data: {
        customer_id: customerId,
        plate_number: plateNumber,
        document_serial: documentSerial,
        brand,
        model,
        year,
        usage_type: usageType,
      },
    });
  } catch {
    return { error: "Araç eklenirken bir hata oluştu." };
  }

  revalidatePath("/dashboard/vehicles");
  return { success: true };
}
