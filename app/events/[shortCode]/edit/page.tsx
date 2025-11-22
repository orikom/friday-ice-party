"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { useSession } from "next-auth/react";
import Link from "next/link";

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

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  location?: string | null;
  createdById: string;
  targets: Array<{ groupId: string }>;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const shortCode = params.shortCode as string;
  const [groups, setGroups] = useState<Group[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

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
    if (!session) {
      router.push("/auth/signin?callbackUrl=/events/" + shortCode + "/edit");
      return;
    }
    fetchData();
  }, [shortCode, session]);

  const fetchData = async () => {
    try {
      const [eventResponse, groupsResponse] = await Promise.all([
        fetch(`/api/events/${shortCode}`),
        fetch("/api/admin/groups"),
      ]);

      if (!eventResponse.ok) {
        throw new Error("Failed to fetch event");
      }

      const eventData = await eventResponse.json();
      const groupsData = await groupsResponse.json();

      const event = eventData.event;
      setEvent(event);
      setGroups(groupsData.groups || []);

      // Check if user can edit (creator or admin)
      const userCanEdit =
        session?.user?.id === event.createdById ||
        session?.user?.role === "ADMIN";
      setCanEdit(userCanEdit);

      if (!userCanEdit) {
        router.push(`/events/${shortCode}`);
        return;
      }

      // Pre-populate form with event data
      setValue("title", event.title);
      setValue("description", event.description);
      setValue("category", event.category);
      setValue("imageUrl", event.imageUrl || "");
      setValue("location", event.location || "");

      // Format dates for datetime-local input
      if (event.startsAt) {
        const startsAt = new Date(event.startsAt);
        const localDateTime = new Date(
          startsAt.getTime() - startsAt.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);
        setValue("startsAt", localDateTime);
      }

      if (event.endsAt) {
        const endsAt = new Date(event.endsAt);
        const localDateTime = new Date(
          endsAt.getTime() - endsAt.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);
        setValue("endsAt", localDateTime);
      }

      // Set selected groups
      if (event.targets && event.targets.length > 0) {
        setValue(
          "targetGroupIds",
          event.targets.map((t: any) => t.groupId || t.group?.id)
        );
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("נכשל בטעינת נתוני האירוע");
      router.push(`/events/${shortCode}`);
    } finally {
      setLoading(false);
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

      const response = await fetch(`/api/events/${shortCode}`, {
        method: "PUT",
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
          alert(errorData.error || "נכשל בעדכון האירוע");
        }
        throw new Error(errorData.error || "נכשל בעדכון האירוע");
      }

      router.push(`/events/${shortCode}`);
    } catch (error) {
      console.error("Update event error:", error);
      // Don't show alert again if we already showed validation errors
      if (!(error instanceof Error && error.message.includes("Validation"))) {
        alert(
          error instanceof Error ? error.message : "נכשל בעדכון האירוע"
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

  if (loading || !session) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-gray-500">טוען...</p>
        </div>
      </div>
    );
  }

  if (!event || !canEdit) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-red-600">אין הרשאה לערוך אירוע זה</p>
          <Link href={`/events/${shortCode}`}>
            <Button className="mt-4">חזור לאירוע</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-4">
        <Link href={`/events/${shortCode}`}>
          <Button variant="ghost" size="sm">
            ← חזור לאירוע
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8">ערוך אירוע</h1>

      <Card>
        <CardHeader>
          <CardTitle>פרטי האירוע</CardTitle>
          <CardDescription>עדכן את הפרטים עבור האירוע שלך</CardDescription>
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
              {event.imageUrl && !watch("imageUrl") && (
                <p className="text-sm text-gray-500 mt-1">
                  תמונה נוכחית: {event.imageUrl}
                </p>
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
                {submitting ? "מעדכן..." : "עדכן אירוע"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/events/${shortCode}`)}
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

