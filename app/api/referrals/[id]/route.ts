import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";
import { Role } from "@prisma/client";
import { createInviteToken } from "@/lib/invite-token";
import { sendEmail } from "@/lib/email";

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { action, rejectionReason } = approveSchema.parse(body);

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: {
        referrer: true,
      },
    });

    if (!referral) {
      return NextResponse.json(
        { error: "Referral not found" },
        { status: 404 }
      );
    }

    if (referral.status !== "PENDING") {
      return NextResponse.json(
        { error: "Referral has already been processed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: referral.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }

      // Create user account (without password - they'll set it via invitation)
      const newUser = await prisma.user.create({
        data: {
          email: referral.email,
          name: referral.name,
          phone: referral.phone,
          city: referral.city,
          occupation: referral.occupation,
          instagramUrl: referral.instagramUrl,
          linkedinUrl: referral.linkedinUrl,
          description: referral.notes || null,
          role: Role.MEMBER,
        },
      });

      // Generate invitation token
      const inviteToken = await createInviteToken(referral.email, 7); // Expires in 7 days

      // Get site URL for invitation link
      const siteUrl = process.env.SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
      const inviteUrl = `${siteUrl}/auth/invite/${inviteToken}`;

      // Send invitation email
      try {
        await sendEmail({
          to: referral.email,
          subject: "ברוכים הבאים לקהילת הקרח! Welcome to Friday Ice Party",
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>ברוכים הבאים לקהילת הקרח!</h1>
              <p>שלום ${referral.name || referral.email},</p>
              <p>ההפניה שלך אושרה ואתה מוזמן להצטרף לקהילת הקרח!</p>
              <p>כדי להתחיל, אנא הגדר את הסיסמה שלך על ידי לחיצה על הקישור הבא:</p>
              <p style="margin: 30px 0;">
                <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  הגדר סיסמה / Set Password
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                הקישור יפוג תוך 7 ימים. אם לא ביקשת את זה, תוכל להתעלם מהאימייל הזה.
              </p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <div dir="ltr" style="font-size: 14px; color: #666;">
                <p>Hello ${referral.name || referral.email},</p>
                <p>Your referral has been approved and you're invited to join the Friday Ice Party community!</p>
                <p>To get started, please set your password by clicking the link above.</p>
                <p style="color: #999; font-size: 12px;">
                  This link expires in 7 days. If you didn't request this, you can ignore this email.
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send invitation email:", emailError);
        // Don't fail the approval if email fails - user can still be invited manually
      }

      // Update referral status
      await prisma.referral.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedById: admin.id,
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          referral: {
            ...referral,
            status: "APPROVED",
          },
          user: newUser,
          inviteSent: true,
        },
        { status: 200 }
      );
    } else {
      // Reject referral
      await prisma.referral.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedById: admin.id,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || null,
        },
      });

      return NextResponse.json(
        {
          referral: {
            ...referral,
            status: "REJECTED",
          },
        },
        { status: 200 }
      );
    }
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

    console.error("Update referral error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update referral",
      },
      { status: 500 }
    );
  }
}
