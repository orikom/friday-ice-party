import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  occupation: z.string().optional(),
  description: z.string().optional(),
  instagramUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        phone: true,
        city: true,
        occupation: true,
        description: true,
        instagramUrl: true,
        linkedinUrl: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    // Update user's own profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name !== undefined && { name: data.name || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.occupation !== undefined && {
          occupation: data.occupation || null,
        }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
        ...(data.instagramUrl !== undefined && {
          instagramUrl: data.instagramUrl || null,
        }),
        ...(data.linkedinUrl !== undefined && {
          linkedinUrl: data.linkedinUrl || null,
        }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        phone: true,
        city: true,
        occupation: true,
        description: true,
        instagramUrl: true,
        linkedinUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ profile: updatedUser }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.issues.map((err) => ({
            path: err.path,
            message: err.message,
            code: err.code,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Delete user's own account (cascade will handle related records)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete account",
      },
      { status: 500 }
    );
  }
}
