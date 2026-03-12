"use client";

import { useFormState } from "react-dom";
import { createPackage, type CreatePackageState } from "./actions";

export function CreatePackageForm() {
  const [state, formAction] = useFormState<CreatePackageState, FormData>(
    createPackage,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md border border-red-500/60 bg-red-950/60 px-3 py-2 text-sm text-red-100">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md border border-emerald-500/60 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-100">
          Paket başarıyla oluşturuldu.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <label
            htmlFor="package-name"
            className="block text-sm font-medium text-muted-foreground"
          >
            Paket adı
          </label>
          <input
            id="package-name"
            name="name"
            type="text"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. Kasko Temel"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="package-price"
            className="block text-sm font-medium text-muted-foreground"
          >
            Fiyat (₺)
          </label>
          <input
            id="package-price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="0,00"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label
            htmlFor="package-totalLimit"
            className="block text-sm font-medium text-muted-foreground"
          >
            Toplam Limit
          </label>
          <input
            id="package-totalLimit"
            name="totalLimit"
            type="text"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. 25.000,00 veya LİMİTSİZ"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="package-breakdownLimit"
            className="block text-sm font-medium text-muted-foreground"
          >
            Arıza Hakkı
          </label>
          <input
            id="package-breakdownLimit"
            name="breakdownLimit"
            type="text"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. 2 - 5.000,00 / Olay Başı"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="package-accidentLimit"
            className="block text-sm font-medium text-muted-foreground"
          >
            Kaza Hakkı
          </label>
          <input
            id="package-accidentLimit"
            name="accidentLimit"
            type="text"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. 2 - 5.000,00 / Olay Başı"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="package-towingLimit"
            className="block text-sm font-medium text-muted-foreground"
          >
            Vinç ile Kurtarma
          </label>
          <input
            id="package-towingLimit"
            name="towingLimit"
            type="text"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. 1 - 5.000,00 / Olay Başı"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <label
            htmlFor="package-replacementCar"
            className="block text-sm font-medium text-muted-foreground"
          >
            İkame Araç (opsiyonel)
          </label>
          <input
            id="package-replacementCar"
            name="replacementCar"
            type="text"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. 7 Gün"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="package-serviceType"
            className="block text-sm font-medium text-muted-foreground"
          >
            Hizmet Türü
          </label>
          <input
            id="package-serviceType"
            name="serviceType"
            type="text"
            defaultValue="EN YAKIN TAMİRHANE"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="package-ageLimit"
            className="block text-sm font-medium text-muted-foreground"
          >
            Araç Yaş Sınırı
          </label>
          <input
            id="package-ageLimit"
            name="ageLimit"
            type="text"
            defaultValue="Yaş sınırı yoktur"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="package-compatibleVehicles"
          className="block text-sm font-medium text-muted-foreground"
        >
          Uyumlu Araçlar
        </label>
        <textarea
          id="package-compatibleVehicles"
          name="compatibleVehicles"
          rows={2}
          className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          placeholder="Örn. Hususi otomobil, panelvan, 3.5T'ye kadar kamyonet vb."
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="package-description"
          className="block text-sm font-medium text-muted-foreground"
        >
          Açıklama / Detaylı Notlar
        </label>
        <textarea
          id="package-description"
          name="description"
          rows={3}
          className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          placeholder="Paket kapsamı ve detaylı açıklamalar..."
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="package-isActive"
          name="isActive"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border border-border bg-background text-primary focus:ring-2 focus:ring-ring"
        />
        <label
          htmlFor="package-isActive"
          className="text-sm font-medium text-foreground"
        >
          Paket aktif olsun
        </label>
      </div>
      <button
        type="submit"
        className="rounded-lg border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus:ring-2 focus:ring-ring"
      >
        Paket Oluştur
      </button>
    </form>
  );
}
