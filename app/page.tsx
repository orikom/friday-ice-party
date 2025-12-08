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
import { getSessionUser } from "@/lib/auth-helpers";
import { MemberSearch } from "@/components/MemberSearch";

async function getEvents(isAuthenticated: boolean) {
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
      // Hide full description for non-authenticated users
      description: isAuthenticated
        ? event.description
        : event.description?.substring(0, 100) + "...",
      // Hide exact location for non-authenticated users
      location: isAuthenticated
        ? event.location
        : event.location
        ? "מיקום כללי"
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch events:", error);
    // Return empty array if database is not available
    return [];
  }
}
// some comment to remove later
export default async function HomePage() {
  const user = await getSessionUser(); // Optional authentication
  const isAuthenticated = !!user;
  const events = await getEvents(isAuthenticated);

  return (
    <div>
      {/* Hero Section with Image Background */}
      <div className="relative w-full h-[66vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Party fans raising hands - person performing heart hand gesture"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Title and Subtitle */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                הבית של קהילת הקרח
              </h1>
              <h2 className="text-xl md:text-2xl text-white/90 drop-shadow-md">
                קהילה ללא מטרות רווח המייצרת חיבורים אמיתיים בין אנשים
              </h2>
            </div>

            {/* Search Component inside Hero */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 md:p-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">חיפוש חברים</h2>
                <p className="text-gray-600">
                  חפש חברים בקהילה לפי שם או מקצוע
                </p>
              </div>
              <MemberSearch />
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the content */}
      <div className="container mx-auto px-4 py-8">
        {/* Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">אירועים קרובים</h2>
            {isAuthenticated && (
              <Link href="/events/new">
                <Button>צור אירוע חדש</Button>
              </Link>
            )}
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
                    {isAuthenticated && (
                      <p className="text-xs text-gray-500 mt-2">
                        👥 {event.attendeeCount}{" "}
                        {event.attendeeCount === 1 ? "משתתף" : "משתתפים"}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/events/${event.shortCode}`}
                      className="w-full"
                    >
                      <Button className="w-full">
                        {isAuthenticated ? "צפה באירוע" : "פרטים נוספים"}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
