"use client";

import { useState, useTransition } from "react";
import type { Package } from "@prisma/client";
import {
  createPackage,
  type CreatePackageState,
  updatePackage,
  deletePackage,
  togglePackageStatus
} from "./actions";
import { PackageCard } from "@/components/ui/PackageCard";

type AdminPackagesClientProps = {
  packages: Package[];
};

type FormMode = "create" | "update";

type FormState = {
  name: string;
  price: string;
  description: string;
  totalLimit: string;
  breakdownLimit: string;
  accidentLimit: string;
  towingLimit: string;
  replacementCar: string;
  serviceType: string;
  ageLimit: string;
  compatibleVehicles: string;
  isActive: boolean;
};

const defaultFormState: FormState = {
  name: "",
  price: "",
  description: "",
  totalLimit: "",
  breakdownLimit: "",
  accidentLimit: "",
  towingLimit: "",
  replacementCar: "",
  serviceType: "EN YAKIN TAMİRHANE",
  ageLimit: "Yaş sınırı yoktur",
  compatibleVehicles: "",
  isActive: true
};

export function AdminPackagesClient({ packages }: AdminPackagesClientProps) {
  const [mode, setMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (pkg: Package) => {
    setMode("update");
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      price: String(pkg.base_price),
      description: pkg.limits_description ?? "",
      totalLimit: pkg.totalLimit,
      breakdownLimit: pkg.breakdownLimit,
      accidentLimit: pkg.accidentLimit,
      towingLimit: pkg.towingLimit,
      replacementCar: pkg.replacementCar ?? "",
      serviceType: pkg.serviceType,
      ageLimit: pkg.ageLimit,
      compatibleVehicles: pkg.compatibleVehicles,
      isActive: pkg.is_active
    });
    setMessage(null);
    setError(null);
  };

  const handleCancel = () => {
    setMode("create");
    setEditingId(null);
    setForm(defaultFormState);
    setMessage(null);
    setError(null);
  };

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("price", form.price);
    fd.set("description", form.description);
    fd.set("totalLimit", form.totalLimit);
    fd.set("breakdownLimit", form.breakdownLimit);
    fd.set("accidentLimit", form.accidentLimit);
    fd.set("towingLimit", form.towingLimit);
    if (form.replacementCar) fd.set("replacementCar", form.replacementCar);
    fd.set("serviceType", form.serviceType);
    fd.set("ageLimit", form.ageLimit);
    fd.set("compatibleVehicles", form.compatibleVehicles);
    if (form.isActive) fd.set("isActive", "on");

    startTransition(async () => {
      let result: CreatePackageState;
      if (mode === "create") {
        result = await createPackage({ error: undefined, success: undefined }, fd);
      } else if (editingId) {
        result = await updatePackage(editingId, fd);
      } else {
        setError("Güncellenecek paket seçilemedi.");
        return;
      }

      if (result.error) {
        setError(result.error);
      } else {
        setMessage(mode === "create" ? "Paket oluşturuldu." : "Paket güncellendi.");
        if (mode === "create") {
          setForm(defaultFormState);
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Bu paketi silmek istediğinize emin misiniz?")
    ) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await deletePackage(id);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage("Paket silindi.");
        if (editingId === id) {
          handleCancel();
        }
      }
    });
  };

  const handleToggleStatus = (id: string) => {
    const fd = new FormData();
    fd.set("packageId", id);
    startTransition(async () => {
      await togglePackageStatus(fd);
    });
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="create-package-heading">
        <h2
          id="create-package-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          {mode === "create" ? "Yeni paket oluştur" : "Paketi güncelle"}
        </h2>
        <div className="rounded-lg border border-border bg-card p-4 dark:bg-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-500/60 bg-red-950/60 px-3 py-2 text-sm text-red-100">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-md border border-emerald-500/60 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-100">
                {message}
              </div>
            )}

            {/* Name & Price */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="pkg-name"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Paket adı
                </label>
                <input
                  id="pkg-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                  placeholder="Örn. Kasko Temel"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="pkg-price"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Fiyat (₺)
                </label>
                <input
                  id="pkg-price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Limits */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="pkg-totalLimit"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Toplam Limit
                </label>
                <input
                  id="pkg-totalLimit"
                  type="text"
                  required
                  value={form.totalLimit}
                  onChange={(e) => handleChange("totalLimit", e.target.value)}
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                  placeholder="Örn. 25.000,00 veya LİMİTSİZ"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="pkg-breakdownLimit"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Arıza Hakkı
                </label>
                <input
                  id="pkg-breakdownLimit"
                  type="text"
                  required
                  value={form.breakdownLimit}
                  onChange={(e) =>
                    handleChange("breakdownLimit", e.target.value)
                  }
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                  placeholder="Örn. 2 - 5.000,00 / Olay Başı"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="pkg-accidentLimit"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Kaza Hakkı
                </label>
                <input
                  id="pkg-accidentLimit"
                  type="text"
                  required
                  value={form.accidentLimit}
                  onChange={(e) =>
                    handleChange("accidentLimit", e.target.value)
                  }
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                  placeholder="Örn. 2 - 5.000,00 / Olay Başı"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="pkg-towingLimit"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Vinç ile Kurtarma
                </label>
                <input
                  id="pkg-towingLimit"
                  type="text"
                  required
                  value={form.towingLimit}
                  onChange={(e) =>
                    handleChange("towingLimit", e.target.value)
                  }
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                  placeholder="Örn. 1 - 5.000,00 / Olay Başı"
                />
              </div>
            </div>

            {/* Extra fields */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="pkg-replacementCar"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  İkame Araç (opsiyonel)
                </label>
                <input
                  id="pkg-replacementCar"
                  type="text"
                  value={form.replacementCar}
                  onChange={(e) =>
                    handleChange("replacementCar", e.target.value)
                  }
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                  placeholder="Örn. 7 Gün"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="pkg-serviceType"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Hizmet Türü
                </label>
                <input
                  id="pkg-serviceType"
                  type="text"
                  value={form.serviceType}
                  onChange={(e) =>
                    handleChange("serviceType", e.target.value)
                  }
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="pkg-ageLimit"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Araç Yaş Sınırı
                </label>
                <input
                  id="pkg-ageLimit"
                  type="text"
                  value={form.ageLimit}
                  onChange={(e) => handleChange("ageLimit", e.target.value)}
                  className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="pkg-compatibleVehicles"
                className="block text-sm font-medium text-muted-foreground"
              >
                Uyumlu Araçlar
              </label>
              <textarea
                id="pkg-compatibleVehicles"
                rows={2}
                value={form.compatibleVehicles}
                onChange={(e) =>
                  handleChange("compatibleVehicles", e.target.value)
                }
                className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                placeholder="Örn. Hususi otomobil, panelvan, 3.5T'ye kadar kamyonet vb."
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="pkg-description"
                className="block text-sm font-medium text-muted-foreground"
              >
                Açıklama / Detaylı Notlar
              </label>
              <textarea
                id="pkg-description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  handleChange("description", e.target.value)
                }
                className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                placeholder="Paket kapsamı ve detaylı açıklamalar..."
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="h-4 w-4 rounded border border-border bg-background text-primary focus:ring-2 focus:ring-ring"
                />
                <span>Paket aktif olsun</span>
              </label>

              <div className="flex items-center gap-2">
                {mode === "update" && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    İptal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending
                    ? "Kaydediliyor..."
                    : mode === "create"
                      ? "Paket Oluştur"
                      : "Paketi Güncelle"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section aria-labelledby="packages-grid-heading">
        <h2
          id="packages-grid-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Paketler (Kart Görünümü)
        </h2>
        {packages.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground dark:bg-card">
            Henüz paket bulunmamaktadır.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="relative">
                <PackageCard pkg={pkg} />
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(pkg)}
                    className="rounded-md border border-border bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm hover:bg-muted"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pkg.id)}
                    className="rounded-md border border-red-500 bg-red-500/90 px-2 py-0.5 text-[10px] font-medium text-red-50 hover:bg-red-600"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="packages-list-heading">
        <h2
          id="packages-list-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Paket listesi (Durum Yönetimi)
        </h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 dark:bg-muted/30">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Ad
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Durum
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Henüz paket bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr
                      key={pkg.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 dark:hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {pkg.name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            pkg.is_active
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {pkg.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(pkg.id)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
                        >
                          {pkg.is_active ? "Pasif yap" : "Aktif yap"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

