import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth v5 beta returns { handlers, auth }
const { handlers } = NextAuth(authOptions);

export const GET = handlers.GET;
export const POST = handlers.POST;
