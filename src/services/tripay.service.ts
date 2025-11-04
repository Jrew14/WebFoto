import crypto from "crypto";

const API_KEY = process.env.TRIPAY_API_KEY;
const PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY;
const MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE;
const MODE = process.env.TRIPAY_MODE ?? "sandbox"; // Default to sandbox for safety

if (!API_KEY || !PRIVATE_KEY || !MERCHANT_CODE) {
  console.warn(
    "⚠️  Tripay environment variables are not fully set. Please check TRIPAY_API_KEY, TRIPAY_PRIVATE_KEY, and TRIPAY_MERCHANT_CODE in admin settings."
  );
}

// Automatically detect Tripay mode based on environment or merchant code
// Priority: TRIPAY_MODE env var > merchant code pattern
// Sandbox codes typically start with "T" (e.g., T12345)
// Production codes are typically numeric (e.g., 12345)
let isSandbox = false;

if (MODE.toLowerCase() === "sandbox") {
  isSandbox = true;
} else if (MODE.toLowerCase() === "production") {
  isSandbox = false;
} else {
  // Auto-detect from merchant code if mode not explicitly set
  isSandbox = MERCHANT_CODE?.startsWith("T") ?? false;
}

const BASE_URL = isSandbox
  ? "https://tripay.co.id/api-sandbox"
  : "https://tripay.co.id/api";

console.log(`[Tripay] Using ${isSandbox ? "SANDBOX" : "PRODUCTION"} mode with merchant code: ${MERCHANT_CODE}`);

interface TripayRequestOptions {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface TripayChannel {
  code: string;
  name: string;
  type: string;
  group?: string;
  fee_merchant: number;
  fee_customer: number;
  minimum_amount?: number;
  maximum_amount?: number;
}

export interface CreateTripayTransactionParams {
  method: string;
  merchantRef: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    sku?: string;
    description?: string | null;
    subtotal?: number;
    url?: string | null;
  }>;
  callbackUrl: string;
  returnUrl: string;
  expiredTime?: number;
}

export interface TripayTransaction {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  payment_name: string;
  amount: number;
  total_amount: number;
  fee_merchant: number;
  fee_customer: number;
  status: string;
  note?: string | null;
  pay_code?: string | null;
  checkout_url?: string | null;
  expired_time?: number;
  paid_time?: number | null;
}

class TripayService {
  private get defaultExpiry(): number {
    const minutes = Number(process.env.TRIPAY_TIMEOUT_MINUTES ?? "120");
    return Math.max(5, minutes) * 60; // seconds
  }

  private async request<T>(path: string, options: TripayRequestOptions = {}): Promise<T> {
    const url = `${BASE_URL}${path}`;

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      next: { revalidate: 0 },
    });

    const json = await response.json();

    if (!response.ok || json?.success === false) {
      const message = json?.message || json?.error || response.statusText;
      throw new Error(`Tripay request failed: ${message}`);
    }

    return json?.data ?? json;
  }

  async getPaymentChannels(): Promise<TripayChannel[]> {
    // Check if credentials are configured
    if (!API_KEY || !PRIVATE_KEY || !MERCHANT_CODE) {
      console.error("[Tripay] Credentials not configured");
      throw new Error("Tripay credentials not configured. Please configure in admin settings.");
    }

    try {
      const data = await this.request<{ data: TripayChannel[] | undefined } & TripayChannel[]>(
        "/merchant/payment-channel"
      );

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray((data as Record<string, unknown>)?.data)) {
        return (data as Record<string, unknown>).data as TripayChannel[];
      }

      return [];
    } catch (error) {
      console.error("[Tripay] Failed to get payment channels:", error);
      throw error;
    }
  }

  async createTransaction(params: CreateTripayTransactionParams): Promise<TripayTransaction> {
    if (!MERCHANT_CODE || !PRIVATE_KEY) {
      throw new Error("Tripay credential is not configured");
    }

    const signaturePayload = `${MERCHANT_CODE}${params.merchantRef}${params.amount}${PRIVATE_KEY}`;
    const signature = crypto.createHash("sha256").update(signaturePayload).digest("hex");

    const expiredTime = params.expiredTime
      ?? Math.floor(Date.now() / 1000) + this.defaultExpiry;

    const payload = {
      method: params.method,
      merchant_ref: params.merchantRef,
      amount: params.amount,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      order_items: params.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku,
        product_url: item.url,
        category: "Photo",
        description: item.description,
        subtotal: item.subtotal ?? item.price * item.quantity,
      })),
      callback_url: params.callbackUrl,
      return_url: params.returnUrl,
      expired_time: expiredTime,
      signature,
    };

    const transaction = await this.request<TripayTransaction>(
      "/transaction/create",
      {
        method: "POST",
        body: payload,
      }
    );

    return transaction;
  }

  async getTransactionDetail(reference: string): Promise<TripayTransaction> {
    const data = await this.request<{ data: TripayTransaction }>(
      `/transaction/detail?reference=${reference}`
    );

    if ((data as Record<string, unknown>)?.data) {
      return (data as Record<string, unknown>).data as TripayTransaction;
    }

    return data as unknown as TripayTransaction;
  }

  verifyCallbackSignature(params: {
    reference: string;
    merchantRef: string;
    status: string;
    totalAmount: number | string;
    signature: string | undefined | null;
  }): boolean {
    if (!params.signature || !PRIVATE_KEY) {
      return false;
    }

    const payload = `${params.reference}${params.merchantRef}${params.status}${params.totalAmount}`;
    const expectedSignature = crypto
      .createHmac("sha256", PRIVATE_KEY)
      .update(payload)
      .digest("hex");

    return expectedSignature === params.signature;
  }

  mapTripayStatus(status: string): "pending" | "paid" | "expired" | "failed" {
    const normalized = status?.toUpperCase();

    switch (normalized) {
      case "PAID":
        return "paid";
      case "EXPIRED":
        return "expired";
      case "FAILED":
        return "failed";
      case "UNPAID":
      default:
        return "pending";
    }
  }
}

export const tripayService = new TripayService();
