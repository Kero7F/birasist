"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, X } from "lucide-react";
import { ReceiptTemplate } from "@/components/ReceiptTemplate";
import { Button } from "@/components/ui/button";
import { resolvePolicyBayiAdi } from "@/components/policy-bayi-display";
import type { PolicySaleRow } from "@/components/policy-sale-row";

export type { PolicySaleRow } from "@/components/policy-sale-row";

function formatFiyatTry(n: number): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** `customer` string veya relation `{ adSoyad }` olabilir. */
function resolveReceiptCustomerDisplay(sale: PolicySaleRow): string {
  const c = sale.customer as unknown;
  if (c && typeof c === "object" && c !== null && "adSoyad" in c) {
    const ad = String((c as { adSoyad?: string }).adSoyad ?? "").trim();
    if (ad) return ad;
  }
  const musteriAd = sale.musteri?.adSoyad?.trim();
  if (musteriAd) return musteriAd;
  const named = sale.customerName?.trim();
  if (named) return named;
  if (typeof sale.customer === "string" && sale.customer.trim()) {
    return sale.customer.trim();
  }
  return "MÜŞTERİ";
}

type ReceiptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sale: PolicySaleRow;
};

function ReceiptGridField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 w-full flex-row items-start gap-1 sm:gap-2">
      <span className="w-[40%] shrink-0 text-[10px] font-bold leading-snug text-gray-400 sm:text-xs">
        {label}
      </span>
      <span className="w-[60%] min-w-0 break-words text-[10px] font-bold leading-snug text-gray-900 dark:text-white sm:text-sm">
        {value}
      </span>
    </div>
  );
}

export function ReceiptModal({ isOpen, onClose, sale }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    const blob = await pdf(<ReceiptTemplate sale={sale} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safe = String(sale.sozlesmeNo || "Belge").replace(
      /[/\\?%*:|"<>]/g,
      "-"
    );
    link.download = `Tahsilat-Makbuzu-${safe}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [sale]);

  if (!isOpen) return null;

  const bayiResolved = resolvePolicyBayiAdi(sale);
  const bayiAdi =
    bayiResolved === "Bilinmeyen Bayi" ? "—" : bayiResolved;
  const bayiKodu = sale.bayiKodu?.trim() || "—";
  const odemeYontemi = sale.odemeYontemi ?? sale.paymentLabel;
  const krediKartiNo =
    odemeYontemi === "Kredi Kartı" ? "**** **** **** 3495" : "-";
  const fiyatNum = sale.fiyat ?? sale.totalPrice;
  const fiyatDisplay = `₺${formatFiyatTry(fiyatNum)}`;
  const taksitSayisi = String(sale.taksitSayisi ?? 1);
  const footerMusteri = resolveReceiptCustomerDisplay(sale);

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-0 items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#1e1e24]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#151518]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            Kapat
          </Button>
          <Button
            type="button"
            className="gap-2 border-0 bg-orange-500 text-white shadow-sm ring-1 ring-orange-600/20 hover:bg-orange-600 dark:ring-orange-400/30"
            onClick={(e) => {
              e.stopPropagation();
              void handleDownload();
            }}
          >
            <Download className="h-4 w-4" />
            PDF İndir
          </Button>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div
            ref={receiptRef}
            className="w-full min-w-0 max-w-full overflow-x-hidden bg-white px-4 py-6 sm:px-8 sm:py-8 dark:bg-[#1e1e24]"
          >
            <header className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
              <div className="text-2xl font-black tracking-tight">
                <span className="text-[#f87171]">ASIST</span>
                <span className="text-gray-900 dark:text-white">ONE</span>
              </div>
              <a
                href="tel:05067566064"
                className="min-w-0 shrink-0 break-words text-right text-sm font-semibold text-[#f87171] hover:underline sm:text-base"
              >
                0 506 756 60 64
              </a>
            </header>

            <h2
              id="receipt-modal-title"
              className="mt-8 mb-6 text-center text-lg font-semibold text-blue-500"
            >
              TAHSİLAT MAKBUZU
            </h2>

            <div className="grid w-full grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
              <ReceiptGridField label="Bayi Adı" value={bayiAdi} />
              <ReceiptGridField label="Bayi Kodu" value={bayiKodu} />
              <ReceiptGridField label="Sözleşme Numarası" value={sale.sozlesmeNo} />
              <ReceiptGridField label="Tarih" value={sale.saleDateDisplay} />
              <ReceiptGridField label="Kredi Kartı No" value={krediKartiNo} />
              <ReceiptGridField label="Prim Tutarı" value={fiyatDisplay} />
              <ReceiptGridField label="Taksit Sayısı" value={taksitSayisi} />
              <ReceiptGridField
                label="Toplam Prim Tutarı"
                value={fiyatDisplay}
              />
            </div>

            <p className="mt-8 w-full text-sm leading-relaxed break-words whitespace-normal text-gray-400">
              Sayın{" "}
              <span className="text-blue-400">{footerMusteri}</span>
              ,{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {sale.sozlesmeNo}
              </span>{" "}
              nolu hizmet sözleşmenizin bedeli{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {fiyatDisplay}
              </span>{" "}
              olarak tahsil edilmiştir. İşlem tutarınız tahsilat yönteminize göre
              yansıyacaktır. Farklı türlü ödemelerde kredi kartı numarası alanı boş
              görünecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
