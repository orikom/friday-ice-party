import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { isMember: false, error: "This email is not registered as a member" },
        { status: 404 }
      );
    }

    return NextResponse.json({ isMember: true });
  } catch (error) {
    console.error("Check member error:", error);
    return NextResponse.json(
      { error: "Failed to check membership" },
      { status: 500 }
    );
  }
}

