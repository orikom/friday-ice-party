"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteEventDialogProps {
  event: {
    shortCode: string;
    title: string;
    attendeeCount: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEventDialog({
  event,
  open,
  onOpenChange,
}: DeleteEventDialogProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${event.title}"? This will remove ${event.attendeeCount} attendee(s). This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/events/${event.shortCode}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete event");
      }

      onOpenChange(false);
      router.refresh();
      router.push("/admin/events");
    } catch (error) {
      console.error("Delete event error:", error);
      alert(error instanceof Error ? error.message : "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{event.title}&quot;? This
            action cannot be undone and will remove {event.attendeeCount}{" "}
            attendee(s).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
