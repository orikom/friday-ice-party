import { NextRequest, NextResponse } from "next/server";
import { verifyInviteToken, deleteInviteToken } from "@/lib/invite-token";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { z } from "zod";

const setPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Verify token
    const tokenData = await verifyInviteToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: tokenData.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true, // Check if password already set
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // If password already set, token is invalid
    if (user.password) {
      await deleteInviteToken(token);
      return NextResponse.json(
        { error: "Password already set. Please sign in instead." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      email: user.email,
      name: user.name,
      expires: tokenData.expires,
    });
  } catch (error) {
    console.error("Verify invite token error:", error);
    return NextResponse.json(
      { error: "Failed to verify invitation" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { password } = setPasswordSchema.parse(body);

    // Verify token
    const tokenData = await verifyInviteToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: tokenData.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if password already set
    if (user.password) {
      await deleteInviteToken(token);
      return NextResponse.json(
        { error: "Password already set. Please sign in instead." },
        { status: 400 }
      );
    }

    // Hash password and update user
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerified: new Date(), // Mark email as verified
      },
    });

    // Delete used token
    await deleteInviteToken(token);

    return NextResponse.json({
      success: true,
      message: "Password set successfully. You can now sign in.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Set password error:", error);
    return NextResponse.json(
      { error: "Failed to set password" },
      { status: 500 }
    );
  }
}

