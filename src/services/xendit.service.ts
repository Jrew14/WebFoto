/**
 * Xendit Payment Service
 * 
 * Handles payment operations using Xendit API
 */

import Xendit from 'xendit-node';

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

export interface CreateInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    url?: string;
  }>;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

export interface Invoice {
  id: string;
  external_id: string;
  status: string;
  amount: number;
  invoice_url: string;
  expiry_date: string;
  payment_method?: string;
  paid_at?: string;
}

export class XenditService {
  /**
   * Create payment invoice
   */
  async createInvoice(params: CreateInvoiceParams): Promise<Invoice> {
    try {
      const { Invoice } = xenditClient;
      
      const invoice = await Invoice.createInvoice({
        externalID: params.externalId,
        amount: params.amount,
        payerEmail: params.payerEmail,
        description: params.description,
        invoiceDuration: 86400, // 24 hours
        currency: 'IDR',
        items: params.items,
        successRedirectURL: params.successRedirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failureRedirectURL: params.failureRedirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
        shouldSendEmail: true,
        locale: 'id',
        fees: [{
          type: 'Admin Fee',
          value: 0, // No additional fee
        }],
      });

      return {
        id: invoice.id,
        external_id: invoice.external_id,
        status: invoice.status,
        amount: invoice.amount,
        invoice_url: invoice.invoice_url,
        expiry_date: invoice.expiry_date,
        payment_method: invoice.payment_method,
        paid_at: invoice.paid_at,
      };
    } catch (error) {
      console.error('Xendit create invoice error:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const { Invoice } = xenditClient;
      
      const invoice = await Invoice.getInvoice({
        invoiceID: invoiceId,
      });

      return {
        id: invoice.id,
        external_id: invoice.external_id,
        status: invoice.status,
        amount: invoice.amount,
        invoice_url: invoice.invoice_url,
        expiry_date: invoice.expiry_date,
        payment_method: invoice.payment_method,
        paid_at: invoice.paid_at,
      };
    } catch (error) {
      console.error('Xendit get invoice error:', error);
      throw error;
    }
  }

  /**
   * Get invoice by external ID
   */
  async getInvoiceByExternalId(externalId: string): Promise<Invoice[]> {
    try {
      const { Invoice } = xenditClient;
      
      const invoices = await Invoice.getAllInvoices({
        externalID: externalId,
      });

      return invoices.map(invoice => ({
        id: invoice.id,
        external_id: invoice.external_id,
        status: invoice.status,
        amount: invoice.amount,
        invoice_url: invoice.invoice_url,
        expiry_date: invoice.expiry_date,
        payment_method: invoice.payment_method,
        paid_at: invoice.paid_at,
      }));
    } catch (error) {
      console.error('Xendit get invoice by external ID error:', error);
      throw error;
    }
  }

  /**
   * Expire an invoice
   */
  async expireInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const { Invoice } = xenditClient;
      
      const invoice = await Invoice.expireInvoice({
        invoiceID: invoiceId,
      });

      return {
        id: invoice.id,
        external_id: invoice.external_id,
        status: invoice.status,
        amount: invoice.amount,
        invoice_url: invoice.invoice_url,
        expiry_date: invoice.expiry_date,
        payment_method: invoice.payment_method,
        paid_at: invoice.paid_at,
      };
    } catch (error) {
      console.error('Xendit expire invoice error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook callback signature
   */
  verifyWebhookSignature(
    webhookToken: string,
    requestToken: string
  ): boolean {
    return webhookToken === requestToken;
  }
}

export const xenditService = new XenditService();
