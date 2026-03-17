import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Banknote, ArrowDownToLine, Coins, Clock } from "lucide-react";
import { RequestBalanceButton } from "@/components/RequestBalanceButton";

type TransactionType = "CREDIT" | "DEBIT";

function formatCurrency(value: number): string {
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

function getTypeBadge(txType: TransactionType) {
  if (txType === "CREDIT") {
    return {
      label: "Yükleme",
      className:
        "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700",
    };
  }

  return {
    label: "Kesinti",
    className:
      "inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700",
  };
}

export default async function AgentWalletPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const wallet = await prisma.wallet.findUnique({
    where: { user_id: userId },
    include: {
      transactions: {
        orderBy: { created_at: "desc" },
        take: 20,
      },
    },
  });

  const balance = wallet?.balance ?? 0;
  const transactions = wallet?.transactions ?? [];

  let totalLoaded = 0;
  let totalSpent = 0;

  for (const tx of transactions) {
    // tx.type assumed EARN / WITHDRAW / REFUND like admin page
    const logicalType: TransactionType =
      tx.type === "EARN" ? "CREDIT" : "DEBIT";

    if (logicalType === "CREDIT") {
      totalLoaded += tx.amount;
    } else {
      totalSpent += tx.amount;
    }
  }

  const pendingAmount = 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">
            Komisyon Çekme Talepleri
          </h1>
          <p className="text-sm text-muted-foreground">
            Komisyon talebi oluşturabilmeniz için biriken bakiyenizin en az ₺1.000,00 olması gerekmektedir.
          </p>
          <p className="text-xs text-red-500">
            Not: Her ayın 01-31 aralığında oluşturulan komisyon çekme talepleri onaylandığı takdirde, takip eden ayın 15&apos;inde yatırılacaktır.
          </p>
        </div>
        <RequestBalanceButton />
      </header>

      <section aria-label="Bakiye özetleri">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
          <div className="bg-card text-card-foreground border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Toplam Kazanç
                </p>
                <p className="mt-2 text-2xl font-semibold text-card-foreground">
                  {formatCurrency(totalLoaded)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Toplam Çekilen
                </p>
                <p className="mt-2 text-2xl font-semibold text-card-foreground">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ArrowDownToLine className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Biriken Bakiye
                </p>
                <p className="mt-2 text-2xl font-semibold text-card-foreground">
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Coins className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bekleyen Bakiye
                </p>
                <p className="mt-2 text-2xl font-semibold text-card-foreground">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="wallet-transactions-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="wallet-transactions-heading"
            className="text-base font-semibold text-foreground"
          >
            İşlem Geçmişi
          </h2>
          <p className="text-xs text-muted-foreground">
            Son {transactions.length} işlem görüntüleniyor.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Tarih
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    İşlem Türü
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Tutar
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Açıklama
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      Henüz cüzdan işleminiz bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const logicalType: TransactionType =
                      tx.type === "EARN" ? "CREDIT" : "DEBIT";
                    const badge = getTypeBadge(logicalType);

                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-border last:border-b-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 text-foreground">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={badge.className}>{badge.label}</span>
                        </td>
                        <td
                          className={`px-4 py-3 font-medium ${
                            logicalType === "CREDIT"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {tx.description ?? "—"}
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

