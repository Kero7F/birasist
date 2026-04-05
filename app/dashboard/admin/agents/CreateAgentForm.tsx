"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { createAgent, type CreateAgentState } from "./actions";

export function CreateAgentForm() {
  const [state, formAction] = useFormState<CreateAgentState, FormData>(
    createAgent,
    {}
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sirketAdi, setSirketAdi] = useState("");
  const [bayiKodu, setBayiKodu] = useState("");

  useEffect(() => {
    if (state?.success) {
      setFirstName("");
      setLastName("");
      setSirketAdi("");
      setBayiKodu("");
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md border border-red-500/60 bg-red-950/60 px-3 py-2 text-sm text-red-100">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md border border-emerald-500/60 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-100">
          Acente başarıyla oluşturuldu.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label
            htmlFor="agent-firstName"
            className="block text-sm font-medium text-muted-foreground"
          >
            Ad
          </label>
          <input
            id="agent-firstName"
            name="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) =>
              setFirstName(e.target.value.replace(/[0-9]/g, ""))
            }
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. Ahmet"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="agent-lastName"
            className="block text-sm font-medium text-muted-foreground"
          >
            Soyad
          </label>
          <input
            id="agent-lastName"
            name="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) =>
              setLastName(e.target.value.replace(/[0-9]/g, ""))
            }
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. Yılmaz"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor="agent-sirketAdi"
            className="block text-sm font-medium text-muted-foreground"
          >
            Şirket adı
          </label>
          <input
            id="agent-sirketAdi"
            name="sirketAdi"
            type="text"
            value={sirketAdi}
            onChange={(e) => setSirketAdi(e.target.value)}
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. ABC Sigorta"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="agent-email"
            className="block text-sm font-medium text-muted-foreground"
          >
            E-posta
          </label>
          <input
            id="agent-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="acente@ornek.com"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="agent-password"
            className="block text-sm font-medium text-muted-foreground"
          >
            Şifre
          </label>
          <input
            id="agent-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="En az 6 karakter"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <label
            htmlFor="agent-bayiKodu"
            className="block text-sm font-medium text-muted-foreground"
          >
            Bayi kodu (isteğe bağlı, 4 rakam)
          </label>
          <input
            id="agent-bayiKodu"
            name="bayiKodu"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            pattern="\d{4}"
            value={bayiKodu}
            onChange={(e) =>
              setBayiKodu(
                e.target.value.replace(/[^0-9]/g, "").slice(0, 4)
              )
            }
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Boş bırakılırsa otomatik atanır"
          />
        </div>
      </div>
      <button
        type="submit"
        className="rounded-lg border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus:ring-2 focus:ring-ring"
      >
        Acente Oluştur
      </button>
    </form>
  );
}
