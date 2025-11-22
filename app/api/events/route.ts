import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { generateShortCode } from "@/lib/shortlink";
import { getWhatsAppAdapter } from "@/lib/messaging/WhatsAppAdapter";
import { getStorageAdapter } from "@/lib/storage/StorageAdapter";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  location: z.string().optional(),
  targetGroupIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Allow all authenticated members to create events
    const user = await requireAuth();

    const body = await req.json();

    // Convert empty strings to null for optional fields
    const cleanedBody = {
      ...body,
      startsAt: body.startsAt && body.startsAt !== "" ? body.startsAt : null,
      endsAt: body.endsAt && body.endsAt !== "" ? body.endsAt : null,
    };

    const data = createEventSchema.parse(cleanedBody);

    // Convert datetime strings to Date objects
    // datetime-local format is "YYYY-MM-DDTHH:mm" which can be parsed directly
    const startsAtDate = data.startsAt ? new Date(data.startsAt) : null;
    const endsAtDate = data.endsAt ? new Date(data.endsAt) : null;

    // Generate unique short code
    let shortCode = generateShortCode();
    let attempts = 0;
    while (await prisma.event.findUnique({ where: { shortCode } })) {
      shortCode = generateShortCode();
      attempts++;
      if (attempts > 10) {
        throw new Error("Failed to generate unique short code");
      }
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl,
        startsAt: startsAtDate,
        endsAt: endsAtDate,
        location: data.location,
        createdById: user.id,
        shortCode,
        targets: data.targetGroupIds
          ? {
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

    // Send WhatsApp notifications if groups are selected
    if (data.targetGroupIds && data.targetGroupIds.length > 0) {
      const siteUrl = process.env.SITE_URL || "http://localhost:3000";
      const eventUrl = `${siteUrl}/events/${shortCode}`;
      const message = `[Friday Ice Party] ${data.title} — ${data.category}\n${data.description}\nJoin: ${eventUrl}`;

      const whatsapp = getWhatsAppAdapter();

      for (const target of event.targets) {
        try {
          await whatsapp.sendToGroup({
            group: target.group,
            message,
            link: eventUrl,
            imageUrl: data.imageUrl,
          });
        } catch (error) {
          console.error(
            `Failed to send WhatsApp to group ${target.group.name}:`,
            error
          );
          // Continue with other groups even if one fails
        }
      }
    }

    return NextResponse.json({ event }, { status: 201 });
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

    console.error("Create event error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create event",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");

    const events = await prisma.event.findMany({
      where: category ? { category } : undefined,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        joins: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      events: events.map((event) => ({
        ...event,
        attendeeCount: event.joins.length,
      })),
    });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
