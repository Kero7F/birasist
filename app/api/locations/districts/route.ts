import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const cityId = req.nextUrl.searchParams.get("cityId");
  const parsedCityId = Number(cityId);

  if (!cityId || Number.isNaN(parsedCityId)) {
    return NextResponse.json(
      { error: "Geçerli bir cityId parametresi zorunludur." },
      { status: 400 }
    );
  }

  try {
    const districts = await prisma.district.findMany({
      where: { il_id: parsedCityId },
      orderBy: { adi: "asc" },
    });

    return NextResponse.json(districts);
  } catch {
    return NextResponse.json(
      { error: "İlçeler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

