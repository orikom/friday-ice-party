import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { z } from "zod";

const updateEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  location: z.string().optional(),
  targetGroupIds: z.array(z.string()).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const user = await requireAuth();
    const { shortCode } = await params;

    // Check if event exists and user is creator or admin
    const existingEvent = await prisma.event.findUnique({
      where: { shortCode },
      select: { createdById: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only creator or admin can edit
    if (existingEvent.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - only event creator or admin can edit" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Convert empty strings to null for optional fields
    const cleanedBody = {
      ...body,
      startsAt: body.startsAt && body.startsAt !== "" ? body.startsAt : null,
      endsAt: body.endsAt && body.endsAt !== "" ? body.endsAt : null,
    };

    const data = updateEventSchema.parse(cleanedBody);

    // Convert datetime strings to Date objects
    const startsAtDate = data.startsAt ? new Date(data.startsAt) : null;
    const endsAtDate = data.endsAt ? new Date(data.endsAt) : null;

    // Update event and handle target groups
    const event = await prisma.event.update({
      where: { shortCode },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl,
        startsAt: startsAtDate,
        endsAt: endsAtDate,
        location: data.location,
        targets: data.targetGroupIds
          ? {
              deleteMany: {}, // Delete all existing target groups
              create: data.targetGroupIds.map((groupId) => ({
                groupId,
              })),
            }
          : undefined,
      },
      include: {
        targets: {
          include: {
            group: true,
          },
        },
      },
    });

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.issues);
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

    console.error("Update event error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update event",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const user = await requireAuth();
    const { shortCode } = await params;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { shortCode },
      select: { createdById: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only creator or admin can delete
    if (existingEvent.createdById !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - only event creator or admin can delete" },
        { status: 403 }
      );
    }

    // Delete event (cascade will handle related records)
    await prisma.event.delete({
      where: { shortCode },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete event",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    const event = await prisma.event.findUnique({
      where: { shortCode },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        joins: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        targets: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      event: {
        ...event,
        attendeeCount: event.joins.length,
      },
    });
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
