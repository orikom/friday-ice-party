import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const updateGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  waId: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const data = updateGroupSchema.parse(body);

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Update group
    const group = await prisma.group.update({
      where: { id },
      data: {
        name: data.name,
        waId: data.waId || null,
      },
    });

    return NextResponse.json({ group }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.errors.map((err) => ({
            path: err.path,
            message: err.message,
            code: err.code,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Update group error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update group",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Delete group (cascade will handle related records)
    await prisma.group.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete group error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete group",
      },
      { status: 500 }
    );
  }
}
