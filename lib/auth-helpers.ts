import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Type definition for Role to avoid Prisma Client dependency during build
type Role = "ADMIN" | "MEMBER";

export async function getSessionUser() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name as string | null,
    image: session.user.image as string | null,
    role: (session.user.role as Role) || ("MEMBER" as Role),
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
