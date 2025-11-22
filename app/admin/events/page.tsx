import { requireAdmin } from "@/lib/auth-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatDateRange } from "@/lib/time";
import { EventsList } from "@/components/EventsList";

async function getEvents() {
  return await prisma.event.findMany({
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
  });
}

export default async function AdminEventsPage() {
  await requireAdmin();
  const events = await getEvents();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">נהל אירועים</h1>
            <p className="text-gray-600">
              צפה וערוך את כל האירועים במערכת
            </p>
          </div>
          <Link href="/admin/events/new">
            <Button>צור אירוע חדש</Button>
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">אין אירועים עדיין</p>
            <Link href="/admin/events/new">
              <Button>צור את האירוע הראשון שלך</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <EventsList events={events} />
      )}
    </div>
  );
}
