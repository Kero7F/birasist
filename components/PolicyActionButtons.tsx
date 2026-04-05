"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Activity, FileText, Receipt, XCircle } from "lucide-react";
import { ReceiptModal } from "@/components/ReceiptModal";
import { ContractPreferenceModal } from "@/components/ContractPreferenceModal";
import type { PolicySaleRow } from "@/components/policy-sale-row";

type PolicyActionButtonsProps = {
  sale: PolicySaleRow;
};

export function PolicyActionButtons({ sale }: PolicyActionButtonsProps) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Sözleşme İndir"
          onClick={() => setIsContractModalOpen(true)}
        >
          <FileText className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Makbuz İndir"
          onClick={() => setIsReceiptOpen(true)}
        >
          <Receipt className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Kullanım Durumu"
          onClick={() => {}}
        >
          <Activity className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="İptal Et"
          onClick={() => {}}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={sale}
      />

      <ContractPreferenceModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        sale={sale}
      />
    </>
  );
}
