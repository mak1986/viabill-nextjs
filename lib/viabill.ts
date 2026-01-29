import CryptoJS from 'crypto-js';
import axios, { AxiosRequestConfig } from 'axios';

const TEST_BASE_URL = 'https://secure-test.viabill.com';
const PROD_BASE_URL = 'https://secure.viabill.com';
const SECRET_KEY = process.env.VIABILL_SECRET_KEY;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export interface CheckoutData {
  protocol: string;
  apikey: string;
  transaction: string;
  order_number: string;
  amount: string | number;
  currency: string;
  sha256check: string;
  success_url: string;
  cancel_url: string;
  callback_url: string;
  test?: boolean;
  customParams?: Record<string, any>;
}

interface RequestResponse {
  status: number;
  data: any;
  headers?: Record<string, any>;
  error?: string;
}

export class ViaBillOutgoingRequests {
  static async request(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data: Record<string, any> = {},
    testMode: boolean = true,
    addonName: string = 'default',
    extraHeaders: Record<string, string> = {}
  ): Promise<RequestResponse> {
    try {
      if (!SECRET_KEY) {
        console.error('VIABILL_SECRET_KEY is not configured in environment');
        return {
          status: 500,
          data: null,
          error: 'VIABILL_SECRET_KEY not configured',
        };
      }
      if (!API_KEY) {
        console.error('NEXT_PUBLIC_API_KEY is not configured in environment');
        return {
          status: 500,
          data: null,
          error: 'NEXT_PUBLIC_API_KEY not configured',
        };
      }

      const baseUrl = testMode ? TEST_BASE_URL : PROD_BASE_URL;
      // ViaBill API endpoint: /api/checkout-authorize/addon/{addon_name}
      const requestUrl = `${baseUrl}/api/checkout-authorize/addon/${addonName}`;

      // Generate HMAC-SHA256 signature of the request body
      const requestBody = JSON.stringify(data);
      const signature = CryptoJS.HmacSHA256(requestBody, SECRET_KEY).toString();

      const headers: AxiosRequestConfig['headers'] = {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'X-ViaBill-Signature': signature,
        ...extraHeaders,
      };

      console.log(`Making ${method} request to: ${requestUrl}`);
      console.log('Request payload:', { ...data, apikey: '***' });
      console.log('Signature (first 20 chars):', signature.substring(0, 20));

      let response;

      if (method === 'GET') {
        response = await axios.get(requestUrl, {
          headers,
          params: data,
          timeout: 30000,
        });
      } else {
        response = await axios.post(requestUrl, data, {
          headers,
          timeout: 30000,
        });
      }

      console.log(`ViaBill API responded with status: ${response.status}`);

      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
      };
    } catch (error: any) {
      console.error(`ViaBill API error:`, {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        responseData: JSON.stringify(error.response?.data),
      });
      return {
        status: error.response?.status || 500,
        data: error.response?.data || null,
        error: error.message,
      };
    }
  }
}

export class ViaBillHelper {
  static getTestMode(): boolean {
    return process.env.NEXT_PUBLIC_TEST_MODE === 'true';
  }

  static getAPIKey(): string {
    return API_KEY || '';
  }

  static getSecretKey(): string {
    return SECRET_KEY || '';
  }

  static getAppUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  static getSuccessUrl(orderId: string): string {
    return `${this.getAppUrl()}/checkout/success?orderId=${orderId}`;
  }

  static getCancelUrl(orderId: string): string {
    return `${this.getAppUrl()}/checkout/cancel?orderId=${orderId}`;
  }

  static getCallbackUrl(): string {
    return `${this.getAppUrl()}/api/viabill/callback`;
  }

  static validateSignature(body: string, signature: string): boolean {
    const expectedSignature = CryptoJS.HmacSHA256(body, SECRET_KEY!).toString();
    return expectedSignature === signature;
  }

  static generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
