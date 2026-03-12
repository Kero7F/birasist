"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  FileText,
  Lock,
  ScrollText,
  User,
  XCircle,
} from "lucide-react";

type AgentInfo = {
  name?: string | null;
  email?: string | null;
};

type PolicyRow = {
  id: string;
  policyNumber: string;
  customerName: string;
  plateNumber: string;
  packageName: string;
  packagePrice: number;
  createdAt: string;
  agent?: AgentInfo | null;
};

type PoliciesTableProps = {
  policies: PolicyRow[];
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function PoliciesTable({ policies }: PoliciesTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedReceiptPolicy, setSelectedReceiptPolicy] =
    useState<PolicyRow | null>(null);
  const [search, setSearch] = useState("");

  const filteredPolicies = useMemo(() => {
    if (!search.trim()) return policies;
    const term = search.toLowerCase();
    return policies.filter((p) => {
      return (
        p.policyNumber.toLowerCase().includes(term) ||
        p.customerName.toLowerCase().includes(term) ||
        p.plateNumber.toLowerCase().includes(term) ||
        p.packageName.toLowerCase().includes(term)
      );
    });
  }, [policies, search]);

  const handleToggleExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const handleOpenReceipt = (policy: PolicyRow) => {
    setSelectedReceiptPolicy(policy);
  };

  const handleCloseReceipt = () => {
    setSelectedReceiptPolicy(null);
  };

  const totalCount = filteredPolicies.length;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara (müşteri, plaka, paket, sözleşme no)..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted"
          >
            <FileText className="h-3.5 w-3.5" />
            Dışa Aktar
          </button>
          <Link
            href="/dashboard/sales/new"
            className="inline-flex items-center gap-1 rounded-md border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:brightness-110"
          >
            Yeni Poliçe Kes
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8 px-2 py-2 text-left" />
              <th className="px-2 py-2 text-left">İşlemler</th>
              <th className="px-2 py-2 text-left">Ödeme</th>
              <th className="px-2 py-2 text-left">Sözleşme No</th>
              <th className="px-2 py-2 text-left">Müşteri</th>
              <th className="px-2 py-2 text-left">Plaka</th>
              <th className="px-2 py-2 text-left">Paket</th>
              <th className="px-2 py-2 text-right">P. Fiyatı</th>
              <th className="px-2 py-2 text-right">Tarihler</th>
            </tr>
          </thead>
          <tbody>
            {filteredPolicies.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-6 text-center text-xs text-muted-foreground"
                >
                  Henüz poliçe bulunmamaktadır.
                </td>
              </tr>
            ) : (
              filteredPolicies.map((policy) => {
                const isExpanded = expandedRowId === policy.id;
                const shortPolicyNumber = policy.policyNumber.slice(0, 10);
                const agentDisplay =
                  policy.agent?.name && policy.agent.name.trim().length > 0
                    ? policy.agent.name
                    : policy.agent?.email ?? "-";

                return (
                  <>
                    <tr
                      key={policy.id}
                      className="border-b border-border/70 bg-background/40 hover:bg-muted/60"
                    >
                      {/* Expand toggle */}
                      <td className="px-2 py-2 align-top">
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(policy.id)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted"
                          aria-label={
                            isExpanded ? "Satır detayını gizle" : "Satır detayını göster"
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-2 py-2 align-top">
                        <div className="flex items-center gap-1.5">
                          {/* Sözleşme */}
                          <button
                            type="button"
                            title="Sözleşme"
                            onClick={() =>
                              alert("PDF Sözleşme modülü yakında eklenecek.")
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-100 bg-red-50 text-[11px] text-red-600 hover:bg-red-100"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>

                          {/* Makbuz */}
                          <button
                            type="button"
                            title="Makbuz"
                            onClick={() => handleOpenReceipt(policy)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-[11px] text-gray-600 hover:bg-muted"
                          >
                            <ScrollText className="h-3.5 w-3.5" />
                          </button>

                          {/* Kullanım durumu */}
                          <button
                            type="button"
                            title="Sözleşme Kullanım Durumu"
                            onClick={() =>
                              alert("Kullanım durumu sayfası yakında eklenecek.")
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50 text-[11px] text-emerald-600 hover:bg-emerald-100"
                          >
                            <Activity className="h-3.5 w-3.5" />
                          </button>

                          {/* İptal */}
                          <button
                            type="button"
                            title="Paketi İptal Et"
                            onClick={() => {
                              if (
                                typeof window !== "undefined" &&
                                window.confirm(
                                  "Bu poliçeyi iptal etmek istediğinize emin misiniz?"
                                )
                              ) {
                                alert("İptal işlemi modülü yakında eklenecek.");
                              }
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-[11px] text-red-600 hover:bg-red-100"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Ödeme */}
                      <td className="px-2 py-2 align-top">
                        <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          <span>Cüzdan</span>
                        </div>
                      </td>

                      {/* Sözleşme No */}
                      <td className="px-2 py-2 align-top">
                        <button
                          type="button"
                          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                        >
                          {shortPolicyNumber}
                        </button>
                      </td>

                      {/* Müşteri */}
                      <td className="px-2 py-2 align-top">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground">
                            {policy.customerName}
                          </span>
                        </div>
                      </td>

                      {/* Plaka */}
                      <td className="px-2 py-2 align-top">
                        <span className="rounded border border-border bg-background px-2 py-0.5 text-[11px] font-mono">
                          {policy.plateNumber}
                        </span>
                      </td>

                      {/* Paket */}
                      <td className="px-2 py-2 align-top">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                          {policy.packageName}
                        </span>
                      </td>

                      {/* Fiyat */}
                      <td className="px-2 py-2 text-right align-top">
                        <span className="font-medium text-foreground">
                          {formatCurrency(policy.packagePrice)}
                        </span>
                      </td>

                      {/* Tarihler */}
                      <td className="px-2 py-2 text-right align-top">
                        <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                          <span>{formatDate(policy.createdAt)}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {isExpanded && (
                      <tr className="border-b border-border/70 bg-muted/30">
                        <td colSpan={9} className="px-6 py-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Satış Yapan Bayi
                              </div>
                              <div className="text-xs text-foreground">
                                {agentDisplay}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
        <div>
          Gösterilen kayıt sayısı:{" "}
          <span className="font-medium text-foreground">{totalCount}</span>
        </div>
      </div>

      {/* Makbuz Modal */}
      {selectedReceiptPolicy && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold text-blue-600">
                TAHSİLAT MAKBUZU
              </h2>
              <button
                type="button"
                onClick={handleCloseReceipt}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Kapat
              </button>
            </div>
            <div className="space-y-3 px-4 py-3 text-xs text-foreground">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Bayi Adı
                  </div>
                  <div className="mt-0.5">
                    {selectedReceiptPolicy.agent?.name ||
                      selectedReceiptPolicy.agent?.email ||
                      "-"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Sözleşme Numarası
                  </div>
                  <div className="mt-0.5">
                    {selectedReceiptPolicy.policyNumber}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Tarih
                  </div>
                  <div className="mt-0.5">
                    {formatDate(selectedReceiptPolicy.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Prim Tutarı
                  </div>
                  <div className="mt-0.5">
                    {formatCurrency(selectedReceiptPolicy.packagePrice)}
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Sayın{" "}
                <span className="font-semibold text-foreground">
                  {selectedReceiptPolicy.customerName}
                </span>
                ,{" "}
                <span className="font-semibold text-foreground">
                  {selectedReceiptPolicy.policyNumber}
                </span>{" "}
                nolu hizmet sözleşmenizin bedeli{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(selectedReceiptPolicy.packagePrice)}
                </span>{" "}
                olarak tahsil edilmiştir.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-4 py-2.5">
              <button
                type="button"
                onClick={handleCloseReceipt}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

