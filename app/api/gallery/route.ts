import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    // Gallery is only accessible to authenticated members
    await requireAuth();

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const eventId = searchParams.get("eventId");

    const items = await prisma.galleryItem.findMany({
      where: {
        AND: [
          category && category !== "all" ? { category } : {},
          eventId ? { eventId } : {},
        ],
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            shortCode: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const { title, description, imageUrl, videoUrl, eventId, category } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "תמונה נדרשת" },
        { status: 400 }
      );
    }

    const item = await prisma.galleryItem.create({
      data: {
        title,
        description,
        imageUrl,
        videoUrl,
        eventId: eventId || null,
        category: category || null,
        uploadedById: user.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            shortCode: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Create gallery item error:", error);
    return NextResponse.json(
      { error: "Failed to create gallery item" },
      { status: 500 }
    );
  }
}

