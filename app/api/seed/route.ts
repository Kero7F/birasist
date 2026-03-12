import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: "admin@acente.com" }
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: "Admin kullanıcısı zaten mevcut.",
        userId: existing.id
      });
    }

    const passwordHash = await bcrypt.hash("123456", 10);

    const user = await prisma.user.create({
      data: {
        tc_no: "00000000000",
        first_name: "Acente",
        last_name: "Admin",
        phone: "+900000000000",
        email: "admin@acente.com",
        password_hash: passwordHash,
        role: "ADMIN",
        is_active: true
      }
    });

    return NextResponse.json({
      ok: true,
      message: "Admin kullanıcısı başarıyla oluşturuldu.",
      userId: user.id
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Seed işlemi sırasında bir hata oluştu."
      },
      { status: 500 }
    );
  }
}

