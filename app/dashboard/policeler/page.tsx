import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PolicyActionButtons } from "@/components/PolicyActionButtons";
import { AgencyPolicyFilters } from "./AgencyPolicyFilters";

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
  }).format(d);
}

type SearchParams = {
  query?: string;
  package?: string;
  status?: string;
  page?: string;
};

function mapStatusParamToEnum(status?: string): "SUCCESS" | "CANCELLED" | undefined {
  if (!status) return undefined;
  const s = status.trim().toLowerCase();
  if (s === "success" || s === "active") return "SUCCESS";
  if (s === "cancelled" || s === "canceled") return "CANCELLED";
  // "expired" isn't represented in current schema; ignore it for filtering.
  return undefined;
}

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  const pageSize = 10;
  const page = Number(searchParams.page ?? "1") || 1;
  const skip = (page - 1) * pageSize;

  const { query, package: pkg, status } = searchParams;

  const where: any = { agent_id: session.user.id };

  if (query && query.trim()) {
    const q = query.trim();
    where.OR = [
      { policyNumber: { contains: q, mode: "insensitive" } },
      { customer_first_name: { contains: q, mode: "insensitive" } },
      { customer_last_name: { contains: q, mode: "insensitive" } },
      { customer_tc: { contains: q, mode: "insensitive" } },
      { customer_plate: { contains: q, mode: "insensitive" } },
      {
        agent: {
          OR: [
            { first_name: { contains: q, mode: "insensitive" } },
            { last_name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
      },
      {
        package: {
          name: { contains: q, mode: "insensitive" },
        },
      },
    ];
  }

  if (pkg) {
    // pkg is a UI slug/name (e.g. "premium"); never pass it to UUID fields.
    where.package = {
      name: { equals: pkg, mode: "insensitive" },
    };
  }

  if (status) {
    const mapped = mapStatusParamToEnum(status);
    if (mapped) where.status = mapped;
  }

  const [sales, totalCount] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        package: true,
        agent: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            bayiKodu: true,
            sirketAdi: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.sale.count({ where }),
  ]);

  const rows = sales.map((sale) => {
    const s = sale as (typeof sale) & {
      durationDays: number;
      netPrice: number | null;
      kdvAmount: number | null;
      kdvRate: number;
    };
    const agentName = `${sale.agent.first_name} ${sale.agent.last_name}`.trim();
    const statusLabel =
      sale.status === "SUCCESS"
        ? "Aktif"
        : sale.status === "CANCELLED"
          ? "İptal"
          : "Süresi Dolan";
    const packagePrice =
      sale.package.price > 0 ? sale.package.price : sale.package.base_price;
    const datesText = `Başlangıç: ${formatDate(sale.startDate)}\nSatış: ${formatDate(sale.created_at)}`;
    const commissionPreview = sale.sale_price * 0.3;
    const sozlesmeNo = sale.sozlesmeNo ?? sale.policyNumber;
    const rawBayi = sale.agent.bayiKodu;
    const bayiKodu =
      rawBayi != null && String(rawBayi).trim() !== ""
        ? String(rawBayi).trim()
        : "";

    return {
      id: sale.id,
      sozlesmeNo,
      contractNo: sale.policyNumber,
      agency: agentName || sale.agent.email,
      sirketAdi: sale.agent.sirketAdi ?? null,
      bayiKodu,
      customer: `${sale.customer_first_name} ${sale.customer_last_name}`.trim(),
      customerIdentity: sale.customer_tc,
      plate: sale.customer_plate,
      plateAndVehicle: `${sale.customer_plate} • ${sale.car_brand_model}`.trim(),
      packageName: sale.package.name,
      packagePrice,
      totalPrice: sale.sale_price,
      paymentLabel: "Nakit/POS",
      discountDisplay: "0,00₺",
      commissionDisplay: commissionPreview,
      datesText,
      saleDateDisplay: formatDate(sale.created_at),
      createdAt: sale.created_at.toISOString(),
      startDate: sale.startDate.toISOString(),
      endDate: sale.endDate ? sale.endDate.toISOString() : null,
      durationDays: s.durationDays,
      netPrice: s.netPrice ?? null,
      kdvAmount: s.kdvAmount ?? null,
      kdvRate: s.kdvRate ?? null,
      acikAdres: sale.acikAdres ?? null,
      marka: sale.marka ?? null,
      model: sale.model ?? null,
      modelYili: sale.modelYili ?? null,
      kullanimTarzi: sale.kullanimTarzi ?? null,
      carBrandModel: sale.car_brand_model,
      statusLabel,
    };
  });

  const exportRows = rows.map((row) => ({
    contractNo: row.contractNo,
    agency: row.agency,
    customer: row.customer,
    customerIdentity: row.customerIdentity,
    plateAndVehicle: row.plateAndVehicle,
    packageName: row.packageName,
    totalPrice: row.totalPrice,
    createdAt: formatDate(new Date(row.createdAt)),
    statusLabel: row.statusLabel,
  }));

  const start = totalCount === 0 ? 0 : skip + 1;
  const end = Math.min(skip + pageSize, totalCount);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">Satış Listesi</h1>
        <p className="text-sm text-muted-foreground">
          Gerçekleştirdiğiniz satışların özeti.
        </p>
      </header>

      <AgencyPolicyFilters
        initialQuery={searchParams.query}
        initialPackage={searchParams.package}
        initialStatus={searchParams.status}
      />

      <section
        aria-label="Master history data grid"
        className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">İŞLEMLER</TableHead>
                <TableHead className="whitespace-nowrap">ÖDEME</TableHead>
                <TableHead className="whitespace-nowrap">SÖZLEŞME NO</TableHead>
                <TableHead className="whitespace-nowrap">MÜŞTERİ</TableHead>
                <TableHead className="whitespace-nowrap">PLAKA</TableHead>
                <TableHead className="whitespace-nowrap">PAKET</TableHead>
                <TableHead className="whitespace-nowrap text-right">
                  P.FİYATI
                </TableHead>
                <TableHead className="whitespace-nowrap text-right">
                  S.FİYATI
                </TableHead>
                <TableHead className="whitespace-nowrap text-right">
                  İSKONTO
                </TableHead>
                <TableHead className="whitespace-nowrap text-right">
                  KOMİSYON
                </TableHead>
                <TableHead className="whitespace-nowrap min-w-[140px]">
                  TARİHLER
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    Kayıt bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/40">
                    <TableCell className="align-middle">
                      <PolicyActionButtons sale={row} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {row.paymentLabel}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.contractNo}
                    </TableCell>
                    <TableCell className="min-w-[220px]">
                      <div className="leading-tight">
                        <div className="font-medium text-foreground">
                          {row.customer}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {row.customerIdentity}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm whitespace-nowrap">
                      {row.plate}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.packageName}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(row.packagePrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(row.packagePrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.discountDisplay}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(row.commissionDisplay)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="whitespace-pre-line text-xs leading-snug">
                        {row.datesText}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            Toplam {totalCount} kayıttan {start}-{end} arası gösteriliyor.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 px-2">
              Önceki
            </Button>
            <span className="text-foreground">
              {page} <span className="text-muted-foreground">/ 1</span>
            </span>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              Sonraki
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

