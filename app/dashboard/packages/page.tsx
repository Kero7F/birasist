import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PackageCard } from "@/components/ui/PackageCard";

export default async function PackagesShowcasePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const packages = await prisma.package.findMany({
    orderBy: { created_at: "desc" }
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">Paket Vitrini</h1>
        <p className="text-sm text-muted-foreground">
          Mevcut tüm poliçe paketlerimizi ve limitlerini buradan
          inceleyebilirsiniz.
        </p>
      </header>

      {packages.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground dark:bg-card">
          Henüz tanımlı paket bulunmamaktadır.
        </div>
      ) : (
        <section aria-label="Paket listesi">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

