/**
 * Generate a friendly short code for events
 * Format: 6 characters, alphanumeric (lowercase), avoiding ambiguous characters
 */
export function generateShortCode(): string {
  const chars = "abcdefghijkmnopqrstuvwxyz23456789"; // removed 0, 1, l, I for clarity
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate a short code format
 */
export function isValidShortCode(code: string): boolean {
  return /^[a-z2-9]{6}$/.test(code);
}
