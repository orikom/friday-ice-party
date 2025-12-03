import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/signin",
    "/auth/verify",
    "/api/auth",
    "/",
    "/members",
    "/events",
    "/business",
    "/gallery",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Allow public routes and API routes (API routes handle their own auth)
  if (isPublicRoute || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  // Try auto-detect first (NextAuth v5 should handle this)
  let token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token found, try explicit cookie names
  // NextAuth v5 beta might use different cookie names
  if (!token) {
    const isHttps = req.url.startsWith("https://");
    const possibleCookieNames = isHttps
      ? [
          "__Secure-next-auth.session-token",
          "next-auth.session-token",
          "__Secure-authjs.session-token",
          "authjs.session-token",
        ]
      : ["next-auth.session-token", "authjs.session-token"];

    for (const cookieName of possibleCookieNames) {
      token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName,
      });
      if (token) break;
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/profile", "/referrals", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    // Redirect to sign in with callback URL
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin routes require ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
