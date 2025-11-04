/**
 * Fonnte WhatsApp API Service
 * https://fonnte.com
 */

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const FONNTE_API_URL = "https://api.fonnte.com/send";

if (!FONNTE_TOKEN) {
  console.warn("FONNTE_TOKEN not configured. WhatsApp notifications will be disabled.");
}

export interface WhatsAppMessageParams {
  to: string; // Phone number with country code (e.g., "6281234567890")
  message: string;
}

export interface ManualPaymentInvoiceParams {
  customerName: string;
  customerPhone: string;
  photoName: string;
  amount: number;
  paymentMethod: string;
  accountNumber: string;
  accountName: string;
  transactionId: string;
  expiresAt: Date;
}

export interface AutomaticPaymentInvoiceParams {
  customerName: string;
  customerPhone: string;
  photoName: string;
  amount: number;
  paymentMethod: string;
  checkoutUrl: string;
  transactionId: string;
  expiresAt: Date;
}

export interface PaymentSuccessParams {
  customerName: string;
  customerPhone: string;
  photoName: string;
  amount: number;
  transactionId: string;
  downloadUrl: string;
}

class FonnteService {
  private async sendMessage(params: WhatsAppMessageParams): Promise<boolean> {
    if (!FONNTE_TOKEN) {
      console.warn("Fonnte token not configured, skipping WhatsApp notification");
      return false;
    }

    try {
      const response = await fetch(FONNTE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: FONNTE_TOKEN,
        },
        body: JSON.stringify({
          target: params.to,
          message: params.message,
          countryCode: "62", // Indonesia
        }),
      });

      const result = await response.json();

      if (response.ok && result.status) {
        console.log(`[Fonnte] Message sent successfully to ${params.to}`);
        return true;
      } else {
        console.error(`[Fonnte] Failed to send message:`, result);
        return false;
      }
    } catch (error) {
      console.error("[Fonnte] Error sending message:", error);
      return false;
    }
  }

  /**
   * Send manual payment invoice notification
   */
  async sendManualPaymentInvoice(params: ManualPaymentInvoiceParams): Promise<boolean> {
    const expiryTime = params.expiresAt.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    });

    const message = `
🔔 *INVOICE - MANUAL PAYMENT*

Hai *${params.customerName}*! 👋

Terima kasih telah melakukan pemesanan foto di *SoraRoid Photo*.

📸 *Detail Pesanan:*
• Foto: ${params.photoName}
• Total: *Rp ${params.amount.toLocaleString("id-ID")}*
• ID Transaksi: ${params.transactionId}

💳 *Metode Pembayaran:*
${params.paymentMethod}

📋 *Transfer ke:*
• Nomor: *${params.accountNumber}*
• Atas Nama: *${params.accountName}*

⏰ *Batas Pembayaran:*
${expiryTime} WIB

⚠️ *PENTING:*
1. Transfer sesuai nominal yang tertera
2. Simpan bukti transfer
3. Kirim bukti pembayaran ke admin
4. Pesanan akan diproses setelah pembayaran dikonfirmasi

📱 *Status Pesanan:* PENDING
Mohon segera lakukan pembayaran sebelum batas waktu berakhir.

Terima kasih! 🙏
*SoraRoid Photo Team*
    `.trim();

    return this.sendMessage({
      to: params.customerPhone,
      message,
    });
  }

  /**
   * Send automatic payment invoice notification
   */
  async sendAutomaticPaymentInvoice(params: AutomaticPaymentInvoiceParams): Promise<boolean> {
    const expiryTime = params.expiresAt.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    });

    const message = `
🔔 *INVOICE - AUTOMATIC PAYMENT*

Hai *${params.customerName}*! 👋

Terima kasih telah melakukan pemesanan foto di *SoraRoid Photo*.

📸 *Detail Pesanan:*
• Foto: ${params.photoName}
• Total: *Rp ${params.amount.toLocaleString("id-ID")}*
• Metode: ${params.paymentMethod}
• ID Transaksi: ${params.transactionId}

💳 *Link Pembayaran:*
${params.checkoutUrl}

⏰ *Batas Pembayaran:*
${expiryTime} WIB

✅ Klik link di atas untuk melanjutkan pembayaran
✅ Setelah berhasil, foto akan otomatis tersedia untuk diunduh

📱 *Status Pesanan:* PENDING

Terima kasih! 🙏
*SoraRoid Photo Team*
    `.trim();

    return this.sendMessage({
      to: params.customerPhone,
      message,
    });
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccess(params: PaymentSuccessParams): Promise<boolean> {
    const message = `
✅ *PEMBAYARAN BERHASIL*

Hai *${params.customerName}*! 🎉

Pembayaran Anda telah dikonfirmasi!

📸 *Detail Pesanan:*
• Foto: ${params.photoName}
• Total: *Rp ${params.amount.toLocaleString("id-ID")}*
• ID Transaksi: ${params.transactionId}

📥 *Unduh Foto Anda:*
Foto berkualitas HD tanpa watermark sudah tersedia!
Silakan login dan kunjungi halaman Gallery Anda.

${params.downloadUrl}

✨ Terima kasih telah berbelanja di SoraRoid Photo!

Ada pertanyaan? Hubungi admin kami.

Salam hangat,
*SoraRoid Photo Team* 📷
    `.trim();

    return this.sendMessage({
      to: params.customerPhone,
      message,
    });
  }

  /**
   * Send payment approved notification (for manual payments)
   */
  async sendPaymentApproved(params: PaymentSuccessParams): Promise<boolean> {
    const message = `
✅ *PEMBAYARAN DISETUJUI*

Hai *${params.customerName}*! 🎉

Pembayaran manual Anda telah diverifikasi dan disetujui oleh admin!

📸 *Detail Pesanan:*
• Foto: ${params.photoName}
• Total: *Rp ${params.amount.toLocaleString("id-ID")}*
• ID Transaksi: ${params.transactionId}

📥 *Unduh Foto Anda:*
Foto berkualitas HD tanpa watermark sudah tersedia!
Silakan login dan kunjungi halaman Gallery Anda.

${params.downloadUrl}

✨ Terima kasih atas kesabaran Anda!

Salam hangat,
*SoraRoid Photo Team* 📷
    `.trim();

    return this.sendMessage({
      to: params.customerPhone,
      message,
    });
  }

  /**
   * Format phone number for WhatsApp
   * Remove leading 0 and add country code if needed
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, "");

    // If starts with 0, remove it
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }

    // If doesn't start with 62, add it
    if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned;
    }

    return cleaned;
  }
}

export const fonnteService = new FonnteService();
