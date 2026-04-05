"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateContractNumber } from "@/lib/generateContractNumber";

export type CheckCustomerState = {
  checked: boolean;
  found: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  error?: string;
};

export type CheckVehicleState = {
  checked: boolean;
  found: boolean;
  plateNumber?: string;
  brand?: string;
  model?: string;
  year?: number;
  usageType?: string;
  error?: string;
};

const initialCustomerStateInternal: CheckCustomerState = {
  checked: false,
  found: false
};

const initialVehicleStateInternal: CheckVehicleState = {
  checked: false,
  found: false
};

export async function checkCustomerByTc(
  _prevState: CheckCustomerState,
  formData: FormData
): Promise<CheckCustomerState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const agentId = session.user.id;
  const tc = (formData.get("tc") as string | null)?.trim() ?? "";

  if (!tc || tc.length !== 11) {
    return {
      checked: true,
      found: false,
      error: "TC numarası 11 haneli olmalıdır."
    };
  }

  const baseState: CheckCustomerState = { ...initialCustomerStateInternal };

  try {
    const customer = await prisma.customer.findFirst({
      where: {
        agent_id: agentId,
        tc_no: tc
      }
    });

    if (!customer) {
      return baseState;
    }

    const parts = customer.full_name.split(" ");
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");

    return {
      ...baseState,
      checked: true,
      found: true,
      firstName,
      lastName,
      phone: customer.phone
    };
  } catch {
    return {
      ...baseState,
      checked: true,
      error: "Müşteri kontrolü sırasında bir hata oluştu."
    };
  }
}

export async function checkVehicleByPlate(
  _prevState: CheckVehicleState,
  formData: FormData
): Promise<CheckVehicleState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const agentId = session.user.id;
  const plate =
    (formData.get("plate") as string | null)?.trim().toUpperCase() ?? "";

  if (!plate) {
    return {
      checked: true,
      found: false,
      error: "Plaka boş olamaz."
    };
  }

  const baseState: CheckVehicleState = { ...initialVehicleStateInternal };

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        plate_number: plate,
        customer: {
          agent_id: agentId
        }
      }
    });

    if (!vehicle) {
      return baseState;
    }

    return {
      ...baseState,
      checked: true,
      found: true,
      plateNumber: vehicle.plate_number,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      usageType: vehicle.usage_type
    };
  } catch {
    return {
      ...baseState,
      checked: true,
      error: "Araç kontrolü sırasında bir hata oluştu."
    };
  }
}

export async function checkoutPolicy(payload: any) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const agentId = session.user.id;

  if (!payload || !payload.selectedPackage?.id) {
    throw new Error("Geçerli bir paket seçilmemiş.");
  }

  const paymentMethodRaw =
    payload.paymentMethod ?? payload.payment?.method ?? "cash";
  const paymentMethod =
    paymentMethodRaw === "wallet" ||
    paymentMethodRaw === "cash" ||
    paymentMethodRaw === "credit_card"
      ? paymentMethodRaw
      : "cash";

  const packageId = payload.selectedPackage.id as string;
  const customerInfo = payload.customer ?? {};
  const vehicleInfo = payload.vehicle ?? {};
  const pricingInfo = payload.pricing ?? {};

  const tcNo = String(customerInfo.tcNo ?? "").replace(/\D/g, "");
  const firstName = String(customerInfo.firstName ?? "").trim();
  const lastName = String(customerInfo.lastName ?? "").trim();
  const phone = String(customerInfo.phone ?? "").trim();

  const plateNumber = String(vehicleInfo.plateNumber ?? "").trim().toUpperCase();
  const brand = String(vehicleInfo.brand ?? "").trim();
  const model = String(vehicleInfo.model ?? "").trim();
  const year = parseInt(String(vehicleInfo.year ?? ""), 10);
  const usageType = String(vehicleInfo.usageType ?? "").trim();

  const ilIdRaw = customerInfo.il_id;
  const ilceIdRaw = customerInfo.ilce_id;
  const ilId =
    ilIdRaw === null || ilIdRaw === undefined || ilIdRaw === ""
      ? null
      : Number(ilIdRaw);
  const ilceId =
    ilceIdRaw === null || ilceIdRaw === undefined || ilceIdRaw === ""
      ? null
      : Number(ilceIdRaw);

  if (!tcNo || tcNo.length !== 11) {
    throw new Error("TC kimlik numarası geçersiz.");
  }
  if (!firstName || !phone) {
    throw new Error("Müşteri adı ve telefon bilgileri zorunludur.");
  }
  if (!plateNumber || !brand || !model || !year || Number.isNaN(year)) {
    throw new Error("Araç bilgileri eksik veya geçersiz.");
  }

  await prisma.$transaction(async (tx) => {
    const agentUser = await tx.user.findUnique({
      where: { id: agentId },
      select: { bayiKodu: true },
    });
    const bayi = agentUser?.bayiKodu?.trim();
    if (!bayi) {
      throw new Error(
        "Hesabınıza atanmış bayi kodu bulunmuyor. Satış yapılamaz; lütfen yönetici ile iletişime geçin."
      );
    }

    const contractNo = generateContractNumber(bayi);

    const pkg = await tx.package.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        base_price: true,
        commission_amount: true,
        price: true,
        commission: true,
        name: true
      }
    });

    if (!pkg) {
      throw new Error("Seçilen paket bulunamadı.");
    }

    const effectivePrice =
      typeof pricingInfo.netPrice === "number" && pricingInfo.netPrice > 0
        ? pricingInfo.netPrice
        : pkg.price > 0
          ? pkg.price
          : pkg.base_price;

    const commissionRatePct =
      typeof pkg.commission === "number" && pkg.commission > 0
        ? pkg.commission
        : 30;

    const commission =
      pkg.commission_amount > 0
        ? pkg.commission_amount
        : effectivePrice * (commissionRatePct / 100);

    const netCost = effectivePrice - commission;

    const fullPriceForWalletCheck =
      pkg.price > 0 ? pkg.price : pkg.base_price;

    const needsWallet =
      paymentMethod === "wallet" || paymentMethod === "cash";

    const wallet = needsWallet
      ? await tx.wallet.findUnique({
          where: { user_id: agentId }
        })
      : null;

    if (needsWallet && !wallet) {
      throw new Error("Acente için cüzdan bulunamadı.");
    }

    if (
      paymentMethod === "wallet" &&
      wallet &&
      wallet.balance < fullPriceForWalletCheck
    ) {
      throw new Error("Yetersiz bakiye");
    }

    const existingCustomer = await tx.customer.findFirst({
      where: {
        agent_id: agentId,
        tc_no: tcNo
      }
    });

    let customerId: string;
    let customerFullName: string;

    const fullNameValue = `${firstName} ${lastName}`.trim();

    if (existingCustomer) {
      const updated = await tx.customer.update({
        where: { id: existingCustomer.id },
        data: {
          // Keep both for backward compatibility with schema fields
          full_name: fullNameValue,
          name: fullNameValue,
          identityNumber: tcNo,
          phone
        }
      });
      customerId = updated.id;
      customerFullName = updated.full_name ?? fullNameValue;
    } else {
      const created = await tx.customer.create({
        data: {
          agent_id: agentId,
          // Map to both 'name' (new Prisma field) and 'full_name' (legacy usage)
          full_name: fullNameValue,
          name: fullNameValue,
          tc_no: tcNo,
          identityNumber: tcNo,
          phone
        }
      });
      customerId = created.id;
      customerFullName = created.full_name ?? fullNameValue;
    }

    const existingVehicle = await tx.vehicle.findFirst({
      where: {
        plate_number: plateNumber,
        customer: {
          agent_id: agentId
        }
      }
    });

    let vehicleId: string;

    if (existingVehicle) {
      const updatedVehicle = await tx.vehicle.update({
        where: { id: existingVehicle.id },
        data: {
          customer_id: customerId,
          brand,
          model,
          year,
          usage_type: usageType
        }
      });
      vehicleId = updatedVehicle.id;
    } else {
      const createdVehicle = await tx.vehicle.create({
        data: {
          customer_id: customerId,
          plate_number: plateNumber,
          brand,
          model,
          year,
          usage_type: usageType
        }
      });
      vehicleId = createdVehicle.id;
    }

    const nameParts = customerFullName.split(" ");
    const customerFirstName = nameParts[0] ?? firstName;
    const customerLastName = nameParts.slice(1).join(" ") || lastName;

    // Step 3 — Hizmet başlangıç tarihi (payload.startDate, YYYY-MM-DD)
    const durationDays = 365;
    const rawStart = payload.startDate as string | undefined;
    const startDate =
      typeof rawStart === "string" &&
      rawStart.trim() !== "" &&
      !Number.isNaN(Date.parse(rawStart))
        ? new Date(rawStart)
        : new Date();

    const endDate = new Date(startDate.getTime());
    endDate.setDate(endDate.getDate() + durationDays);

    const kdvRate = 20;
    const grossTtc = effectivePrice;
    const netPricePersisted = grossTtc / (1 + kdvRate / 100);
    const kdvAmountPersisted = grossTtc - netPricePersisted;

    await tx.sale.create({
      data: {
        agent_id: agentId,
        package_id: pkg.id,
        customer_tc: tcNo,
        customer_first_name: customerFirstName,
        customer_last_name: customerLastName,
        customer_plate: plateNumber,
        car_brand_model: `${brand} ${model}`.trim(),
        sale_price: effectivePrice,
        commission_earned: commission,
        status: "SUCCESS",
        startDate,
        endDate,
        durationDays,
        kdvRate,
        netPrice: netPricePersisted,
        kdvAmount: kdvAmountPersisted,

        policyNumber: contractNo,
        sozlesmeNo: contractNo,

        plaka: plateNumber,
        marka: brand,
        model,
        modelYili: year,
        kullanimTarzi: usageType,
        netPrim: netPricePersisted,
        kdv: kdvRate,
        brutPrim: effectivePrice,
        il_id: ilId != null && !Number.isNaN(ilId) ? ilId : null,
        ilce_id: ilceId != null && !Number.isNaN(ilceId) ? ilceId : null,
        tcVkn: tcNo,
        telefon: phone,
        acikAdres: null
      }
    });

    if (needsWallet && wallet) {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: netCost
          }
        }
      });

      await tx.transaction.create({
        data: {
          wallet_id: wallet.id,
          type: "WITHDRAW",
          amount: netCost,
          status: "COMPLETED",
          description:
            paymentMethod === "cash"
              ? "Poliçe Kesimi (Nakit/POS — net maliyet)"
              : "Poliçe Kesimi (Cüzdan — net maliyet)"
        }
      });
    }
  });
}
