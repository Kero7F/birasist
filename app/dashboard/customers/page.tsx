import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateCustomerForm } from "./CreateCustomerForm";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export default async function CustomersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const agentId = session.user.id;

  const customers = await prisma.customer.findMany({
    where: { agent_id: agentId },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-8">
      <section aria-labelledby="create-customer-heading">
        <h2
          id="create-customer-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Yeni müşteri ekle
        </h2>
        <div className="rounded-lg border border-border bg-card p-4 dark:bg-card">
          <CreateCustomerForm />
        </div>
      </section>

      <section aria-labelledby="customers-list-heading">
        <h2
          id="customers-list-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Müşteri listesi
        </h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-left text-sm">
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
                    TC No
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Telefon
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Kayıt tarihi
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Henüz müşteri bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 dark:hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {customer.full_name}
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono text-xs">
                        {customer.tc_no}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(customer.created_at)}
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
