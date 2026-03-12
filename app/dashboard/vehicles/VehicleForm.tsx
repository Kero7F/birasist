"use client";

import { useFormState } from "react-dom";
import { useMemo, useState } from "react";
import { CAR_BRANDS, VEHICLE_USAGE_TYPES, YEARS } from "@/lib/data/vehicles";
import { createVehicle, type CreateVehicleState } from "./actions";

type CustomerOption = { id: string; full_name: string };

type VehicleFormProps = {
  customers: CustomerOption[];
};

const brandKeys = Object.keys(CAR_BRANDS);

export function VehicleForm({ customers }: VehicleFormProps) {
  const [state, formAction] = useFormState<CreateVehicleState, FormData>(
    createVehicle,
    {}
  );
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  const models = useMemo(() => {
    if (!selectedBrand || !CAR_BRANDS[selectedBrand]) return [] as string[];
    return CAR_BRANDS[selectedBrand];
  }, [selectedBrand]);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-500/60 bg-red-950/60 px-4 py-3 text-sm text-red-100">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-emerald-500/60 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-100">
          Araç başarıyla eklendi.
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="vehicle-customerId"
          className="block text-sm font-medium text-muted-foreground"
        >
          Müşteri
        </label>
        <select
          id="vehicle-customerId"
          name="customerId"
          required
          className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
        >
          <option value="">Müşteri seçin...</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="vehicle-plateNumber"
            className="block text-sm font-medium text-muted-foreground"
          >
            Araç Plakası
          </label>
          <input
            id="vehicle-plateNumber"
            name="plateNumber"
            type="text"
            required
            maxLength={11}
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground uppercase outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="34 ABC 123"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="vehicle-documentSerial"
            className="block text-sm font-medium text-muted-foreground"
          >
            Belge Seri Numarası <span className="text-muted-foreground/70">(İsteğe Bağlı)</span>
          </label>
          <input
            id="vehicle-documentSerial"
            name="documentSerial"
            type="text"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. AB 12345678"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="vehicle-brand"
            className="block text-sm font-medium text-muted-foreground"
          >
            Araç Markası
          </label>
          <select
            id="vehicle-brand"
            name="brand"
            required
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
            }}
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="">Marka seçin...</option>
            {brandKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="vehicle-model"
            className="block text-sm font-medium text-muted-foreground"
          >
            Araç Modeli
          </label>
          <select
            id="vehicle-model"
            name="model"
            required
            disabled={!selectedBrand}
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            <option value="">Önce marka seçin...</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="vehicle-year"
            className="block text-sm font-medium text-muted-foreground"
          >
            Model Yılı
          </label>
          <select
            id="vehicle-year"
            name="year"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="">Yıl seçin...</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="vehicle-usageType"
            className="block text-sm font-medium text-muted-foreground"
          >
            Araç Kullanım Türü
          </label>
          <select
            id="vehicle-usageType"
            name="usageType"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="">Kullanım türü seçin...</option>
            {VEHICLE_USAGE_TYPES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg border border-border bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus:ring-2 focus:ring-ring"
      >
        Araç Ekle
      </button>
    </form>
  );
}
