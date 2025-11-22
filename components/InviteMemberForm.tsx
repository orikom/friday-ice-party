"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inviteSchema = z.object({
  email: z.string().email("אימייל לא תקין"),
  phone: z.string().optional(),
  name: z.string().optional(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function InviteMemberForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "MEMBER",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setSubmitting(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "נכשל בהזמנת החבר");
      }

      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Invite error:", error);
      alert(error instanceof Error ? error.message : "Failed to invite member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">אימייל *</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="member@example.com"
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="name">שם</Label>
        <Input id="name" {...register("name")} placeholder="אופציונלי" />
      </div>

      <div>
        <Label htmlFor="phone">טלפון</Label>
        <Input id="phone" {...register("phone")} placeholder="אופציונלי" />
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

      {success && (
        <p className="text-sm text-green-600">החבר הוזמן בהצלחה!</p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "מזמין..." : "הזמן חבר"}
      </Button>
    </form>
  );
}
