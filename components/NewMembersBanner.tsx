import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NewMember {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  occupation: string | null;
  description: string | null;
}

interface NewMembersBannerProps {
  members: NewMember[];
}

export function NewMembersBanner({ members }: NewMembersBannerProps) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">חברי קהילה חדשים</h2>
          <p className="text-gray-600">
            הכר את החברים החדשים שהצטרפו לקהילה
          </p>
        </div>
        <Link href="/auth/signin" className="mt-4 md:mt-0">
          <Button className="w-full md:w-auto">
            הצטרף לקהילה
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {members.map((member) => (
          <Link key={member.id} href={`/members/${member.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  {member.imageUrl ? (
                    <div className="relative w-16 h-16 mb-3">
                      <Image
                        src={member.imageUrl}
                        alt={member.name || "Member"}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                      <span className="text-gray-500 text-xl font-semibold">
                        {(member.name || member.email)[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="font-semibold text-lg mb-1">
                    {member.name || member.email.split("@")[0]}
                  </div>
                  {member.occupation && (
                    <div className="text-sm text-gray-600 mb-2">
                      {member.occupation}
                    </div>
                  )}
                  {member.description && (
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {member.description}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

