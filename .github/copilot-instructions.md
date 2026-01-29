# ViaBill Next.js - AI Coding Instructions

## Project Overview
A full-stack Next.js TypeScript implementation of the ViaBill payment processing library with API routes, webhook handling, and a responsive UI. This replaces the PHP library with a modern JavaScript/TypeScript stack.

**Key Dependencies**: Next.js 14+, TypeScript, Tailwind CSS, Axios, crypto-js, @heroicons/react

## Architecture Patterns

### Request/Response Model
- **ViaBillOutgoingRequests** (`lib/viabill.ts`): Static utility class handling all HTTP calls to ViaBill API v3.0 with HMAC-SHA256 signature authentication. Switches between test and production endpoints based on environment.
- **ViaBillClient** (`lib/ViabillClient.ts`): Facade class providing merchant API methods: `checkout()`, `capture()`, `refund()`, `cancel()`.
- **API Routes** (`app/api/viabill/*/route.ts`): Next.js API route handlers for each operation with error handling and validation.

### Configuration & Helper Pattern
- **Environment Variables** (`.env.local`): All configuration via env vars (API_KEY, SECRET_KEY, TEST_MODE, APP_URL)
- **ViaBillHelper** (`lib/viabill.ts`): Centralizes configuration loading, URL building (success_url, cancel_url, callback_url), and signature validation
- Server-side secret key never exposed to client (only NEXT_PUBLIC_* vars are public)

### Signature Authentication
All API requests include HMAC-SHA256 signature: `CryptoJS.HmacSHA256(requestBody, secretKey)` sent as `X-ViaBill-Signature` header. Incoming webhooks validate this header using `ViaBillHelper.validateSignature()`.

## Common Developer Workflows

### Setting Up
1. Install dependencies: `npm install` (includes axios, crypto-js, @heroicons/react)
2. Copy `.env.local` template and edit with ViaBill API credentials
3. Ensure `NEXT_PUBLIC_APP_URL` matches your deployment domain
4. Run `npm run dev` - server auto-serves at `http://localhost:3000`

### Payment Flow (Checkout → Redirect → Webhook)
```typescript
// 1. User submits checkout form (app/checkout/page.tsx)
const response = await fetch('/api/viabill/checkout', { 
  method: 'POST', 
  body: JSON.stringify({ amount, currency, orderNumber })
});

// 2. API initiates checkout with ViaBill
const viabill = new Viabill();
const result = await viabill.checkout(checkoutData);

// 3. Client redirects to ViaBill payment page
window.location.href = result.redirect_url;

// 4. After payment, ViaBill POSTs to /api/viabill/callback
// 5. Webhook validates signature and processes payment status
```

## Project-Specific Conventions

### File Structure
- **API Routes**: `app/api/viabill/{operation}/route.ts` for each ViaBill operation (checkout, capture, refund, cancel, callback)
- **Pages**: `app/checkout/`, `/success/`, `/cancel/` for payment flow UI
- **Utilities**: `lib/viabill.ts` (helpers & requests), `lib/ViabillClient.ts` (facade class)
- **Config**: `.env.local` for secrets and settings

### Response Format
- Success API response: `{ redirect_url, status, transaction_id }` or `{ status: 'success', data }`
- Error response: `{ error: string, status?: number }`
- Always check response status and error field before processing

### Error Handling Pattern
```typescript
try {
  const response = await viabill.checkout(data);
  if (response.error) {
    return NextResponse.json({ error: response.error }, { status: 400 });
  }
  return NextResponse.json({ status: 'success', ...response }, { status: 200 });
} catch (error: any) {
  console.error('Operation error:', error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

## Integration Points & External Dependencies

### ViaBill API Endpoints
- Test: `https://secure-test.viabill.com/api/v3/*` → Production: `https://secure.viabill.com/api/v3/*`
- Endpoints: `/checkout`, `/capture`, `/refund`, `/cancel`
- All requests require HMAC signature in `X-ViaBill-Signature` header

### Merchant Callback URLs
When creating checkout, provide three URLs:
- `success_url`: Browser redirect after successful payment (e.g., `/checkout/success?orderId=...`)
- `cancel_url`: Browser redirect if user cancels (e.g., `/checkout/cancel?orderId=...`)
- `callback_url`: Server webhook for status updates (e.g., `{APP_URL}/api/viabill/callback`)

### Axios Client Usage
Configured in `ViaBillOutgoingRequests.request()` with 30s timeout, custom headers, JSON encoding. Do not instantiate Axios elsewhere.

## When Modifying Code

- **Adding operations**: Follow pattern in `ViabillClient.checkout()` - call `ViaBillOutgoingRequests.request()`, validate response, handle errors
- **Adding API routes**: Mirror structure in `app/api/viabill/checkout/route.ts` - parse body, validate, call Viabill method, return JSON
- **Webhook updates**: Update `app/api/viabill/callback/route.ts` - validate signature, parse data, call TODO database/email logic
- **Configuration**: Add env var to `.env.local` and getter to `ViaBillHelper` class
- **UI changes**: Modify page components in `app/checkout/` and related pages

## TODO Markers

Search for `TODO:` comments in codebase (especially `callback/route.ts`) for integration points:
- Database updates for order status
- Email confirmations
- Payment status reporting
- Error notifications

## Security Considerations

1. **Server-side Secret**: `VIABILL_SECRET_KEY` never reaches client (not NEXT_PUBLIC)
2. **Signature Validation**: All callbacks must validate `X-ViaBill-Signature` header
3. **HTTPS Production**: Always use HTTPS in production (ViaBill requires it)
4. **Environment Isolation**: Never commit `.env.local` - use `.env.example` as template
