import { Group } from "@prisma/client";

export interface WhatsAppMessage {
  group: Group;
  message: string;
  link?: string;
  imageUrl?: string;
}

export interface WhatsAppAdapter {
  sendToGroup(params: WhatsAppMessage): Promise<void>;
}

export class MockWhatsAppAdapter implements WhatsAppAdapter {
  async sendToGroup({
    group,
    message,
    link,
    imageUrl,
  }: WhatsAppMessage): Promise<void> {
    console.log("[Mock WhatsApp] Sending message to group:", {
      groupName: group.name,
      groupId: group.waId || "N/A",
      message,
      link,
      imageUrl,
    });
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export class MetaWhatsAppAdapter implements WhatsAppAdapter {
  private apiToken: string;
  private phoneNumberId: string;
  private fromNumber: string;

  constructor() {
    this.apiToken = process.env.WHATSAPP_API_TOKEN || "";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.fromNumber = process.env.WHATSAPP_FROM_NUMBER || "";

    if (!this.apiToken || !this.phoneNumberId) {
      throw new Error(
        "Meta WhatsApp adapter requires WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID"
      );
    }
  }

  async sendToGroup({
    group,
    message,
    link,
    imageUrl,
  }: WhatsAppMessage): Promise<void> {
    // TODO: Implement Meta WhatsApp Cloud API integration
    // For now, log the payload that would be sent
    console.log("[Meta WhatsApp] Would send to group:", {
      groupName: group.name,
      waId: group.waId,
      message,
      link,
      imageUrl,
    });

    // Example API call structure:
    // const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: group.waId,
    //     type: 'text',
    //     text: { body: message },
    //   }),
    // })
    throw new Error("Meta WhatsApp adapter not yet implemented");
  }
}

export class TwilioWhatsAppAdapter implements WhatsAppAdapter {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN || "";
    this.fromNumber = process.env.WHATSAPP_FROM_NUMBER || "";

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error(
        "Twilio WhatsApp adapter requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and WHATSAPP_FROM_NUMBER"
      );
    }
  }

  async sendToGroup({
    group,
    message,
    link,
    imageUrl,
  }: WhatsAppMessage): Promise<void> {
    // TODO: Implement Twilio WhatsApp integration
    // Note: Twilio supports 1-to-1 messaging, not group messaging directly
    // Groups would need to be handled via individual member notifications
    console.log("[Twilio WhatsApp] Would send to group members:", {
      groupName: group.name,
      message,
      link,
      imageUrl,
    });
    throw new Error("Twilio WhatsApp adapter not yet implemented");
  }
}

export function getWhatsAppAdapter(): WhatsAppAdapter {
  const provider = process.env.WHATSAPP_PROVIDER || "mock";

  switch (provider) {
    case "meta":
      return new MetaWhatsAppAdapter();
    case "twilio":
      return new TwilioWhatsAppAdapter();
    case "mock":
    default:
      return new MockWhatsAppAdapter();
  }
}
