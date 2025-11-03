import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || "";

    const members = await prisma.user.findMany({
      where: {
        role: "MEMBER",
        OR: query
          ? [
              { name: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
              { occupation: { contains: query, mode: "insensitive" } },
            ]
          : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        city: true,
        occupation: true,
        description: true,
        instagramUrl: true,
        linkedinUrl: true,
        phone: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Members search error:", error);
    return NextResponse.json(
      { error: "Failed to search members" },
      { status: 500 }
    );
  }
}
