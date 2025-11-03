import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/SignOutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friday Pool Party",
  description: "Community events and member directory",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <nav className="border-b bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Friday Pool Party
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/members" className="text-sm hover:text-blue-600">
                  Members
                </Link>
                {user ? (
                  <>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="text-sm hover:text-blue-600"
                      >
                        Admin
                      </Link>
                    )}
                    <span className="text-sm text-gray-600">
                      {user.name || user.email}
                    </span>
                    <SignOutButton />
                  </>
                ) : (
                  <Link href="/auth/signin">
                    <Button variant="default" size="sm">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </nav>
          <main className="min-h-screen bg-gray-50">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
