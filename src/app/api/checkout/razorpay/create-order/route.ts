import { NextRequest, NextResponse } from 'next/server';
import { razorpay_credentials, CreateOrderBody } from '@/app/checkout/payment/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderBody;
    const options = {
      amount: Math.round((body.amount ?? 0) * 100),
      currency: body.currency ?? 'INR',
      receipt: body.receipt,
      notes: body.notes,
    };

    const order = await (razorpay_credentials as any).orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
