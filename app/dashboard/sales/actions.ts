"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

  const packageId = payload.selectedPackage.id as string;
  const customerInfo = payload.customer ?? {};
  const vehicleInfo = payload.vehicle ?? {};

  const tcNo = String(customerInfo.tcNo ?? "").replace(/\D/g, "");
  const firstName = String(customerInfo.firstName ?? "").trim();
  const lastName = String(customerInfo.lastName ?? "").trim();
  const phone = String(customerInfo.phone ?? "").trim();

  const plateNumber = String(vehicleInfo.plateNumber ?? "").trim().toUpperCase();
  const brand = String(vehicleInfo.brand ?? "").trim();
  const model = String(vehicleInfo.model ?? "").trim();
  const year = parseInt(String(vehicleInfo.year ?? ""), 10);
  const usageType = String(vehicleInfo.usageType ?? "").trim();

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
    const pkg = await tx.package.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        base_price: true,
        commission_amount: true,
        name: true
      }
    });

    if (!pkg) {
      throw new Error("Seçilen paket bulunamadı.");
    }

    const price = pkg.base_price;

    const wallet = await tx.wallet.findUnique({
      where: { user_id: agentId }
    });

    if (!wallet) {
      throw new Error("Acente için cüzdan bulunamadı.");
    }

    if (wallet.balance < price) {
      throw new Error("Yetersiz bakiye. Lütfen cüzdanınıza bakiye yükleyin.");
    }

    const existingCustomer = await tx.customer.findFirst({
      where: {
        agent_id: agentId,
        tc_no: tcNo
      }
    });

    let customerId: string;
    let customerFullName: string;

    if (existingCustomer) {
      const updated = await tx.customer.update({
        where: { id: existingCustomer.id },
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          phone
        }
      });
      customerId = updated.id;
      customerFullName = updated.full_name;
    } else {
      const created = await tx.customer.create({
        data: {
          agent_id: agentId,
          full_name: `${firstName} ${lastName}`.trim(),
          tc_no: tcNo,
          phone
        }
      });
      customerId = created.id;
      customerFullName = created.full_name;
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

    await tx.sale.create({
      data: {
        agent_id: agentId,
        package_id: pkg.id,
        customer_tc: tcNo,
        customer_first_name: customerFirstName,
        customer_last_name: customerLastName,
        customer_plate: plateNumber,
        car_brand_model: `${brand} ${model}`.trim(),
        sale_price: price,
        commission_earned: pkg.commission_amount,
        status: "SUCCESS"
      }
    });

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: price
        }
      }
    });

    await tx.transaction.create({
      data: {
        wallet_id: wallet.id,
        type: "WITHDRAW",
        amount: price,
        status: "COMPLETED",
        description: "Poliçe Kesimi"
      }
    });
  });
}
