import { db } from "@/db";
import { manualPaymentMethods, type ManualPaymentMethod, type NewManualPaymentMethod } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

class ManualPaymentMethodService {
  /**
   * Get all payment methods (admin view)
   */
  async getAllPaymentMethods(): Promise<ManualPaymentMethod[]> {
    try {
      const methods = await db
        .select()
        .from(manualPaymentMethods)
        .orderBy(desc(manualPaymentMethods.sortOrder));

      return methods;
    } catch (error) {
      console.error("Error fetching all payment methods:", error);
      throw error;
    }
  }

  /**
   * Get active payment methods only (public view)
   */
  async getActivePaymentMethods(): Promise<ManualPaymentMethod[]> {
    try {
      const methods = await db
        .select()
        .from(manualPaymentMethods)
        .where(eq(manualPaymentMethods.isActive, true))
        .orderBy(desc(manualPaymentMethods.sortOrder));

      return methods;
    } catch (error) {
      console.error("Error fetching active payment methods:", error);
      throw error;
    }
  }

  /**
   * Get payment method by ID
   */
  async getPaymentMethodById(id: string): Promise<ManualPaymentMethod | null> {
    try {
      const [method] = await db
        .select()
        .from(manualPaymentMethods)
        .where(eq(manualPaymentMethods.id, id))
        .limit(1);

      return method || null;
    } catch (error) {
      console.error("Error fetching payment method:", error);
      throw error;
    }
  }

  /**
   * Create new payment method
   */
  async createPaymentMethod(data: NewManualPaymentMethod): Promise<ManualPaymentMethod> {
    try {
      const [method] = await db
        .insert(manualPaymentMethods)
        .values(data)
        .returning();

      return method;
    } catch (error) {
      console.error("Error creating payment method:", error);
      throw error;
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    id: string,
    data: Partial<NewManualPaymentMethod>
  ): Promise<ManualPaymentMethod> {
    try {
      const [method] = await db
        .update(manualPaymentMethods)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(manualPaymentMethods.id, id))
        .returning();

      if (!method) {
        throw new Error("Payment method not found");
      }

      return method;
    } catch (error) {
      console.error("Error updating payment method:", error);
      throw error;
    }
  }

  /**
   * Toggle payment method active status
   */
  async togglePaymentMethodStatus(id: string): Promise<ManualPaymentMethod> {
    try {
      const method = await this.getPaymentMethodById(id);
      if (!method) {
        throw new Error("Payment method not found");
      }

      const [updated] = await db
        .update(manualPaymentMethods)
        .set({
          isActive: !method.isActive,
          updatedAt: new Date(),
        })
        .where(eq(manualPaymentMethods.id, id))
        .returning();

      return updated;
    } catch (error) {
      console.error("Error toggling payment method status:", error);
      throw error;
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(id: string): Promise<void> {
    try {
      await db
        .delete(manualPaymentMethods)
        .where(eq(manualPaymentMethods.id, id));
    } catch (error) {
      console.error("Error deleting payment method:", error);
      throw error;
    }
  }

  /**
   * Calculate total fee for amount
   */
  calculateFee(method: ManualPaymentMethod, amount: number): number {
    const fixedFee = method.fee || 0;
    const percentageFee = Math.floor((amount * (method.feePercentage || 0)) / 10000);
    return fixedFee + percentageFee;
  }

  /**
   * Calculate total amount with fee
   */
  calculateTotalAmount(method: ManualPaymentMethod, amount: number): number {
    return amount + this.calculateFee(method, amount);
  }

  /**
   * Validate amount against method limits
   */
  validateAmount(method: ManualPaymentMethod, amount: number): { valid: boolean; message?: string } {
    if (amount < method.minAmount) {
      return {
        valid: false,
        message: `Minimum amount is Rp ${method.minAmount.toLocaleString('id-ID')}`,
      };
    }

    if (amount > method.maxAmount) {
      return {
        valid: false,
        message: `Maximum amount is Rp ${method.maxAmount.toLocaleString('id-ID')}`,
      };
    }

    return { valid: true };
  }
}

export const manualPaymentMethodService = new ManualPaymentMethodService();
