import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role?: UserRole;
    is_active?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      is_active: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    is_active?: boolean;
  }
}
