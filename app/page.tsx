import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { formatDateRange } from "@/lib/time";
import { requireAuth } from "@/lib/auth-helpers";

async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        joins: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return events.map((event) => ({
      ...event,
      attendeeCount: event.joins.length,
    }));
  } catch (error) {
    console.error("Failed to fetch events:", error);
    // Return empty array if database is not available
    return [];
  }
}

export default async function HomePage() {
  await requireAuth(); // Require authentication
  const events = await getEvents();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ברוכים הבאים לקהילת הקרח</h1>
        <p className="text-gray-600">גלה אירועים והתחבר לקהילה</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">אין אירועים עדיין. נסה שוב בקרוב!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {event.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge variant="secondary">{event.category}</Badge>
                </div>
                <CardDescription>
                  {formatDateRange(event.startsAt, event.endsAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {event.description}
                </p>
                {event.location && (
                  <p className="text-xs text-gray-500 mt-2">
                    📍 {event.location}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  👥 {event.attendeeCount}{" "}
                  {event.attendeeCount === 1 ? "משתתף" : "משתתפים"}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/events/${event.shortCode}`} className="w-full">
                  <Button className="w-full">צפה באירוע</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
