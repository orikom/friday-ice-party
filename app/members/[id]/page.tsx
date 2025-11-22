import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Instagram, Linkedin, Phone, MapPin, Briefcase } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getMember(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      role: true,
      phone: true,
      city: true,
      occupation: true,
      description: true,
      instagramUrl: true,
      linkedinUrl: true,
    },
  });
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);
  const user = await getSessionUser();
  const isAuthenticated = !!user;

  if (!member) {
    notFound();
  }

  // Basic info visible to everyone
  const showFullInfo = isAuthenticated;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4">
        <Link href="/members">
          <Button variant="ghost" size="sm">
            ← חזור לחברים
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            {member.imageUrl ? (
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={member.imageUrl}
                  alt={member.name || "Member"}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-3xl">
                  {(member.name || member.email)[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">
                {member.name || member.email.split("@")[0]}
              </CardTitle>
              {member.occupation && (
                <CardDescription className="text-lg">
                  {member.occupation}
                </CardDescription>
              )}
              {member.role && (
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {member.role === "ADMIN" ? "מנהל" : "חבר"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic info - visible to everyone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {member.city && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{member.city}</span>
              </div>
            )}
            {member.occupation && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{member.occupation}</span>
              </div>
            )}
          </div>

          {/* Full description - only for authenticated members */}
          {showFullInfo && member.description && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">אודות</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {member.description}
              </p>
            </div>
          )}

          {/* Social links - only for authenticated members */}
          {showFullInfo && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">קישורים</h3>
              <div className="flex gap-4">
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Phone className="h-5 w-5" />
                    <span>התקשר</span>
                  </a>
                )}
                {member.instagramUrl && (
                  <a
                    href={member.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Instagram className="h-5 w-5" />
                    <span>אינסטגרם</span>
                  </a>
                )}
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span>לינקדאין</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {!showFullInfo && (
            <div className="pt-4 border-t text-center">
              <p className="text-sm text-gray-500 mb-4">
                התחבר כדי לראות מידע נוסף, תיאור מלא וקישורים חברתיים
              </p>
              <Link href="/auth/signin">
                <Button>התחבר</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

