import QRCode from "qrcode";

/**
 * Generate QR code as data URL
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 1,
    });
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generate QR code as Buffer (for saving to file)
 */
export async function generateQRCodeBuffer(text: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(text, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 1,
    });
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generate QR code for event join
 */
export async function generateEventJoinQR(
  eventId: string,
  userId: string
): Promise<string> {
  const qrData = JSON.stringify({
    eventId,
    userId,
    timestamp: Date.now(),
  });
  return generateQRCodeDataURL(qrData);
}
