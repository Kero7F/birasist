"use client";

import { useFormState } from "react-dom";
import { createAgent, type CreateAgentState } from "./actions";

export function CreateAgentForm() {
  const [state, formAction] = useFormState<CreateAgentState, FormData>(
    createAgent,
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
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="Örn. Yılmaz"
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
