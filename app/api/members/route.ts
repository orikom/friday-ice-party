import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || "";

    // Check if user is authenticated
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const isAuthenticated = !!token;

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
        // Show description only to authenticated users
        description: isAuthenticated,
        instagramUrl: isAuthenticated,
        linkedinUrl: isAuthenticated,
        phone: isAuthenticated,
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

