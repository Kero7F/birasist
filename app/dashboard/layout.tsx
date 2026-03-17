import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logout } from "./actions";
import { DashboardHeader } from "./DashboardHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Activity,
  Car,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Package,
  Settings,
  User,
  Users,
  Wallet,
} from "lucide-react";

const AGENT_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/sales/new", label: "Yeni Satış", icon: Activity },
  { href: "/dashboard/customers", label: "Müşteriler", icon: Users },
  { href: "/dashboard/vehicles", label: "Araçlar", icon: Car },
  { href: "/dashboard/policeler", label: "Poliçelerim", icon: FileText },
  { href: "/dashboard/packages", label: "Paket Vitrini", icon: Package },
  { href: "/dashboard/wallet", label: "Cüzdanım", icon: Wallet },
  { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
] as const;

const ADMIN_NAV_ITEMS = [
  { href: "/dashboard", label: "Genel Özet", icon: Home },
  { href: "/dashboard/policeler", label: "Tüm Poliçeler", icon: Activity },
  { href: "/dashboard/admin/agents", label: "Bayiler", icon: Users },
  { href: "/dashboard/admin/wallets", label: "Bakiye Yönetimi", icon: CreditCard },
  { href: "/dashboard/admin/packages", label: "Paket Yönetimi", icon: Package },
  { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
] as const;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user?.role === "ADMIN";
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : AGENT_NAV_ITEMS;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <input
        type="checkbox"
        id="sidebar-toggle"
        aria-hidden="true"
        className="peer sr-only"
      />
      <aside
        className="w-64 flex-none border-r border-border bg-background flex flex-col h-full"
        aria-label="Ana menü"
      >
        <div className="flex flex-1 flex-col">
          <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-4">
            <span className="font-semibold text-foreground">
              {isAdmin ? "Admin Panel" : "Acente Panel"}
            </span>
            <label
              htmlFor="sidebar-toggle"
              className="cursor-pointer rounded p-2 hover:bg-muted lg:hidden"
              aria-label="Menüyü kapat"
            >
              <span className="sr-only">Menüyü kapat</span>
              <svg
                className="h-5 w-5 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </label>
          </div>
          <nav className="flex-1 overflow-y-auto p-2" aria-label="Sayfa navigasyonu">
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted dark:hover:bg-muted"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex flex-col gap-3 border-t border-border px-4 py-3 dark:border-slate-800">
            {/* Row 1: User info */}
            <div className="flex w-full items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {session.user?.name ?? "Kullanıcı"}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-slate-400">
                  {session.user?.email ?? "-"}
                </p>
              </div>
            </div>

            {/* Row 2: Role badge + actions */}
            <div className="flex w-full items-center justify-between">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isAdmin
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-slate-800/80 dark:text-blue-300 dark:ring-slate-700"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-800"
                }`}
              >
                {isAdmin ? "Admin" : "Acente"}
              </span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <form action={logout}>
                  <button
                    type="submit"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-xs text-muted-foreground hover:bg-muted dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    title="Çıkış Yap"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background lg:gap-4">
          <label
            htmlFor="sidebar-toggle"
            className="cursor-pointer rounded p-2 hover:bg-muted lg:hidden"
            aria-label="Menüyü aç"
          >
            <span className="sr-only">Menüyü aç</span>
            <svg
              className="h-5 w-5 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <DashboardHeader logoutAction={logout} />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
      <label
        htmlFor="sidebar-toggle"
        className="fixed inset-0 z-30 hidden bg-black/50 peer-checked:block lg:hidden"
        aria-hidden
      >
        <span className="sr-only">Menüyü kapat (arka plan)</span>
      </label>
    </div>
  );
}
