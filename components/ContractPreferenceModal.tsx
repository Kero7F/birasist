"use client";

import { useCallback, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import ContractTemplate from "@/components/ContractTemplate";
import type { PolicySaleRow } from "@/components/policy-sale-row";

type ContractPreferenceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sale: PolicySaleRow;
};

export function ContractPreferenceModal({
  isOpen,
  onClose,
  sale,
}: ContractPreferenceModalProps) {
  const [busy, setBusy] = useState(false);

  const handleGenerateContract = useCallback(
    async (isDiscounted: boolean) => {
      setBusy(true);
      try {
        const blob = await pdf(
          <ContractTemplate sale={sale} isDiscounted={isDiscounted} />
        ).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const safe = String(sale.sozlesmeNo || "Belge").replace(
          /[/\\?%*:|"<>]/g,
          "-"
        );
        link.download = `Sozlesme-${safe}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        onClose();
      } finally {
        setBusy(false);
      }
    },
    [onClose, sale]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-pref-title"
      onClick={() => !busy && onClose()}
    >
      <div
        key={sale.id}
        className="w-full max-w-md rounded-xl border border-gray-700 bg-[#1a1a1f] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="contract-pref-title"
          className="mb-4 text-center text-sm font-semibold text-gray-100"
        >
          Satış fiyatının iskonto dahil mi yoksa iskonto hariç mi gösterilmesini
          istersiniz?
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            disabled={busy}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            onClick={() => void handleGenerateContract(false)}
          >
            Satış Tutarıyla Gösterilsin
          </button>
          <button
            type="button"
            disabled={busy}
            className="rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
            onClick={() => void handleGenerateContract(true)}
          >
            İndirimli Tutarla Gösterilsin
          </button>
        </div>
        {busy ? (
          <p className="mt-3 text-center text-xs text-gray-400">
            PDF hazırlanıyor…
          </p>
        ) : null}
      </div>
    </div>
  );
}
