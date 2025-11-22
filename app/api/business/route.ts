import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const query = searchParams.get("query") || "";

    const businesses = await prisma.business.findMany({
      where: {
        AND: [
          category && category !== "all" ? { category } : {},
          query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                  { category: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { isRecommended: "desc" }, // Recommended first
        { name: "asc" },
      ],
    });

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Business search error:", error);
    return NextResponse.json(
      { error: "Failed to search businesses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { requireAuth } = await import("@/lib/auth-helpers");
    const user = await requireAuth();

    const body = await req.json();
    const {
      name,
      description,
      category,
      imageUrl,
      phone,
      email,
      website,
      address,
      city,
      instagramUrl,
      linkedinUrl,
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "שם וקטגוריה נדרשים" },
        { status: 400 }
      );
    }

    const business = await prisma.business.create({
      data: {
        name,
        description,
        category,
        imageUrl,
        phone,
        email,
        website,
        address,
        city,
        instagramUrl,
        linkedinUrl,
        ownerId: user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    console.error("Create business error:", error);
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}

