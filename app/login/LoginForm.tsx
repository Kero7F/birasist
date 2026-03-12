 "use client";

import { useFormState } from "react-dom";
import { login } from "./actions";

const initialState = {
  error: undefined as string | undefined
};

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <form className="space-y-4" action={formAction}>
      {state.error && (
        <div className="rounded-md border border-red-500/60 bg-red-950/60 px-3 py-2 text-xs text-red-100">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-medium tracking-wide text-slate-200"
        >
          E-posta adresi
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="ornek@acente.com"
          autoComplete="email"
          className="block w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 shadow-inner outline-none ring-0 transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/60 placeholder:text-slate-500"
          required
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs font-medium tracking-wide text-slate-200"
          >
            Şifre
          </label>
          <button
            type="button"
            className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 focus-visible:outline-none focus-visible:underline"
          >
            Şifremi unuttum
          </button>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="block w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 shadow-inner outline-none ring-0 transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/60 placeholder:text-slate-500"
          required
        />
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px]">
        <label className="inline-flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            name="remember"
            className="h-3.5 w-3.5 rounded border border-slate-700 bg-slate-950 text-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/70"
          />
          <span>Beni hatırla</span>
        </label>
        <span className="text-slate-500">
          Ortak cihazlarda çıkış yapmayı unutmayın.
        </span>
      </div>

      <button
        type="submit"
        className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold tracking-wide text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Panele Giriş Yap
      </button>
    </form>
  );
}

