"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const groupSchema = z.object({
  name: z.string().min(1, "שם נדרש"),
  waId: z.string().optional(),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface EditGroupDialogProps {
  group: {
    id: string;
    name: string;
    waId?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGroupDialog({
  group,
  open,
  onOpenChange,
}: EditGroupDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group.name,
      waId: group.waId || "",
    },
  });

  const onSubmit = async (data: GroupFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/groups/${group.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "נכשל בעדכון הקבוצה");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Update group error:", error);
      alert(error instanceof Error ? error.message : "Failed to update group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ערוך קבוצה</DialogTitle>
          <DialogDescription>עדכן פרטי קבוצה</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">שם הקבוצה *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="waId">מזהה קבוצת וואטסאפ</Label>
            <Input
              id="waId"
              {...register("waId")}
              placeholder="אופציונלי - מזהה קבוצת וואטסאפ חיצוני"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "מעדכן..." : "עדכן"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteGroupDialogProps {
  group: {
    id: string;
    name: string;
    memberCount: number;
    eventCount: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGroupDialog({
  group,
  open,
  onOpenChange,
}: DeleteGroupDialogProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `האם אתה בטוח שברצונך למחוק את "${group.name}"? זה יסיר ${group.memberCount} חבר(ים) ו-${group.eventCount} קשרי אירועים.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/groups/${group.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "נכשל במחיקת הקבוצה");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Delete group error:", error);
      alert(error instanceof Error ? error.message : "נכשל במחיקת הקבוצה");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>מחק קבוצה</DialogTitle>
          <DialogDescription>
            האם אתה בטוח שברצונך למחוק את &quot;{group.name}&quot;? פעולה זו לא ניתנת לביטול.
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
