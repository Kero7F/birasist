import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateAgentForm } from "./CreateAgentForm";

function formatBalance(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function AdminAgentsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    include: { wallet: true },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-8">
      <section aria-labelledby="create-agent-heading">
        <h2
          id="create-agent-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Yeni acente oluştur
        </h2>
        <div className="rounded-lg border border-border bg-card p-4 dark:bg-card">
          <CreateAgentForm />
        </div>
      </section>

      <section aria-labelledby="agents-list-heading">
        <h2
          id="agents-list-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Acente listesi
        </h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 dark:bg-muted/30">
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Ad Soyad
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    E-posta
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Durum
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Cüzdan bakiyesi
                  </th>
                </tr>
              </thead>
              <tbody>
                {agents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Henüz acente bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 dark:hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {agent.first_name} {agent.last_name}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {agent.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            agent.is_active
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {agent.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {formatBalance(agent.wallet?.balance ?? 0)}
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
