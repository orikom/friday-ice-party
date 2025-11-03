import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Type definition for Role to avoid Prisma Client dependency during build
type Role = "ADMIN" | "MEMBER";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = await getToken({
    req: {
      headers: {
        cookie: cookieStore.toString(),
      },
    } as Parameters<typeof getToken>[0]["req"],
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return null;
  }

  return {
    id: token.id as string,
    email: token.email as string,
    name: token.name as string | null,
    image: token.picture as string | null,
    role: (token.role as Role) || ("MEMBER" as Role),
  };
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/signin");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}
