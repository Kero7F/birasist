import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TopUpForm } from "./TopUpForm";

function formatBalance(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const TRANSACTION_TYPE_DISPLAY: Record<string, string> = {
  EARN: "CREDIT",
  WITHDRAW: "DEBIT",
  REFUND: "DEBIT",
};

export default async function AdminWalletsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [agents, transactions] = await Promise.all([
    prisma.user.findMany({
      where: { role: "AGENT" },
      include: { wallet: true },
      orderBy: { created_at: "desc" },
    }),
    prisma.transaction.findMany({
      take: 20,
      orderBy: { created_at: "desc" },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const agentsForSelect = agents
    .filter((a) => a.wallet != null)
    .map((a) => ({
      id: a.id,
      firstName: a.first_name,
      lastName: a.last_name,
      balance: a.wallet!.balance,
    }));

  return (
    <div className="space-y-8">
      <section aria-labelledby="topup-heading">
        <h2
          id="topup-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Bakiye yükle
        </h2>
        <div className="rounded-lg border border-border bg-card p-4 dark:bg-card">
          <TopUpForm agents={agentsForSelect} />
        </div>
      </section>

      <section aria-labelledby="ledger-heading">
        <h2
          id="ledger-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          İşlem geçmişi (son 20)
        </h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 dark:bg-muted/30">
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Tarih
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Acente
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Tür
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Tutar
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Bakiye önce
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    Bakiye sonra
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Henüz işlem bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isCredit = tx.type === "EARN";
                    const typeLabel =
                      TRANSACTION_TYPE_DISPLAY[tx.type] ?? tx.type;
                    const agentName = tx.wallet?.user
                      ? `${tx.wallet.user.first_name} ${tx.wallet.user.last_name}`
                      : "—";
                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-border last:border-b-0 hover:bg-muted/30 dark:hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 text-foreground">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {agentName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-medium ${
                              isCredit
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {typeLabel}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 font-medium ${
                            isCredit
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatBalance(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {tx.balance_before != null
                            ? formatBalance(tx.balance_before)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {tx.balance_after != null
                            ? formatBalance(tx.balance_after)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
