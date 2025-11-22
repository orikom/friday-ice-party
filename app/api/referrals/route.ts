import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { z } from "zod";

const referralSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  age: z.number().optional().nullable(),
  howDoYouKnow: z.string().min(1),
  howLong: z.string().min(1),
  occupation: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  city: z.string().optional(),
  hobbies: z.string().optional(),
  interests: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Only members can refer (not admins directly, though admins can approve)
    if (user.role !== "MEMBER") {
      return NextResponse.json(
        { error: "Only members can submit referrals" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = referralSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Check if there's already a pending referral for this email
    const existingReferral = await prisma.referral.findFirst({
      where: {
        email: data.email,
        status: "PENDING",
      },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: "A pending referral for this email already exists" },
        { status: 400 }
      );
    }

    // Create referral
    const referral = await prisma.referral.create({
      data: {
        referrerId: user.id,
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        age: data.age || null,
        howDoYouKnow: data.howDoYouKnow,
        howLong: data.howLong,
        occupation: data.occupation || null,
        linkedinUrl: data.linkedinUrl || null,
        instagramUrl: data.instagramUrl || null,
        city: data.city || null,
        hobbies: data.hobbies || null,
        interests: data.interests || null,
        notes: data.notes || null,
      },
      include: {
        referrer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ referral }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.issues.map((err) => ({
            path: err.path,
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Create referral error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create referral",
      },
      { status: 500 }
    );
  }
}
