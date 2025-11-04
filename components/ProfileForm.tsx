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
      alert("Failed to upload image");
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
        throw new Error(error.error || "Failed to update profile");
      }

      router.refresh();
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
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
        throw new Error(error.error || "Failed to delete account");
      }

      // Redirect to sign out page or home
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("Delete account error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete account"
      );
      setDeleting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="image">Profile Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {watch("imageUrl") && (
            <p className="text-sm text-green-600 mt-1">Image uploaded</p>
          )}
          {profile.imageUrl && !watch("imageUrl") && (
            <p className="text-sm text-gray-500 mt-1">
              Current image: {profile.imageUrl}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
        </div>

        <div>
          <Label htmlFor="occupation">Occupation</Label>
          <Input id="occupation" {...register("occupation")} />
        </div>

        <div>
          <Label htmlFor="description">Description / Bio</Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={4}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <Input id="instagramUrl" {...register("instagramUrl")} />
          </div>
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input id="linkedinUrl" {...register("linkedinUrl")} />
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </form>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone. All your data, event joins, and group memberships will
              be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
