"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function parsePrice(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, ".");
  if (trimmed === "") return null;
  const num = Number(trimmed);
  if (Number.isNaN(num) || num < 0) return null;
  return num;
}

export type CreatePackageState = { error?: string; success?: boolean };

export async function createPackage(
  _prevState: CreatePackageState,
  formData: FormData
): Promise<CreatePackageState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const priceRaw = (formData.get("price") as string | null) ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const isActiveRaw = formData.get("isActive");
  const totalLimit = (formData.get("totalLimit") as string | null)?.trim() ?? "";
  const breakdownLimit =
    (formData.get("breakdownLimit") as string | null)?.trim() ?? "";
  const accidentLimit =
    (formData.get("accidentLimit") as string | null)?.trim() ?? "";
  const towingLimit =
    (formData.get("towingLimit") as string | null)?.trim() ?? "";
  const replacementCar =
    (formData.get("replacementCar") as string | null)?.trim() || null;
  const serviceType =
    (formData.get("serviceType") as string | null)?.trim() ?? "EN YAKIN TAMİRHANE";
  const ageLimit =
    (formData.get("ageLimit") as string | null)?.trim() ?? "Yaş sınırı yoktur";
  const compatibleVehicles =
    (formData.get("compatibleVehicles") as string | null)?.trim() ?? "";

  if (!name) {
    return { error: "Paket adı zorunludur." };
  }
  if (!totalLimit || !breakdownLimit || !accidentLimit || !towingLimit) {
    return { error: "Limit alanları boş bırakılamaz." };
  }
  if (!compatibleVehicles) {
    return { error: "Uyumlu araçlar alanı boş bırakılamaz." };
  }

  const price = parsePrice(priceRaw);
  if (price === null) {
    return { error: "Geçerli bir fiyat girin." };
  }

  const isActive =
    typeof isActiveRaw === "string" || isActiveRaw instanceof Blob;

  try {
    await prisma.package.create({
      data: {
        name,
        limits_description: description,
        base_price: price,
        commission_amount: 0,
        is_active: isActive,
         totalLimit,
         breakdownLimit,
         accidentLimit,
         towingLimit,
         replacementCar: replacementCar || undefined,
         serviceType,
         ageLimit,
         compatibleVehicles
      },
    });
  } catch {
    return { error: "Paket oluşturulurken bir hata oluştu." };
  }

  revalidatePath("/dashboard/admin/packages");
  revalidatePath("/dashboard/sales/new");
  return { success: true };
}

export async function togglePackageStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const packageId = (formData.get("packageId") as string | null)?.trim();
  if (!packageId) {
    return { error: "Geçersiz paket." };
  }

  try {
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      select: { is_active: true },
    });
    if (!pkg) {
      return { error: "Paket bulunamadı." };
    }
    await prisma.package.update({
      where: { id: packageId },
      data: { is_active: !pkg.is_active },
    });
  } catch {
    return { error: "Durum güncellenirken bir hata oluştu." };
  }

  revalidatePath("/dashboard/admin/packages");
  return { success: true };
}

export async function updatePackage(
  id: string,
  formData: FormData
): Promise<CreatePackageState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  if (!id) {
    return { error: "Geçersiz paket." };
  }

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const priceRaw = (formData.get("price") as string | null) ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";
  const isActiveRaw = formData.get("isActive");
  const totalLimit = (formData.get("totalLimit") as string | null)?.trim() ?? "";
  const breakdownLimit =
    (formData.get("breakdownLimit") as string | null)?.trim() ?? "";
  const accidentLimit =
    (formData.get("accidentLimit") as string | null)?.trim() ?? "";
  const towingLimit =
    (formData.get("towingLimit") as string | null)?.trim() ?? "";
  const replacementCar =
    (formData.get("replacementCar") as string | null)?.trim() || null;
  const serviceType =
    (formData.get("serviceType") as string | null)?.trim() ?? "EN YAKIN TAMİRHANE";
  const ageLimit =
    (formData.get("ageLimit") as string | null)?.trim() ?? "Yaş sınırı yoktur";
  const compatibleVehicles =
    (formData.get("compatibleVehicles") as string | null)?.trim() ?? "";

  if (!name) {
    return { error: "Paket adı zorunludur." };
  }
  if (!totalLimit || !breakdownLimit || !accidentLimit || !towingLimit) {
    return { error: "Limit alanları boş bırakılamaz." };
  }
  if (!compatibleVehicles) {
    return { error: "Uyumlu araçlar alanı boş bırakılamaz." };
  }

  const price = parsePrice(priceRaw);
  if (price === null) {
    return { error: "Geçerli bir fiyat girin." };
  }

  const isActive =
    typeof isActiveRaw === "string" || isActiveRaw instanceof Blob;

  try {
    await prisma.package.update({
      where: { id },
      data: {
        name,
        limits_description: description,
        base_price: price,
        commission_amount: 0,
        is_active: isActive,
        totalLimit,
        breakdownLimit,
        accidentLimit,
        towingLimit,
        replacementCar: replacementCar || undefined,
        serviceType,
        ageLimit,
        compatibleVehicles
      }
    });
  } catch {
    return { error: "Paket güncellenirken bir hata oluştu." };
  }

  revalidatePath("/dashboard/admin/packages");
  revalidatePath("/dashboard/sales/new");
  return { success: true };
}

export async function deletePackage(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  if (!id) {
    return { error: "Geçersiz paket." };
  }

  try {
    await prisma.package.delete({
      where: { id }
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      return {
        error:
          "Bu pakete bağlı poliçeler bulunduğu için silinemez. Önce ilgili kayıtları güncelleyin."
      };
    }
    return { error: "Paket silinirken bir hata oluştu." };
  }

  revalidatePath("/dashboard/admin/packages");
  revalidatePath("/dashboard/sales/new");
  return { success: true };
}
