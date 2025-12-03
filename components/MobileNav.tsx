"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  } | null;
  userImageUrl: string | null;
}

export function MobileNav({ user, userImageUrl }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors shrink-0"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel - slides from right (RTL) */}
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-xl overflow-y-auto">
            {/* Header with logo and close button */}
            <div className="h-16 border-b flex items-center justify-between px-4 bg-white sticky top-0 z-10">
              <Link
                href="/"
                className="text-xl font-bold text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                Friday Ice Party
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-1">
              {/* User Info */}
              {user && (
                <div className="pb-4 mb-4 border-b">
                  <div className="flex items-center gap-3">
                    {userImageUrl ? (
                      <div className="relative w-12 h-12 shrink-0">
                        <Image
                          src={userImageUrl}
                          alt={user.name || user.email}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <span className="text-gray-600 font-medium">
                          {(user.name || user.email)[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-1">
                <Link
                  href="/members"
                  className="block px-4 py-3 rounded-md hover:bg-gray-100 transition-colors text-right"
                  onClick={() => setIsOpen(false)}
                >
                  חברים
                </Link>
                <Link
                  href="/business"
                  className="block px-4 py-3 rounded-md hover:bg-gray-100 transition-colors text-right"
                  onClick={() => setIsOpen(false)}
                >
                  עסקים
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/gallery"
                      className="block px-4 py-3 rounded-md hover:bg-gray-100 transition-colors text-right"
                      onClick={() => setIsOpen(false)}
                    >
                      גלריה
                    </Link>
                    <Link
                      href="/referrals/new"
                      className="block px-4 py-3 rounded-md hover:bg-gray-100 transition-colors text-right"
                      onClick={() => setIsOpen(false)}
                    >
                      הפנה מישהו
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 rounded-md hover:bg-gray-100 transition-colors text-right font-medium text-blue-600"
                        onClick={() => setIsOpen(false)}
                      >
                        ניהול
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="block px-4 py-3 rounded-md hover:bg-gray-100 transition-colors text-right"
                      onClick={() => setIsOpen(false)}
                    >
                      פרופיל
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-right px-4 py-3 rounded-md hover:bg-gray-100 transition-colors text-red-600"
                    >
                      התנתק
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="block"
                    onClick={() => setIsOpen(false)}
                  >
                    <Button className="w-full" size="lg">
                      התחבר
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
