import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { getWhatsAppAdapter } from "@/lib/messaging/WhatsAppAdapter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { shortCode } = await params;

    const event = await prisma.event.findUnique({
      where: { shortCode },
      include: {
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

    if (event.targets.length === 0) {
      return NextResponse.json(
        { error: "Event has no target groups" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    const eventUrl = `${siteUrl}/events/${shortCode}`;
    const message = `[Friday Ice Party] ${event.title} — ${event.category}\n${event.description}\nJoin: ${eventUrl}`;

    const whatsapp = getWhatsAppAdapter();
    const results = [];

    for (const target of event.targets) {
      try {
        await whatsapp.sendToGroup({
          group: target.group,
          message,
          link: eventUrl,
          imageUrl: event.imageUrl || undefined,
        });
        results.push({ groupId: target.groupId, success: true });
      } catch (error) {
        console.error(
          `Failed to send WhatsApp to group ${target.group.name}:`,
          error
        );
        results.push({
          groupId: target.groupId,
          success: false,
          error: String(error),
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Notify event error:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
