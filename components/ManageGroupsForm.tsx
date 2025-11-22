"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const groupSchema = z.object({
  name: z.string().min(1, "שם נדרש"),
  waId: z.string().optional(),
});

type GroupFormData = z.infer<typeof groupSchema>;

export function ManageGroupsForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
  });

  const onSubmit = async (data: GroupFormData) => {
    setSubmitting(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "נכשל ביצירת הקבוצה");
      }

      setSuccess(true);
      reset();
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Create group error:", error);
      alert(error instanceof Error ? error.message : "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">שם הקבוצה *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="מסיבה, יוגה, מינגלינג, עסקים וכו'"
        />
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
        <p className="text-xs text-gray-500 mt-1">
          השאר ריק לעת עתה. הגדר זאת בעת חיבור ל-WhatsApp API.
        </p>
      </div>

      {success && (
        <p className="text-sm text-green-600">הקבוצה נוצרה בהצלחה!</p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "יוצר..." : "צור קבוצה"}
      </Button>
    </form>
  );
}
