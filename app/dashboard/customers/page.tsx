import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
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
import { Search, Eye, Pencil } from "lucide-react";

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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-xl">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <Input
              placeholder="Ara..."
              className="pl-9"
              aria-label="Müşteri ara"
            />
          </div>
        </div>
        <Button className="inline-flex items-center gap-2">
          + Yeni Müşteri Oluştur
        </Button>
      </div>

      <section
        aria-label="Müşteri CRM tablosu"
        className="rounded-xl border border-border bg-card text-card-foreground"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">MÜŞTERİ TÜRÜ</TableHead>
                <TableHead>MÜŞTERİ/FİRMA ADI</TableHead>
                <TableHead className="whitespace-nowrap">T.C. / V.K.N.</TableHead>
                <TableHead>İL</TableHead>
                <TableHead>İLÇE</TableHead>
                <TableHead className="whitespace-nowrap">KAYIT TARİHİ</TableHead>
                <TableHead className="text-right">İŞLEMLER</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    Henüz kayıtlı müşteri bulunmuyor. Yeni müşteri oluşturarak
                    başlayın.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          customer.type === "Kurumsal"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-300"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        }
                      >
                        {customer.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {customer.identityNumber}
                    </TableCell>
                    <TableCell>{customer.city ?? "—"}</TableCell>
                    <TableCell>{customer.district ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Detayları görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <div>Toplam {customers.length} kayıt</div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
            >
              Önceki
            </Button>
            <span className="text-foreground">
              1 <span className="text-muted-foreground">/ 1</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
            >
              Sonraki
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
