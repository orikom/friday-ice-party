"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { formatDateRange } from "@/lib/time";
import { DeleteEventDialog } from "@/components/DeleteEventDialog";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  location?: string | null;
  shortCode: string;
  createdBy: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
  joins: Array<{ id: string }>;
}

interface EventsListProps {
  events: Event[];
}

export function EventsList({ events }: EventsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {event.imageUrl && (
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDateRange(event.startsAt, event.endsAt)}
                      </p>
                    </div>
                    <Badge variant="secondary">{event.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                    {event.description}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-600 mb-3">
                      📍 {event.location}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>{event.joins.length} attendees</span>
                    <span>•</span>
                    <span>Created by {event.createdBy.name || "Unknown"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/events/${event.shortCode}`}>
                      <Button variant="outline" size="sm">
                        View Event
                      </Button>
                    </Link>
                    <Link href={`/admin/events/${event.shortCode}/edit`}>
                      <Button size="sm">Edit</Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(event)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedEvent && (
        <DeleteEventDialog
          event={{
            shortCode: selectedEvent.shortCode,
            title: selectedEvent.title,
            attendeeCount: selectedEvent.joins.length,
          }}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}
