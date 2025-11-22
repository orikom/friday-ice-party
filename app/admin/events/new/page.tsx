"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const eventSchema = z.object({
  title: z.string().min(1, "כותרת נדרשת"),
  description: z.string().min(1, "תיאור נדרש"),
  category: z.string().min(1, "קטגוריה נדרשת"),
  imageUrl: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  location: z.string().optional(),
  targetGroupIds: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface Group {
  id: string;
  name: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const selectedGroups = watch("targetGroupIds") || [];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/admin/groups");
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

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

  const onSubmit = async (data: EventFormData) => {
    setSubmitting(true);
    try {
      // Convert datetime-local format to ISO string for API
      const payload = {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : null,
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : null,
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Show detailed validation errors if available
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessages = errorData.details
            .map((err: any) => `${err.path.join(".")}: ${err.message}`)
            .join("\n");
          alert(`שגיאות אימות:\n${errorMessages}`);
        } else {
          alert(errorData.error || "נכשל ביצירת האירוע");
        }
        throw new Error(errorData.error || "נכשל ביצירת האירוע");
      }

      router.push("/admin");
    } catch (error) {
      console.error("Create event error:", error);
      // Don't show alert again if we already showed validation errors
      if (!(error instanceof Error && error.message.includes("Validation"))) {
        alert(
          error instanceof Error ? error.message : "נכשל ביצירת האירוע"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    const current = selectedGroups;
    if (current.includes(groupId)) {
      setValue(
        "targetGroupIds",
        current.filter((id) => id !== groupId)
      );
    } else {
      setValue("targetGroupIds", [...current, groupId]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">צור אירוע</h1>

      <Card>
        <CardHeader>
          <CardTitle>פרטי האירוע</CardTitle>
          <CardDescription>מלא את הפרטים עבור האירוע שלך</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">כותרת *</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">תיאור *</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="category">קטגוריה *</Label>
              <Input
                id="category"
                {...register("category")}
                placeholder="מסיבה, יוגה, מינגלינג, עסקים וכו'"
              />
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="image">תמונה</Label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startsAt">תאריך ושעת התחלה</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  {...register("startsAt")}
                />
              </div>
              <div>
                <Label htmlFor="endsAt">תאריך ושעת סיום</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  {...register("endsAt")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">מיקום</Label>
              <Input id="location" {...register("location")} />
            </div>

            <div>
              <Label>שלח התראות לקבוצות וואטסאפ</Label>
              <div className="space-y-2 mt-2">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={() => toggleGroup(group.id)}
                    />
                    <Label
                      htmlFor={`group-${group.id}`}
                      className="font-normal cursor-pointer"
                    >
                      {group.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "יוצר..." : "צור אירוע"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                ביטול
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
