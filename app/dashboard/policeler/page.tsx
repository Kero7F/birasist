import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PoliciesTable } from "@/components/ui/PoliciesTable";

export default async function PoliciesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  const sales = await prisma.sale.findMany({
    where: isAdmin ? {} : { agent_id: session.user.id },
    include: {
      package: true,
      agent: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const policies = sales.map((sale) => ({
    id: sale.id,
    policyNumber: sale.policyNumber,
    customerName: `${sale.customer_first_name} ${sale.customer_last_name}`.trim(),
    plateNumber: sale.customer_plate,
    packageName: sale.package.name,
    packagePrice: sale.sale_price,
    createdAt: sale.created_at.toISOString(),
    agent: {
      name: `${sale.agent.first_name} ${sale.agent.last_name}`.trim(),
      email: sale.agent.email,
    },
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">Poliçeler</h1>
      <PoliciesTable policies={policies} />
    </div>
  );
}

