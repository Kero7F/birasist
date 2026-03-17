"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FileDown } from "lucide-react";

type PolicyFiltersProps = {
  initialQuery?: string;
  initialAgency?: string;
  initialPackage?: string;
  initialStatus?: string;
  exportRows: {
    contractNo: string;
    agency: string;
    customer: string;
    customerIdentity: string;
    plateAndVehicle: string;
    packageName: string;
    totalPrice: number;
    createdAt: string;
    statusLabel: string;
  }[];
};

export function PolicyFilters({
  initialQuery,
  initialAgency,
  initialPackage,
  initialStatus,
  exportRows,
}: PolicyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery ?? "");
  const [agency, setAgency] = useState(initialAgency ?? "");
  const [pkg, setPkg] = useState(initialPackage ?? "");
  const [status, setStatus] = useState(initialStatus ?? "");

  useEffect(() => {
    setQuery(searchParams.get("query") ?? "");
    setAgency(searchParams.get("agency") ?? "");
    setPkg(searchParams.get("package") ?? "");
    setStatus(searchParams.get("status") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("query", query);
      } else {
        params.delete("query");
      }
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function handleSelectChange(
    key: "agency" | "package" | "status",
    value: string
  ) {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  const handleExport = () => {
    if (!exportRows.length) return;

    const header = [
      "Sözleşme No",
      "Bayi / Acente",
      "Müşteri",
      "T.C. / V.K.N.",
      "Plaka & Araç",
      "Paket",
      "Fiyat",
      "Tarih",
      "Durum",
    ];

    const rows = exportRows.map((row) => [
      row.contractNo,
      row.agency,
      row.customer,
      row.customerIdentity,
      row.plateAndVehicle,
      row.packageName,
      row.totalPrice.toString().replace(".", ","),
      row.createdAt,
      row.statusLabel,
    ]);

    const csvContent =
      [header, ...rows]
        .map((cols) =>
          cols
            .map((value) => {
              const v = String(value ?? "");
              const escaped = v.replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(";")
        )
        .join("\n") + "\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "police_raporu.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-label="Master history action bar"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="w-full lg:max-w-xl">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Sözleşme No, Plaka, Müşteri veya Bayi ara..."
            className="pl-9"
            aria-label="Master history ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-3 lg:w-auto">
        <Select
          value={agency || "all"}
          onValueChange={(value) => handleSelectChange("agency", value)}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="Tüm Bayiler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Bayiler</SelectItem>
            <SelectItem value="merkez">Merkez Acente</SelectItem>
            <SelectItem value="nks">NKS Sigorta</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={pkg || "all"}
          onValueChange={(value) => handleSelectChange("package", value)}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="Tüm Paketler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Paketler</SelectItem>
            <SelectItem value="standart">Standart</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status || "all"}
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="Tüm Durumlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="expired">Süresi Dolan</SelectItem>
            <SelectItem value="cancelled">İptal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full items-center justify-end lg:w-auto">
        <Button
          type="button"
          variant="outline"
          className="inline-flex items-center gap-2"
          onClick={handleExport}
        >
          <FileDown className="h-4 w-4" />
          Dışa Aktar
        </Button>
      </div>
    </section>
  );
}

