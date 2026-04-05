import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "E-posta",
          type: "email"
        },
        password: {
          label: "Şifre",
          type: "password"
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.is_active) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          bayiKodu: user.bayiKodu ?? null,
          sirketAdi: user.sirketAdi ?? null,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.is_active = user.is_active;
        token.bayiKodu = user.bayiKodu ?? null;
        token.sirketAdi = user.sirketAdi ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "AGENT";
        session.user.is_active = token.is_active ?? true;
        session.user.bayiKodu =
          typeof token.bayiKodu === "string" ? token.bayiKodu : null;
        session.user.sirketAdi =
          typeof token.sirketAdi === "string" ? token.sirketAdi : null;
      }
      return session;
    }
  }
});

