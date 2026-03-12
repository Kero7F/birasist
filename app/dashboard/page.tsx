import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type TransactionRow = {
  date: string;
  agent: string;
  policyType: string;
  amount: string;
  status: "success" | "pending" | "rejected";
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

function StatusBadge({ status }: { status: TransactionRow["status"] }) {
  const config = {
    success: {
      label: "Tamamlandı",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    pending: {
      label: "Beklemede",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    },
    rejected: {
      label: "Reddedildi",
      className:
        "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    },
  };
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const agentName = session.user.name ?? "—";

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthLabel = new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(now);

  const [walletResult, customerCountResult, activePoliciesCount, monthProductionResult, walletTransactions, sales] =
    await Promise.all([
      prisma.wallet.findUnique({
        where: { user_id: userId },
        select: { balance: true },
      }),
      prisma.sale.groupBy({
        by: ["customer_tc"],
        where: { agent_id: userId },
      }),
      prisma.sale.count({
        where: { agent_id: userId, status: "SUCCESS" },
      }),
      prisma.sale.aggregate({
        where: {
          agent_id: userId,
          status: "SUCCESS",
          created_at: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { commission_earned: true },
      }),
      prisma.wallet
        .findUnique({
          where: { user_id: userId },
          select: { id: true },
        })
        .then((w) =>
          w
            ? prisma.transaction.findMany({
                where: { wallet_id: w.id },
                orderBy: { created_at: "desc" },
                take: 5,
              })
            : Promise.resolve([])
        ),
      prisma.sale.findMany({
        where: { agent_id: userId },
        orderBy: { created_at: "desc" },
        take: 5,
        include: { package: true },
      }),
    ]);

  const walletBalance = walletResult?.balance ?? 0;
  const totalCustomers = customerCountResult.length;
  const thisMonthProduction = monthProductionResult._sum.commission_earned ?? 0;

  type RecentItem =
    | {
        type: "wallet";
        id: string;
        date: Date;
        agent: string;
        policyType: string;
        amount: number;
        status: "success" | "pending" | "rejected";
      }
    | {
        type: "sale";
        id: string;
        date: Date;
        agent: string;
        policyType: string;
        amount: number;
        status: "success" | "rejected";
      };

  const walletItems: RecentItem[] = walletTransactions.map((t) => ({
    type: "wallet",
    id: t.id,
    date: t.created_at,
    agent: "Cüzdan",
    policyType: t.description,
    amount: t.amount,
    status:
      t.status === "COMPLETED"
        ? "success"
        : t.status === "PENDING"
          ? "pending"
          : "rejected",
  }));

  const saleItems: RecentItem[] = sales.map((s) => ({
    type: "sale",
    id: s.id,
    date: s.created_at,
    agent: agentName,
    policyType: s.package.name,
    amount: s.commission_earned,
    status: s.status === "SUCCESS" ? "success" : "rejected",
  }));

  const recentTransactions: TransactionRow[] = [...walletItems, ...saleItems]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)
    .map((item) => ({
      date: formatDate(item.date),
      agent: item.agent,
      policyType: item.policyType,
      amount: formatAmount(item.amount),
      status: item.status,
    }));

  const kpiCards = [
    {
      label: "Toplam Müşteri",
      value: totalCustomers.toLocaleString("tr-TR"),
      description: "Kayıtlı müşteri sayısı",
    },
    {
      label: "Aktif Poliçe",
      value: activePoliciesCount.toLocaleString("tr-TR"),
      description: "Devam eden poliçeler",
    },
    {
      label: "Cüzdan Bakiyesi",
      value: formatAmount(walletBalance),
      description: "Güncel bakiye",
    },
    {
      label: "Bu Ayki Üretim",
      value: formatAmount(thisMonthProduction),
      description: monthLabel,
    },
  ];

  return (
    <div className="space-y-6">
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Özet metrikler
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-border bg-card p-4 shadow-sm dark:bg-card"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {card.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="transactions-heading">
        <h2
          id="transactions-heading"
          className="mb-4 text-base font-semibold text-foreground"
        >
          Son İşlemler
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
                    Poliçe Türü
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
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Henüz işlem bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((row, index) => (
                    <tr
                      key={`${row.date}-${index}`}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 dark:hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 text-foreground">{row.date}</td>
                      <td className="px-4 py-3 text-foreground">{row.agent}</td>
                      <td className="px-4 py-3 text-foreground">
                        {row.policyType}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {row.amount}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
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
