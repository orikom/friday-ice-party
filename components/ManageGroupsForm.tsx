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
  name: z.string().min(1, "Name is required"),
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
        throw new Error(error.error || "Failed to create group");
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
        <Label htmlFor="name">Group Name *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="party, yoga, mingling, business, etc."
        />
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
        <p className="text-xs text-gray-500 mt-1">
          Leave empty for now. Set this when connecting to WhatsApp API.
        </p>
      </div>

      {success && (
        <p className="text-sm text-green-600">Group created successfully!</p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create Group"}
      </Button>
    </form>
  );
}
