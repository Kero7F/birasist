import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/80 shadow-[0_18px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
          </div>

          <div className="relative px-8 pt-8 pb-4">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/40">
                <span className="text-lg font-extrabold tracking-tight">AC</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-50">
                  Acente Yönetim Paneli
                </h1>
                <p className="text-xs text-slate-400">
                  Portföy, poliçe ve üretimlerinizi tek ekrandan yönetin.
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
              <p className="font-medium text-slate-100 mb-1">
                Giriş yaparak devam edin
              </p>
              <p className="text-slate-400">
                Kurumsal acente hesabınız ile panele erişebilir, müşterilerinizi ve poliçelerinizi gerçek zamanlı takip edebilirsiniz.
              </p>
            </div>

            <LoginForm />
          </div>

          <div className="relative border-t border-slate-800/80 bg-slate-950/80 px-8 py-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>© {year} Acente Yönetim Paneli</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              <span>Sistem durumu: Çevrimiçi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
