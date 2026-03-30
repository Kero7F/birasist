import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { adi: "asc" },
    });

    return NextResponse.json(cities);
  } catch {
    return NextResponse.json(
      { error: "Şehirler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

