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
  name: z.string().min(1, "Name is required"),
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
        throw new Error(error.error || "Failed to update group");
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
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>Update group details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="waId">WhatsApp Group ID</Label>
            <Input
              id="waId"
              {...register("waId")}
              placeholder="Optional - external WhatsApp group ID"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Updating..." : "Update"}
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
        `Are you sure you want to delete "${group.name}"? This will remove ${group.memberCount} member(s) and ${group.eventCount} event association(s).`
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
        throw new Error(error.error || "Failed to delete group");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Delete group error:", error);
      alert(error instanceof Error ? error.message : "Failed to delete group");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{group.name}&quot;? This
            action cannot be undone.
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
