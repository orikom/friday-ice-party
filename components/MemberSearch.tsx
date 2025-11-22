"use client";

import { useState } from "react";
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setMembers([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      params.set("query", searchQuery);
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

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4">
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

      {searched && (
        <div>
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">מחפש...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              לא נמצאו תוצאות
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {members.slice(0, 6).map((member) => (
                <Link key={member.id} href={`/members/${member.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {member.imageUrl ? (
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={member.imageUrl}
                              alt={member.name || "Member"}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg">
                              {(member.name || member.email)[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">
                            {member.name || member.email.split("@")[0]}
                          </div>
                          {member.occupation && (
                            <div className="text-sm text-gray-600 truncate">
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
          )}
          {members.length > 6 && (
            <div className="text-center mt-4">
              <Link href="/members">
                <Button variant="outline">
                  צפה בכל התוצאות ({members.length})
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

