import { prisma } from "./prisma";
import crypto from "crypto";

/**
 * Generate a secure random token for invitations
 */
export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create an invitation token in the database
 * @param email Email address of the user being invited
 * @param expiresInDays Number of days until token expires (default: 7)
 * @returns The token string
 */
export async function createInviteToken(
  email: string,
  expiresInDays: number = 7
): Promise<string> {
  const token = generateInviteToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + expiresInDays);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify an invitation token
 * @param token Token to verify
 * @returns Email if token is valid, null otherwise
 */
export async function verifyInviteToken(
  token: string
): Promise<{ email: string; expires: Date } | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return null;
  }

  // Check if token has expired
  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    return null;
  }

  return {
    email: verificationToken.identifier,
    expires: verificationToken.expires,
  };
}

/**
 * Delete an invitation token (after it's been used)
 */
export async function deleteInviteToken(token: string): Promise<void> {
  await prisma.verificationToken.delete({
    where: { token },
  }).catch(() => {
    // Ignore errors if token doesn't exist
  });
}


