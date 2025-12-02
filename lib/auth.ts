import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";
import { verifyPassword } from "./password";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for Vercel deployments
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            name: true,
            imageUrl: true,
          },
        });

        if (!user || !user.password) {
          // Don't reveal if user exists or not (security best practice)
          return null;
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.imageUrl,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true },
        });
        token.id = dbUser?.id || "";
        token.role = dbUser?.role || Role.MEMBER;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.role = (token.role as Role) || Role.MEMBER;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  debug: process.env.NODE_ENV === "development",
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
