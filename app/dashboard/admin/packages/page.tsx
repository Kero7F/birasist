import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminPackagesClient } from "./AdminPackagesClient";

export default async function AdminPackagesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const packages = await prisma.package.findMany({
    orderBy: { created_at: "desc" },
  });

  return <AdminPackagesClient packages={packages} />;
}
