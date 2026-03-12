"use client";

import { usePathname } from "next/navigation";

const PATH_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/musteriler": "Müşteriler",
  "/dashboard/customers": "Müşteriler",
  "/dashboard/vehicles": "Araçlar",
  "/dashboard/policeler": "Poliçeler",
  "/dashboard/cuzdan": "Cüzdan",
  "/dashboard/ayarlar": "Ayarlar",
  "/dashboard/admin/packages": "Paket Yönetimi",
  "/dashboard/admin/agents": "Acente Yönetimi",
  "/dashboard/admin/wallets": "Cüzdan & Bakiye",
};

type DashboardHeaderProps = {
  logoutAction: () => Promise<void>;
};

export function DashboardHeader({ logoutAction }: DashboardHeaderProps) {
  const pathname = usePathname();
  const title = PATH_TITLES[pathname ?? ""] ?? "Dashboard";

  return (
    <header className="flex min-w-0 flex-1 items-center justify-between px-4 lg:px-6">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted dark:bg-background dark:hover:bg-muted"
        >
          Çıkış Yap
        </button>
      </form>
    </header>
  );
}
