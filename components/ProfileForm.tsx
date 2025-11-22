"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const profileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  occupation: z.string().optional(),
  description: z.string().optional(),
  instagramUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: {
    id: string;
    name: string | null;
    phone: string | null;
    city: string | null;
    occupation: string | null;
    description: string | null;
    instagramUrl: string | null;
    linkedinUrl: string | null;
    imageUrl: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || "",
      phone: profile.phone || "",
      city: profile.city || "",
      occupation: profile.occupation || "",
      description: profile.description || "",
      instagramUrl: profile.instagramUrl || "",
      linkedinUrl: profile.linkedinUrl || "",
      imageUrl: profile.imageUrl || "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setValue("imageUrl", data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("נכשל בהעלאת התמונה");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "נכשל בעדכון הפרופיל");
      }

      router.refresh();
      alert("הפרופיל עודכן בהצלחה!");
    } catch (error) {
      console.error("Update profile error:", error);
      alert(
        error instanceof Error ? error.message : "נכשל בעדכון הפרופיל"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "האם אתה בטוח שברצונך למחוק את החשבון שלך? פעולה זו לא ניתנת לביטול."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch("/api/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "נכשל במחיקת החשבון");
      }

      // Redirect to sign out page or home
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("Delete account error:", error);
      alert(
        error instanceof Error ? error.message : "נכשל במחיקת החשבון"
      );
      setDeleting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="image">תמונת פרופיל</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {watch("imageUrl") && (
            <p className="text-sm text-green-600 mt-1">תמונה הועלתה</p>
          )}
          {profile.imageUrl && !watch("imageUrl") && (
            <p className="text-sm text-gray-500 mt-1">
              תמונה נוכחית: {profile.imageUrl}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="name">שם</Label>
          <Input id="name" {...register("name")} />
        </div>

        <div>
          <Label htmlFor="phone">טלפון</Label>
          <Input id="phone" {...register("phone")} />
        </div>

        <div>
          <Label htmlFor="city">עיר</Label>
          <Input id="city" {...register("city")} />
        </div>

        <div>
          <Label htmlFor="occupation">מקצוע</Label>
          <Input id="occupation" {...register("occupation")} />
        </div>

        <div>
          <Label htmlFor="description">תיאור / ביוגרפיה</Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={4}
            placeholder="ספר לנו על עצמך..."
          />
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

        <div className="flex gap-4 pt-4 border-t">
          <Button type="submit" disabled={submitting}>
            {submitting ? "שומר..." : "שמור שינויים"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            מחק חשבון
          </Button>
        </div>
      </form>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחק חשבון</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את החשבון שלך? פעולה זו לא ניתנת לביטול. כל הנתונים שלך, הצטרפויות לאירועים וחברויות בקבוצות יימחקו לצמיתות.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              ביטול
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "מוחק..." : "מחק חשבון"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
