"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Search, Plus } from "lucide-react";

type AgencyPolicyFiltersProps = {
  initialQuery?: string;
  initialPackage?: string;
  initialStatus?: string;
};

export function AgencyPolicyFilters({
  initialQuery,
  initialPackage,
  initialStatus,
}: AgencyPolicyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery ?? "");
  const [pkg, setPkg] = useState(initialPackage ?? "");
  const [status, setStatus] = useState(initialStatus ?? "");

  useEffect(() => {
    setQuery(searchParams.get("query") ?? "");
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

  function handleSelectChange(key: "package" | "status", value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <section
      aria-label="Acente poliçe filtreleri"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="w-full lg:max-w-xl">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Sözleşme No, Plaka veya Müşteri ara..."
            className="pl-9"
            aria-label="Poliçelerim ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:w-auto">
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
        <Link href="/dashboard/sales/new">
          <Button type="button" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Poliçe Kes
          </Button>
        </Link>
      </div>
    </section>
  );
}

