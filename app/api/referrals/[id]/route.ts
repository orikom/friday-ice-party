import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";
import { Role } from "@prisma/client";

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { action, rejectionReason } = approveSchema.parse(body);

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: {
        referrer: true,
      },
    });

    if (!referral) {
      return NextResponse.json(
        { error: "Referral not found" },
        { status: 404 }
      );
    }

    if (referral.status !== "PENDING") {
      return NextResponse.json(
        { error: "Referral has already been processed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Create user account
      const newUser = await prisma.user.create({
        data: {
          email: referral.email,
          name: referral.name,
          phone: referral.phone,
          city: referral.city,
          occupation: referral.occupation,
          instagramUrl: referral.instagramUrl,
          linkedinUrl: referral.linkedinUrl,
          description: referral.notes || null,
          role: Role.MEMBER,
        },
      });

      // Update referral status
      await prisma.referral.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedById: admin.id,
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          referral: {
            ...referral,
            status: "APPROVED",
          },
          user: newUser,
        },
        { status: 200 }
      );
    } else {
      // Reject referral
      await prisma.referral.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedById: admin.id,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || null,
        },
      });

      return NextResponse.json(
        {
          referral: {
            ...referral,
            status: "REJECTED",
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Update referral error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update referral",
      },
      { status: 500 }
    );
  }
}
