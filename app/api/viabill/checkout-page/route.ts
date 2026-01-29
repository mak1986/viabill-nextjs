import { NextRequest, NextResponse } from 'next/server';
import { CheckoutData, ViaBillHelper } from '@/lib/viabill';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'DKK', orderNumber } = body;

    if (!amount || !orderNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderNumber' },
        { status: 400 }
      );
    }

    const transactionId = ViaBillHelper.generateTransactionId();
    const apiKey = ViaBillHelper.getAPIKey();

    const checkoutData: CheckoutData = {
      protocol: '3.1',
      apikey: apiKey,
      transaction: transactionId,
      order_number: orderNumber,
      amount: amount.toString(),
      currency,
      sha256check: '', // Will be calculated below
      success_url: ViaBillHelper.getSuccessUrl(orderNumber),
      cancel_url: ViaBillHelper.getCancelUrl(orderNumber),
      callback_url: ViaBillHelper.getCallbackUrl(),
      test: ViaBillHelper.getTestMode(),
    };

    // The Viabill class calculates sha256check, so we need to do it here too
    const amountStr = typeof checkoutData.amount === 'string' ? checkoutData.amount : checkoutData.amount.toString();
    const secretKey = ViaBillHelper.getSecretKey();
    let signatureString = `${checkoutData.apikey}#${amountStr}#${checkoutData.currency}#${checkoutData.transaction}#${checkoutData.order_number}#${checkoutData.success_url}#${checkoutData.cancel_url}#${secretKey}`;

    if (checkoutData.test) {
      signatureString += '#true';
    }

    const CryptoJS = require('crypto-js');
    const sha256check = CryptoJS.SHA256(signatureString).toString();

    // Get the ViaBill endpoint from the helper
    const testMode = ViaBillHelper.getTestMode();
    const addonName = process.env.NEXT_PUBLIC_VIABILL_ADDON_NAME || 'CUSTOM';
    const baseUrl = testMode
      ? 'https://secure-test.viabill.com'
      : 'https://secure.viabill.com';
    const viabillCheckoutUrl = `${baseUrl}/api/checkout-authorize/addon/${addonName}`;

    // Return all fields needed for the client-side form
    return NextResponse.json(
      {
        viabillCheckoutUrl,
        formData: {
          protocol: checkoutData.protocol,
          apikey: checkoutData.apikey,
          transaction: checkoutData.transaction,
          order_number: checkoutData.order_number,
          amount: checkoutData.amount,
          currency: checkoutData.currency,
          sha256check,
          success_url: checkoutData.success_url,
          cancel_url: checkoutData.cancel_url,
          callback_url: checkoutData.callback_url,
          test: checkoutData.test,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Checkout signature generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
