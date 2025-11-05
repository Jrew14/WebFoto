import { db } from "@/db";
import { purchaseLogs } from "@/db/schema";

interface LogPayload {
  purchaseId?: string | null;
  action: string;
  note?: string | null;
}

class PurchaseLogService {
  async log({ purchaseId, action, note }: LogPayload) {
    try {
      await db.insert(purchaseLogs).values({
        purchaseId: purchaseId ?? null,
        action,
        note: note ?? null,
      });
    } catch (error) {
      console.error("[PurchaseLogService] Failed to record log:", error, {
        purchaseId,
        action,
      });
    }
  }
}

export const purchaseLogService = new PurchaseLogService();
