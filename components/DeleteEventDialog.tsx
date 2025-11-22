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
        `האם אתה בטוח שברצונך למחוק את "${event.title}"? זה יסיר ${event.attendeeCount} משתתף/ים. פעולה זו לא ניתנת לביטול.`
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
        throw new Error(error.error || "נכשל במחיקת האירוע");
      }

      onOpenChange(false);
      router.refresh();
      router.push("/admin/events");
    } catch (error) {
      console.error("Delete event error:", error);
      alert(error instanceof Error ? error.message : "נכשל במחיקת האירוע");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>מחק אירוע</DialogTitle>
          <DialogDescription>
            האם אתה בטוח שברצונך למחוק את &quot;{event.title}&quot;? פעולה זו לא ניתנת לביטול ותסיר {event.attendeeCount}{" "}
            משתתף/ים.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            ביטול
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "מוחק..." : "מחק"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
