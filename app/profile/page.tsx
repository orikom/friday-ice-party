import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Instagram, Linkedin, Phone } from "lucide-react";

async function getProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      imageUrl: true,
      phone: true,
      city: true,
      occupation: true,
      description: true,
      instagramUrl: true,
      linkedinUrl: true,
      createdAt: true,
    },
  });
}

export default async function ProfilePage() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>פרופיל לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">הפרופיל שלי</h1>
        <p className="text-gray-600">נהל את פרטי הפרופיל שלך</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Preview Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              {profile.imageUrl ? (
                <div className="relative w-24 h-24 mb-4">
                  <Image
                    src={profile.imageUrl}
                    alt={profile.name || "Profile"}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <span className="text-gray-500 text-4xl">
                    {(profile.name || profile.email)[0].toUpperCase()}
                  </span>
                </div>
              )}
              <CardTitle className="text-xl">
                {profile.name || profile.email.split("@")[0]}
              </CardTitle>
              {profile.occupation && (
                <CardDescription className="mt-1">
                  {profile.occupation}
                </CardDescription>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="font-semibold mb-1">אימייל</div>
              <div className="text-gray-600">{profile.email}</div>
            </div>
            {profile.city && (
              <div className="text-sm">
                <div className="font-semibold mb-1">📍 מיקום</div>
                <div className="text-gray-600">{profile.city}</div>
              </div>
            )}
            {profile.phone && (
              <div className="text-sm">
                <div className="font-semibold mb-1">📞 טלפון</div>
                <div className="text-gray-600">{profile.phone}</div>
              </div>
            )}
            {profile.description && (
              <div className="text-sm">
                <div className="font-semibold mb-1">אודות</div>
                <div className="text-gray-600">{profile.description}</div>
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t">
              {profile.instagramUrl && (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Instagram className="h-4 w-4" />
                  אינסטגרם
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Linkedin className="h-4 w-4" />
                  לינקדאין
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ערוך פרופיל</CardTitle>
            <CardDescription>עדכן את פרטי הפרופיל שלך</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
