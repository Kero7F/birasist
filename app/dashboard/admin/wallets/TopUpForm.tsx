"use client";

import { useFormState } from "react-dom";
import { topUpWallet, type TopUpState } from "./actions";

type AgentOption = {
  id: string;
  firstName: string;
  lastName: string;
  balance: number;
};

type TopUpFormProps = {
  agents: AgentOption[];
};

function formatBalance(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

export function TopUpForm({ agents }: TopUpFormProps) {
  const [state, formAction] = useFormState<TopUpState, FormData>(
    topUpWallet,
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
          Bakiye başarıyla yüklendi.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <label
            htmlFor="topup-agent"
            className="block text-sm font-medium text-muted-foreground"
          >
            Acente
          </label>
          <select
            id="topup-agent"
            name="agentId"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          >
            <option value="">Seçiniz...</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.firstName} {agent.lastName} — {formatBalance(agent.balance)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="topup-amount"
            className="block text-sm font-medium text-muted-foreground"
          >
            Tutar (₺)
          </label>
          <input
            id="topup-amount"
            name="amount"
            type="number"
            step="0.01"
            min="1"
            required
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            placeholder="0,00"
          />
        </div>
      </div>
      <button
        type="submit"
        className="rounded-lg border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus:ring-2 focus:ring-ring"
      >
        Bakiye Yükle
      </button>
    </form>
  );
}
