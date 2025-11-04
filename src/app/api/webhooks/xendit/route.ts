import { NextResponse } from 'next/server';
import { paymentService } from '@/services/payment.service';
import { xenditService } from '@/services/xendit.service';

export async function POST(request: Request) {
  try {
    // Verify webhook token
    const webhookToken = request.headers.get('x-callback-token');
    
    if (!webhookToken || !xenditService.verifyWebhookSignature(
      process.env.XENDIT_WEBHOOK_TOKEN!,
      webhookToken
    )) {
      console.error('Invalid webhook token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get webhook payload
    const payload = await request.json();

    console.log('Xendit webhook received:', payload);

    // Handle invoice paid
    if (payload.status === 'PAID') {
      await paymentService.updatePurchaseStatus({
        xenditInvoiceId: payload.id,
        status: 'paid',
        paymentMethod: payload.payment_method,
        paidAt: new Date(payload.paid_at),
      });

      console.log(`Purchase paid: ${payload.id}`);
    }

    // Handle invoice expired
    if (payload.status === 'EXPIRED') {
      await paymentService.updatePurchaseStatus({
        xenditInvoiceId: payload.id,
        status: 'expired',
      });

      console.log(`Purchase expired: ${payload.id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Return 200 to acknowledge receipt even if processing fails
    // This prevents Xendit from retrying unnecessarily
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 200 }
    );
  }
}
