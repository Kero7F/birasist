import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VehicleForm } from "./VehicleForm";

export default async function VehiclesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const agentId = session.user.id;

  const customers = await prisma.customer.findMany({
    where: { agent_id: agentId },
    orderBy: { full_name: "asc" },
    select: { id: true, full_name: true },
  });

  const vehicles = await prisma.vehicle.findMany({
    where: { customer: { agent_id: agentId } },
    orderBy: { created_at: "desc" },
    include: { customer: { select: { full_name: true } } },
  });

  return (
    <div className="space-y-8">
      <section aria-labelledby="vehicle-form-heading">
        <h2
          id="vehicle-form-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Yeni araç ekle
        </h2>
        <div className="rounded-lg border border-border bg-card p-6 dark:bg-card">
          <VehicleForm
            customers={customers.map((c) => ({ id: c.id, full_name: c.full_name }))}
          />
        </div>
      </section>

      <section aria-labelledby="vehicles-list-heading">
        <h2
          id="vehicles-list-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Araç listesi
        </h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 dark:bg-muted/30">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Plaka
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Marka / Model
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Yıl
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Kullanım türü
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Müşteri
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Henüz araç bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 dark:hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium text-foreground font-mono">
                        {v.plate_number}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {v.brand} / {v.model}
                      </td>
                      <td className="px-4 py-3 text-foreground">{v.year}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {v.usage_type}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {v.customer.full_name}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
