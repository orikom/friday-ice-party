import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

// For development: Use console transport if no EMAIL_SERVER is configured
const getEmailServer = () => {
  if (process.env.EMAIL_SERVER) {
    return process.env.EMAIL_SERVER;
  }

  // Development mode: Use a mock server that logs to console
  // NextAuth v5 beta requires a server config, so we use nodemailer's console transport
  return {
    host: "localhost",
    port: 587,
    secure: false,
    auth: {
      user: "dev",
      pass: "dev",
    },
    // In development, we'll override sendVerificationRequest to log to console
  };
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: getEmailServer(),
      from: process.env.EMAIL_FROM || "noreply@fridaypoolparty.com",
      async sendVerificationRequest({ identifier, url, provider }) {
        // In development, log the magic link to console
        if (
          process.env.NODE_ENV === "development" &&
          !process.env.EMAIL_SERVER
        ) {
          console.log("\n🔐 Magic Link for", identifier);
          console.log("👉 Click this link to sign in:");
          console.log(url);
          console.log("\n");
          return;
        }

        // In production or when EMAIL_SERVER is set, use default email sending
        const { host } = new URL(url);
        const transport = await import("nodemailer").then((mod) =>
          mod.default.createTransport(provider.server)
        );
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n${url}\n\n`,
          html: `<p>Sign in to <strong>${host}</strong></p><p><a href="${url}">Sign in</a></p>`,
        });
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    async jwt({ token, user }) {
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
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.role = (token.role as Role) || Role.MEMBER;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
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
