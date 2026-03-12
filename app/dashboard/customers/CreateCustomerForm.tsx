"use client";

import { useFormState } from "react-dom";
import { NameInput, TcInput, PhoneInput } from "@/components/ui/SmartInputs";
import { createCustomer, type CreateCustomerState } from "./actions";

export function CreateCustomerForm() {
  const [state, formAction] = useFormState<CreateCustomerState, FormData>(
    createCustomer,
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
          Müşteri başarıyla eklendi.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <label
            htmlFor="customer-fullName"
            className="block text-sm font-medium text-muted-foreground"
          >
            Ad Soyad
          </label>
          <NameInput
            id="customer-fullName"
            name="fullName"
            required
            placeholder="Örn. AHMET YILMAZ"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="customer-tcNo"
            className="block text-sm font-medium text-muted-foreground"
          >
            TC Kimlik No (11 rakam)
          </label>
          <TcInput
            id="customer-tcNo"
            name="tcNo"
            required
            placeholder="12345678901"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="customer-phone"
            className="block text-sm font-medium text-muted-foreground"
          >
            Telefon
          </label>
          <PhoneInput
            id="customer-phone"
            name="phone"
            required
            placeholder="+90 (5XX) XXX XX XX"
          />
        </div>
      </div>
      <button
        type="submit"
        className="rounded-lg border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus:ring-2 focus:ring-ring"
      >
        Müşteri Ekle
      </button>
    </form>
  );
}
