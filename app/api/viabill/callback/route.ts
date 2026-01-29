import { NextRequest, NextResponse } from 'next/server';
import { ViaBillHelper } from '@/lib/viabill';
import CryptoJS from 'crypto-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction, orderNumber, amount, currency, status, time, signature } = body;

    console.log('Full webhook body:', body);

    // Validate required fields
    if (!transaction || !orderNumber || !amount || !currency || !status || !time || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate signature
    // Format: sha256(transaction # order_number # amount # currency # status # time # secret)
    const secretKey = ViaBillHelper.getSecretKey();
    const signatureString = `${transaction}#${orderNumber}#${amount}#${currency}#${status}#${time}#${secretKey}`;
    const calculatedSignature = CryptoJS.SHA256(signatureString).toString();

    if (calculatedSignature !== signature) {
      console.error('Signature validation failed', {
        expected: calculatedSignature,
        received: signature,
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Process payment status
    console.log('Payment status:', status);

    // TODO: Update order status in database
    // TODO: Send confirmation email
    // TODO: Log transaction

    switch (status) {
      case 'APPROVED':
        console.log(`Payment approved for order ${orderNumber}`);
        break;
      case 'REJECTED':
        console.log(`Payment rejected for order ${orderNumber}`);
        break;
      case 'CANCELLED':
        console.log(`Payment cancelled for order ${orderNumber}`);
        break;
      default:
        console.log(`Unknown status: ${status}`);
    }

    return NextResponse.json(
      { status: 'success', message: 'Webhook processed' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
