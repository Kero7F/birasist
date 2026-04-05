import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role?: UserRole;
    is_active?: boolean;
    bayiKodu?: string | null;
    sirketAdi?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      is_active: boolean;
      bayiKodu: string | null;
      sirketAdi: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    is_active?: boolean;
    bayiKodu?: string | null;
    sirketAdi?: string | null;
  }
}
