"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { deleteAgencyAction } from "./actions";

type DeleteAgencyButtonProps = {
  agencyId: string;
  agencyLabel: string;
};

export function DeleteAgencyButton({
  agencyId,
  agencyLabel,
}: DeleteAgencyButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deleteAgencyAction(agencyId);
      if (result.error) {
        setError(result.error);
        console.error("Silme işlemi başarısız:", result.error);
      } else {
        setIsModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Silme işlemi başarısız:", err);
      setError(
        err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        title={`${agencyLabel} — kalıcı sil`}
        disabled={isDeleting}
        onClick={() => {
          setError(null);
          setIsModalOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/20 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
      >
        <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
        Sil
      </button>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          if (isDeleting) return;
          setIsModalOpen(false);
          setError(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        error={error}
        title="Acenteyi Sil"
        message="Bu acenteyi kaldırmak istediğinize emin misiniz? Bu işlem acenteye ait tüm satış ve müşteri verilerini kalıcı olarak silecektir. Bu işlem geri alınamaz."
      />
    </div>
  );
}
