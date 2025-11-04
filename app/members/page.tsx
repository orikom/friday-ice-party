"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Instagram, Linkedin, Phone, MoreVertical, Edit } from "lucide-react";

interface Member {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  city: string | null;
  occupation: string | null;
  description: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  phone: string | null;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async (query: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) {
        params.set("query", query);
      }
      const response = await fetch(`/api/members?${params.toString()}`);
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers(searchQuery);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Member Directory</h1>
        <p className="text-gray-600">
          Search and connect with community members
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search by name, city, or occupation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit">Search</Button>
          {searchQuery && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                fetchMembers("");
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading members...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card key={member.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
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
                    <div>
                      <CardTitle className="text-lg">
                        {member.name || member.email.split("@")[0]}
                      </CardTitle>
                      {member.occupation && (
                        <CardDescription>{member.occupation}</CardDescription>
                      )}
                    </div>
                  </div>
                  <MemberDropdown member={member} />
                </div>
              </CardHeader>
              <CardContent>
                {member.city && (
                  <p className="text-sm text-gray-600 mb-2">📍 {member.city}</p>
                )}
                {member.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {member.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MemberDropdown({ member }: { member: Member }) {
  const { data: session } = useSession();
  const router = useRouter();
  const isOwnProfile = session?.user?.id === member.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3 space-y-2">
          <div className="font-semibold">
            {member.name || member.email.split("@")[0]}
          </div>
          {member.city && (
            <div className="text-sm text-gray-600">📍 {member.city}</div>
          )}
          {member.occupation && (
            <div className="text-sm text-gray-600">💼 {member.occupation}</div>
          )}
          {member.description && (
            <div className="text-sm text-gray-600 mt-2">
              {member.description}
            </div>
          )}
          {isOwnProfile && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <div className="flex gap-2 pt-2 border-t">
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            )}
            {member.instagramUrl && (
              <a
                href={member.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            )}
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
