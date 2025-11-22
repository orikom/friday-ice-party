import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatDateRange } from "@/lib/time";
import { getSessionUser } from "@/lib/auth-helpers";
import Link from "next/link";
import { JoinEventButton } from "@/components/JoinEventButton";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

async function getEvent(shortCode: string) {
  const event = await prisma.event.findUnique({
    where: { shortCode },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
      joins: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
      targets: {
        include: {
          group: true,
        },
      },
    },
  });

  if (!event) {
    return null;
  }

  return {
    ...event,
    attendeeCount: event.joins.length,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}): Promise<Metadata> {
  const { shortCode } = await params;
  const event = await getEvent(shortCode);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const eventUrl = `${siteUrl}/events/${shortCode}`;
  const imageUrl = event.imageUrl
    ? event.imageUrl.startsWith("http")
      ? event.imageUrl
      : `${siteUrl}${event.imageUrl}`
    : undefined;

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      type: "website",
      url: eventUrl,
      siteName: "Friday Pool Party",
      locale: "en_US",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: event.title,
              type: "image/jpeg",
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description,
      images: imageUrl ? [imageUrl] : [],
    },
    // Additional metadata for better WhatsApp compatibility
    alternates: {
      canonical: eventUrl,
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;
  const event = await getEvent(shortCode);
  const user = await getSessionUser();

  if (!event) {
    notFound();
  }

  const userJoin = user
    ? event.joins.find((join) => join.user.id === user.id)
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="text-blue-600 hover:underline inline-block">
          ← Back to events
        </Link>
        {user?.role === "ADMIN" && (
          <Link href={`/admin/events/${shortCode}/edit`}>
            <Button variant="outline">Edit Event</Button>
          </Link>
        )}
      </div>

      <Card>
        {event.imageUrl && (
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
              <CardDescription className="text-lg">
                {formatDateRange(event.startsAt, event.endsAt)}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {event.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {event.location && (
            <div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-gray-700">📍 {event.location}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Organized by</h3>
            <div className="flex items-center gap-2">
              {event.createdBy.imageUrl ? (
                <Image
                  src={event.createdBy.imageUrl}
                  alt={event.createdBy.name || "Organizer"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">
                    {(event.createdBy.name || "O")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span>{event.createdBy.name || "Organizer"}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Attendees ({event.attendeeCount})
            </h3>
            {event.attendeeCount === 0 ? (
              <p className="text-gray-500 text-sm">No attendees yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {event.joins.slice(0, 10).map((join) => (
                  <div key={join.id} className="flex items-center gap-2">
                    {join.user.imageUrl ? (
                      <Image
                        src={join.user.imageUrl}
                        alt={join.user.name || "Attendee"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">
                          {(join.user.name || "A")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm">
                      {join.user.name || "Attendee"}
                    </span>
                  </div>
                ))}
                {event.attendeeCount > 10 && (
                  <span className="text-sm text-gray-500">
                    +{event.attendeeCount - 10} more
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className={userJoin ? "w-full" : "flex-1"}>
              <JoinEventButton
                eventId={event.id}
                shortCode={event.shortCode}
                userJoin={userJoin}
              />
            </div>
            <div className={userJoin ? "w-full sm:w-auto" : "flex-1"}>
              <WhatsAppShareButton
                title={event.title}
                description={event.description}
                shortCode={event.shortCode}
                category={event.category}
                imageUrl={event.imageUrl}
                location={event.location}
                startsAt={event.startsAt}
                endsAt={event.endsAt}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
