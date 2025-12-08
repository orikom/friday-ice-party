"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

interface Member {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  occupation: string | null;
  city: string | null;
}

export function MemberSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searched && formRef.current) {
      const updatePosition = () => {
        if (formRef.current) {
          const rect = formRef.current.getBoundingClientRect();
          setDropdownStyle({
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [searched]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setMembers([]);
      setSearched(false);
      setDropdownStyle(null);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      params.set("query", query);
      const response = await fetch(`/api/members?${params.toString()}`);
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Failed to search members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If input is empty, clear results immediately
    if (!searchQuery.trim()) {
      setMembers([]);
      setSearched(false);
      setDropdownStyle(null);
      return;
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    await performSearch(searchQuery);
    setSearchQuery("");
  };

  const DropdownContent = () => {
    if (!searched || !dropdownStyle) return null;

    return (
      <div
        className="fixed z-[100] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        style={{
          top: `${dropdownStyle.top}px`,
          left: `${dropdownStyle.left}px`,
          width: `${dropdownStyle.width}px`,
          maxHeight: "calc(100vh - " + (dropdownStyle.top + 20) + "px)",
        }}
      >
        {loading ? (
          <div className="p-4">
            <p className="text-sm text-gray-500 text-center">מחפש...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-4">
            <p className="text-sm text-gray-500 text-center">לא נמצאו תוצאות</p>
          </div>
        ) : (
          <div className="overflow-y-auto" style={{ maxHeight: "240px" }}>
            <div className="p-1.5 space-y-1">
              {members.slice(0, 4).map((member) => (
                <Link key={member.id} href={`/members/${member.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2.5">
                        {member.imageUrl ? (
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                              src={member.imageUrl}
                              alt={member.name || "Member"}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {(member.name || member.email)[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-sm">
                            {member.name || member.email.split("@")[0]}
                          </div>
                          {member.occupation && (
                            <div className="text-xs text-gray-600 truncate">
                              {member.occupation}
                            </div>
                          )}
                          {member.city && (
                            <div className="text-xs text-gray-500">
                              📍 {member.city}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {members.length > 4 && (
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <Link href="/members">
                  <Button variant="outline" className="w-full text-sm py-1.5">
                    צפה בכל התוצאות ({members.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSearch}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="חפש לפי שם או מקצוע..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setMembers([]);
                  setSearched(false);
                  setDropdownStyle(null);
                }
              }}
              className="pr-10"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "מחפש..." : "חפש"}
          </Button>
        </div>
      </form>

      {typeof window !== "undefined" &&
        createPortal(<DropdownContent />, document.body)}
    </>
  );
}
