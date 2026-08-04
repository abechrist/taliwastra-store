import { NextRequest, NextResponse } from 'next/server';
import { updateOrderFromWebhook } from '@/lib/db/repositories/orders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, transaction_id } = body;

    let status: string;
    let paymentStatus: string;

    switch (transaction_status) {
      case 'capture':
      case 'settlement':
        status = 'processing';
        paymentStatus = 'paid';
        break;
      case 'pending':
        status = 'pending';
        paymentStatus = 'pending';
        break;
      case 'deny':
      case 'expire':
      case 'cancel':
        status = 'cancelled';
        paymentStatus = 'failed';
        break;
      default:
        status = 'pending';
        paymentStatus = 'pending';
    }

    await updateOrderFromWebhook(order_id, {
      status,
      paymentStatus,
      transactionId: transaction_id || null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('midtransWebhook error:', err);
    return NextResponse.json({ success: false, message: 'Webhook error' }, { status: 500 });
  }
}
