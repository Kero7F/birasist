import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SalesWizard } from "./SalesWizard";

export default async function NewSalePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const agentId = session.user.id;

  const [customers, packages] = await Promise.all([
    prisma.customer.findMany({
      where: { agent_id: agentId },
      orderBy: { full_name: "asc" },
      select: { id: true, full_name: true, tc_no: true, phone: true }
    }),
    prisma.package.findMany({
      where: { is_active: true },
      orderBy: { created_at: "asc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-foreground">
        Yeni Satış / Poliçe Oluştur
      </h1>
      <SalesWizard customers={customers} packages={packages} />
    </div>
  );
}

