"use client";

import { useState, FormEvent } from "react";
import { PlusCircle, Send, X } from "lucide-react";

export function RequestBalanceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    alert("Talebiniz alınmıştır");
    setIsOpen(false);
    setBank("");
    setAmount("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:ring-offset-slate-900"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Bakiye Talep Et
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-md font-semibold text-foreground">
                  Bakiye Talep Formu
                </h2>
              </div>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Hesabınıza yüklenmesini istediğiniz tutarı giriniz. İşleminizin
              onaylanması için tutarın banka hesaplarımıza ulaşmış olması
              gerekmektedir.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Ödeme Yapılan Banka
                </label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900"
                  required
                >
                  <option value="">Banka seçiniz</option>
                  <option value="ziraat">Ziraat Bankası</option>
                  <option value="garanti">Garanti BBVA</option>
                  <option value="isbank">İş Bankası</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Talep Tutarınız
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                    ₺
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="block w-full rounded-md border border-border bg-background py-2 pl-7 pr-3 text-sm text-foreground shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:ring-offset-slate-900"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Talep Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

