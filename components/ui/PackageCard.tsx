import type { Package } from "@prisma/client";

type PackageCardProps = {
  pkg: Package;
  onEdit?: () => void;
  onDelete?: () => void;
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2
  }).format(value);
}

export function PackageCard({ pkg, onEdit, onDelete }: PackageCardProps) {
  const isUnlimited = (value: string) =>
    value.trim().toUpperCase().includes("LİMİTSİZ");

  const limitClass = (value: string) =>
    isUnlimited(value)
      ? "text-emerald-600 font-semibold"
      : "text-gray-900";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <header className="flex items-start justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex-1 pr-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
            {pkg.name}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {pkg.compatibleVehicles || "Uyumlu araç bilgisi yok"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[120px]">
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Fiyat
          </span>
          <span className="text-sm font-bold text-emerald-600">
            {formatPrice(pkg.base_price)}
          </span>
          {onEdit && onDelete && (
            <div className="mt-1 flex items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium text-blue-600 hover:bg-blue-50"
              >
                Düzenle
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium text-red-600 hover:bg-red-50"
              >
                Sil
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 py-3">
        <section className="space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Paket Hakları
          </h4>
          <dl className="divide-y divide-gray-100 rounded-lg border border-gray-100 bg-gray-50/60 text-xs text-gray-700">
            <div className="flex items-center justify-between gap-2 px-3 py-1.5">
              <dt className="text-gray-500">Toplam Limit</dt>
              <dd className={limitClass(pkg.totalLimit)}>{pkg.totalLimit}</dd>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-1.5">
              <dt className="text-gray-500">Arıza Hakkı</dt>
              <dd className={limitClass(pkg.breakdownLimit)}>
                {pkg.breakdownLimit}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-1.5">
              <dt className="text-gray-500">Kaza Hakkı</dt>
              <dd className={limitClass(pkg.accidentLimit)}>
                {pkg.accidentLimit}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-1.5">
              <dt className="text-gray-500">Vinç ile Kurtarma</dt>
              <dd className={limitClass(pkg.towingLimit)}>
                {pkg.towingLimit}
              </dd>
            </div>
            {pkg.replacementCar && (
              <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                <dt className="text-gray-500">İkame Araç</dt>
                <dd className="text-gray-900 font-medium">
                  {pkg.replacementCar}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="mt-3">
          <details className="group rounded-lg border border-gray-200 bg-gray-50/80 text-[11px] text-gray-700">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-medium text-gray-800">
              <span>Daha Fazla Bilgi</span>
              <span className="ml-2 text-[10px] text-gray-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="divide-y divide-gray-100 border-t border-gray-200">
              <div className="space-y-1 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  Açıklama
                </div>
                <p className="text-[11px]">
                  {pkg.limits_description ||
                    "Bu paket için açıklama girilmemiş."}
                </p>
              </div>
              <div className="space-y-1 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  Hizmet Türü
                </div>
                <p>{pkg.serviceType}</p>
              </div>
              <div className="space-y-1 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  Araç Yaş Sınırı
                </div>
                <p>{pkg.ageLimit}</p>
              </div>
              <div className="space-y-1 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  Uyumlu Araçlar
                </div>
                <p>{pkg.compatibleVehicles}</p>
              </div>
            </div>
          </details>
        </section>
      </div>
    </article>
  );
}

