export interface PaymentResult {
  url: string;
  paymentId?: string;
}

export interface PaymentAdapter {
  createPayment(
    eventId: string,
    userId: string,
    amount?: number
  ): Promise<PaymentResult>;
}

export class NoPaymentAdapter implements PaymentAdapter {
  async createPayment(): Promise<PaymentResult> {
    throw new Error("Payments are not enabled");
  }
}

export class PayboxAdapter implements PaymentAdapter {
  private apiUrl: string;
  private merchantId: string;
  private secretKey: string;

  constructor() {
    this.apiUrl = process.env.PAYBOX_API_URL || "https://paybox.com/api";
    this.merchantId = process.env.PAYBOX_MERCHANT_ID || "";
    this.secretKey = process.env.PAYBOX_SECRET_KEY || "";

    if (!this.merchantId || !this.secretKey) {
      throw new Error(
        "Paybox adapter requires PAYBOX_MERCHANT_ID and PAYBOX_SECRET_KEY"
      );
    }
  }

  async createPayment(
    eventId: string,
    userId: string,
    amount: number = 0
  ): Promise<PaymentResult> {
    // TODO: Implement Paybox API integration
    console.log("[Paybox] Would create payment:", {
      eventId,
      userId,
      amount,
      merchantId: this.merchantId,
    });

    // Mock implementation for now
    return {
      url: `${this.apiUrl}/payment/mock?eventId=${eventId}&userId=${userId}`,
      paymentId: `mock_${Date.now()}`,
    };
  }
}

export function getPaymentAdapter(): PaymentAdapter {
  const provider = process.env.PAYMENTS_PROVIDER || "none";

  switch (provider) {
    case "paybox":
      return new PayboxAdapter();
    case "none":
    default:
      return new NoPaymentAdapter();
  }
}
