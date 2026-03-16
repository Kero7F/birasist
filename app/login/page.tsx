"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        alert("Giriş bilgileri hatalı!");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Left brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-10 py-10 text-slate-50 md:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-900/60 px-3 py-1 text-xs text-slate-300 ring-1 ring-emerald-500/40">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span>B2B Asistanlık & Tali Acente Yönetim Sistemi</span>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              BİR ASİST
            </h1>
            <p className="mt-3 max-w-md text-sm text-slate-300 md:text-base">
              Geleceği Güvence Altına Alın. Acente operasyonlarınızı tek bir
              güçlü panel üzerinden yönetin.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Bir Asist. Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen flex-1 items-center justify-center px-4 py-10 md:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-400 to-sky-500 text-slate-950 shadow-lg shadow-emerald-500/30">
              <span className="text-sm font-extrabold tracking-tight">
                BA
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Bir Asist
              </p>
              <p className="text-sm font-semibold text-foreground">
                Acente Yönetim Paneli
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur md:p-8">
            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Hesabınıza Giriş Yapın
              </h2>
              <p className="text-sm text-muted-foreground">
                E-posta ve şifrenizi girerek panelinize erişin.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-posta Adresi</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@acente.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="mt-2 w-full bg-green-600 text-white hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
