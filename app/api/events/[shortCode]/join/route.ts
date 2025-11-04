import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { generateEventJoinQR } from "@/lib/qrcode";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const user = await requireAuth();
    const { shortCode } = await params;

    // Get event
    const event = await prisma.event.findUnique({
      where: { shortCode },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if already joined
    const existingJoin = await prisma.eventJoin.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
    });

    if (existingJoin) {
      return NextResponse.json(
        { error: "Already joined this event", join: existingJoin },
        { status: 400 }
      );
    }

    // Generate QR code
    const qrCode = await generateEventJoinQR(event.id, user.id);

    // Create join record
    const join = await prisma.eventJoin.create({
      data: {
        eventId: event.id,
        userId: user.id,
        qrCode,
        paid: false, // TODO: Handle payment flow
      },
    });

    return NextResponse.json({ join }, { status: 201 });
  } catch (error) {
    console.error("Join event error:", error);
    return NextResponse.json(
      { error: "Failed to join event" },
      { status: 500 }
    );
  }
}
