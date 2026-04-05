import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateContractNumber } from "@/lib/generateContractNumber";

type Json = Record<string, unknown>;

function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  let body: Json;
  try {
    body = (await req.json()) as Json;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 });
  }

  const customer = (body.customer as Json) ?? {};
  const vehicle = (body.vehicle as Json) ?? {};
  const selectedPackage = (body.selectedPackage as Json) ?? {};
  const pricing = (body.pricing as Json) ?? {};

  const packageId = str(selectedPackage.id).trim();
  if (!packageId) {
    return NextResponse.json({ error: "Geçerli bir paket seçilmemiş." }, { status: 400 });
  }

  const tcNo = str(customer.tcNo).replace(/\D/g, "");
  const firstName = str(customer.firstName).trim();
  const lastName = str(customer.lastName).trim();
  const phone = str(customer.phone).trim();

  const plateNumber = str(vehicle.plateNumber).trim().toUpperCase();
  const markaVal = str(vehicle.brand).trim();
  const modelVal = str(vehicle.model).trim();
  const yearParsed = parseInt(str(vehicle.year), 10);
  const kullanimVal = str(vehicle.usageType).trim();

  if (!tcNo || tcNo.length !== 11) {
    return NextResponse.json(
      { error: "TC kimlik numarası geçersiz." },
      { status: 400 }
    );
  }
  if (!firstName || !phone) {
    return NextResponse.json(
      { error: "Müşteri adı ve telefon bilgileri zorunludur." },
      { status: 400 }
    );
  }
  if (
    !plateNumber ||
    !markaVal ||
    !modelVal ||
    !yearParsed ||
    Number.isNaN(yearParsed)
  ) {
    return NextResponse.json(
      { error: "Araç bilgileri eksik veya geçersiz." },
      { status: 400 }
    );
  }

  const startDateInput = str(body.startDate);
  const startDate =
    startDateInput && !Number.isNaN(Date.parse(startDateInput))
      ? new Date(startDateInput)
      : new Date();

  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: {
      id: true,
      base_price: true,
      price: true,
      commission_amount: true,
    },
  });

  if (!pkg) {
    return NextResponse.json({ error: "Seçilen paket bulunamadı." }, { status: 404 });
  }

  const netPriceInput = num(pricing.netPrice);
  const salePrice =
    netPriceInput != null && netPriceInput > 0
      ? netPriceInput
      : pkg.price > 0
        ? pkg.price
        : pkg.base_price;

  const durationDays = 365;
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + durationDays);

  const kdvRate = 20;
  const grossTtc = salePrice;
  const netPricePersisted = grossTtc / (1 + kdvRate / 100);
  const kdvAmountPersisted = grossTtc - netPricePersisted;

  const finalCommission = num(pricing.finalCommission);
  const commissionEarned =
    finalCommission != null && finalCommission >= 0
      ? finalCommission
      : pkg.commission_amount;

  const fullNameValue = `${firstName} ${lastName}`.trim();
  const nameParts = fullNameValue.split(" ");
  const customerFirstName = nameParts[0] ?? firstName;
  const customerLastName = nameParts.slice(1).join(" ") || lastName;

  const ilId = num(customer.il_id ?? body.il_id);
  const ilceId = num(customer.ilce_id ?? body.ilce_id);

  const plakaOut = str(body.plaka).trim() || plateNumber;
  const markaOut = str(body.marka).trim() || markaVal;
  const modelOut = str(body.model).trim() || modelVal;
  const modelYiliOut = num(body.modelYili) ?? yearParsed;
  const kullanimOut = str(body.kullanimTarzi).trim() || kullanimVal;

  const tcVknOut = str(body.tcVkn).trim() || tcNo;
  const telefonOut = str(body.telefon).trim() || phone;
  const acikAdresOut = str(body.acikAdres).trim() || undefined;

  const netPrimOut = num(body.netPrim);
  const brutPrimOut = num(body.brutPrim);
  const kdvOut = num(body.kdv);

  const agentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bayiKodu: true },
  });
  const bayi = agentUser?.bayiKodu?.trim();
  if (!bayi) {
    return NextResponse.json(
      {
        error:
          "Hesabınıza atanmış bayi kodu bulunmuyor. Satış yapılamaz; lütfen yönetici ile iletişime geçin.",
      },
      { status: 403 }
    );
  }

  const sozlesmeNo = generateContractNumber(bayi);

  const sale = await prisma.sale.create({
    data: {
      agent_id: session.user.id,
      package_id: pkg.id,
      customer_tc: tcNo,
      customer_first_name: customerFirstName,
      customer_last_name: customerLastName,
      customer_plate: plateNumber,
      car_brand_model: `${markaVal} ${modelVal}`.trim(),
      sale_price: salePrice,
      commission_earned: commissionEarned,
      status: "SUCCESS",
      startDate,
      endDate,
      durationDays,
      kdvRate,
      netPrice: netPricePersisted,
      kdvAmount: kdvAmountPersisted,

      sozlesmeNo,

      plaka: plakaOut || null,
      marka: markaOut || null,
      model: modelOut || null,
      modelYili: modelYiliOut,
      kullanimTarzi: kullanimOut || null,
      netPrim: netPrimOut ?? netPricePersisted,
      brutPrim: brutPrimOut ?? salePrice,
      kdv: kdvOut ?? kdvRate,
      il_id: ilId ?? null,
      ilce_id: ilceId ?? null,
      tcVkn: tcVknOut || null,
      telefon: telefonOut || null,
      acikAdres: acikAdresOut ?? null,
    },
  });

  return NextResponse.json(sale);
}
