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

const memberSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  occupation: z.string().optional(),
  description: z.string().optional(),
  instagramUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface EditMemberDialogProps {
  member: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    city: string | null;
    occupation: string | null;
    description: string | null;
    instagramUrl: string | null;
    linkedinUrl: string | null;
    role: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMemberDialog({
  member,
  open,
  onOpenChange,
}: EditMemberDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member.name || "",
      email: member.email,
      phone: member.phone || "",
      city: member.city || "",
      occupation: member.occupation || "",
      description: member.description || "",
      instagramUrl: member.instagramUrl || "",
      linkedinUrl: member.linkedinUrl || "",
      role: member.role as "ADMIN" | "MEMBER",
    },
  });

  const onSubmit = async (data: MemberFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "נכשל בעדכון החבר");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Update member error:", error);
      alert(error instanceof Error ? error.message : "Failed to update member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ערוך חבר</DialogTitle>
          <DialogDescription>עדכן פרטי חבר</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">שם</Label>
              <Input id="name" {...register("name")} />
            </div>
            <div>
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div>
              <Label htmlFor="city">עיר</Label>
              <Input id="city" {...register("city")} />
            </div>
          </div>

          <div>
            <Label htmlFor="occupation">מקצוע</Label>
            <Input id="occupation" {...register("occupation")} />
          </div>

          <div>
            <Label htmlFor="description">תיאור</Label>
            <Input id="description" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instagramUrl">כתובת Instagram</Label>
              <Input id="instagramUrl" {...register("instagramUrl")} />
            </div>
            <div>
              <Label htmlFor="linkedinUrl">כתובת LinkedIn</Label>
              <Input id="linkedinUrl" {...register("linkedinUrl")} />
            </div>
          </div>

          <div>
            <Label htmlFor="role">תפקיד</Label>
            <select
              id="role"
              {...register("role")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="MEMBER">חבר</option>
              <option value="ADMIN">מנהל</option>
            </select>
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

interface DeleteMemberDialogProps {
  member: {
    id: string;
    name: string | null;
    email: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMemberDialog({
  member,
  open,
  onOpenChange,
}: DeleteMemberDialogProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `האם אתה בטוח שברצונך למחוק את "${
          member.name || member.email
        }"? פעולה זו לא ניתנת לביטול.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "נכשל במחיקת החבר");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Delete member error:", error);
      alert(error instanceof Error ? error.message : "נכשל במחיקת החבר");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>מחק חבר</DialogTitle>
          <DialogDescription>
            האם אתה בטוח שברצונך למחוק את &quot;{member.name || member.email}
            &quot;? פעולה זו לא ניתנת לביטול.
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
