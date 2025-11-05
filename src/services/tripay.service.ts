import crypto from "crypto";

const API_KEY = process.env.TRIPAY_API_KEY;
const PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY;
const MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE;
const MODE = process.env.TRIPAY_MODE ?? "production"; // Default to production

if (!API_KEY || !PRIVATE_KEY || !MERCHANT_CODE) {
  console.warn(
    "⚠️  Tripay environment variables are not fully set. Please check TRIPAY_API_KEY, TRIPAY_PRIVATE_KEY, and TRIPAY_MERCHANT_CODE in admin settings."
  );
}

// Tripay mode detection:
// - T46723 is a PRODUCTION merchant code (not sandbox)
// - Set MODE to "production" to use production API
// - Sandbox codes start with "T" but are different (e.g., from simulator)
const BASE_URL =
  MODE === "sandbox"
    ? "https://tripay.co.id/api-sandbox"
    : "https://tripay.co.id/api";

console.log(`[Tripay] Using ${MODE.toUpperCase()} mode with merchant code: ${MERCHANT_CODE}`);
console.log(`[Tripay] API URL: ${BASE_URL}`);

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
    // Validate credentials before making request
    if (!API_KEY || !PRIVATE_KEY || !MERCHANT_CODE) {
      throw new Error("Tripay credentials not configured. Please set TRIPAY_API_KEY, TRIPAY_PRIVATE_KEY, and TRIPAY_MERCHANT_CODE in .env.local and restart server.");
    }

    const url = `${BASE_URL}${path}`;
    console.log(`[Tripay] Making request to: ${url}`);

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store", // Force no cache
      next: { revalidate: 0 },
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("[Tripay] Non-JSON response:", text.substring(0, 200));
      throw new Error(`Tripay API returned non-JSON response (likely HTML error page). Status: ${response.status}. Check your API credentials.`);
    }

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
      
      // If Cloudflare blocks the request (403), return mock data for development
      if (
        error instanceof Error &&
        /cloudflare/i.test(error.message)
      ) {
        console.warn("[Tripay] Using mock payment channels due to Cloudflare block");
        return this.getMockPaymentChannels();
      }
      
      throw error;
    }
  }

  private getMockPaymentChannels(): TripayChannel[] {
    console.warn("⚠️ [Tripay] Using MOCK payment channels - Cloudflare is blocking production API");
    console.warn("⚠️ [Tripay] Please contact Tripay support to whitelist your server IP");
    
    return [
      {
        group: "Virtual Account",
        code: "BRIVA",
        name: "BRI Virtual Account",
        type: "virtual_account",
        fee_merchant: 0,
        fee_customer: 2500,
        minimum_amount: 10000,
        maximum_amount: 1000000000,
      },
      {
        group: "Virtual Account",
        code: "BNIVA",
        name: "BNI Virtual Account",
        type: "virtual_account",
        fee_merchant: 0,
        fee_customer: 4000,
        minimum_amount: 10000,
        maximum_amount: 1000000000,
      },
      {
        group: "Virtual Account",
        code: "MANDIRIVA",
        name: "Mandiri Virtual Account",
        type: "virtual_account",
        fee_merchant: 0,
        fee_customer: 4000,
        minimum_amount: 10000,
        maximum_amount: 1000000000,
      },
      {
        group: "E-Wallet",
        code: "QRIS",
        name: "QRIS (All E-Wallet)",
        type: "qris",
        fee_merchant: 0,
        fee_customer: 0, // 0.7% calculated dynamically
        minimum_amount: 1500,
        maximum_amount: 10000000,
      },
      {
        group: "Convenience Store",
        code: "ALFAMART",
        name: "Alfamart",
        type: "convenience_store",
        fee_merchant: 0,
        fee_customer: 3500,
        minimum_amount: 10000,
        maximum_amount: 5000000,
      },
      {
        group: "Convenience Store",
        code: "INDOMARET",
        name: "Indomaret",
        type: "convenience_store",
        fee_merchant: 0,
        fee_customer: 3500,
        minimum_amount: 10000,
        maximum_amount: 5000000,
      },
    ];
  }

  async createTransaction(params: CreateTripayTransactionParams): Promise<TripayTransaction> {
    if (!MERCHANT_CODE || !PRIVATE_KEY) {
      throw new Error("Tripay credential is not configured");
    }

    const signaturePayload = `${MERCHANT_CODE}${params.merchantRef}${params.amount}`;
    const signature = crypto
      .createHmac("sha256", PRIVATE_KEY)
      .update(signaturePayload)
      .digest("hex");

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

  async getTransactionDetailByMerchantRef(merchantRef: string): Promise<TripayTransaction> {
    const data = await this.request<{ data: TripayTransaction }>(
      `/transaction/detail?merchant_ref=${merchantRef}`
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
