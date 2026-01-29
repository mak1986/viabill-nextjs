# ViaBill Checkout Demo - Next.js

A simple Next.js checkout demo for ViaBill payment processing.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create or update `.env.local` with your ViaBill credentials:

```env
NEXT_PUBLIC_API_KEY=your_api_key_here
VIABILL_SECRET_KEY=your_secret_key_here
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_ADDON_NAME=custom
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Environment Variables:**
- `NEXT_PUBLIC_API_KEY` - Your ViaBill API key
- `VIABILL_SECRET_KEY` - Your ViaBill secret key (never exposed to client)
- `NEXT_PUBLIC_TEST_MODE` - Set to `true` for testing, `false` for production
- `NEXT_PUBLIC_ADDON_NAME` - Your addon name (default: custom)
- `NEXT_PUBLIC_APP_URL` - Your application URL for callbacks

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app/page.tsx` - Home page
- `/app/checkout/page.tsx` - Checkout form
- `/app/checkout/success/page.tsx` - Payment success page
- `/app/checkout/cancel/page.tsx` - Payment cancelled page
- `/app/api/viabill/checkout-page/route.ts` - Checkout API (generates signature)
- `/app/api/viabill/callback/route.ts` - Handle payment notifications
- `/lib/viabill.ts` - ViaBill utilities and helpers

## Workflow

1. User fills out checkout form with amount and order number
2. Form submits to backend API (`/api/viabill/checkout-page`)
3. Backend calculates SHA256 signature and returns checkout data
4. Client auto-submits hidden form to ViaBill with all required fields
5. User redirected to ViaBill hosted checkout page
6. After payment, user redirected to success or cancel page

## Callback / Webhook

- **Endpoint:** `POST /api/viabill/callback`
- **Purpose:** Receive server-to-server notifications from ViaBill about payment status changes.
- **Callback URL:** Configure ViaBill to call `{NEXT_PUBLIC_APP_URL}/api/viabill/callback` (set `NEXT_PUBLIC_APP_URL` in `.env.local`).

### Expected Payload

JSON body with at least the following fields:

- `transaction` - ViaBill transaction id
- `orderNumber` - Your order identifier
- `amount` - Amount as sent in checkout
- `currency` - Currency code (e.g., `DKK`)
- `status` - Payment status (e.g., `APPROVED`, `REJECTED`, `CANCELLED`)
- `time` - Timestamp string sent by ViaBill
- `signature` - SHA256 signature to validate the payload

### Signature Validation

The server recomputes the signature using the secret key (`VIABILL_SECRET_KEY`) and the fields in this order:

```
signature = SHA256(transaction + '#' + order_number + '#' + amount + '#' + currency + '#' + status + '#' + time + '#' + VIABILL_SECRET_KEY)
```

Compare the computed hex digest with the incoming `signature` field. If they match, accept and process the callback; otherwise return `401 Unauthorized`.

### Example (Node) - compute signature

```js
const crypto = require('crypto');
const sig = crypto
	.createHash('sha256')
	.update(`${transaction}#${order_number}#${amount}#${currency}#${status}#${time}#${process.env.VIABILL_SECRET_KEY}`)
	.digest('hex');
```

### Example (curl) - test webhook

Replace `<SIGNATURE>` with the computed hex signature shown above.

```bash
APP_URL=http://localhost:3000
curl -X POST "$APP_URL/api/viabill/callback" \
	-H "Content-Type: application/json" \
	-d '{"transaction":"TX123","orderNumber":"ORD-123","amount":"100.00","currency":"DKK","status":"APPROVED","time":"1769611232126","signature":"<SIGNATURE>"}'
```

### Recommended Actions

- Verify the signature before updating order state in your database.
- Respond with HTTP 200 on success, 401 on signature mismatch, and 400 on malformed payload.
- Implement idempotency for callbacks to safely handle retries from ViaBill.



## Project Structure

```
viabill-nextjs/
├── app/
│   ├── api/viabill/
│   │   ├── checkout/route.ts     # Initiate checkout
│   │   ├── callback/route.ts     # Handle payment notifications
│   ├── checkout/
│   │   ├── page.tsx              # Checkout form
│   │   ├── success/page.tsx      # Payment success page
│   │   └── cancel/page.tsx       # Payment cancellation page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page with quick start guide
│   └── globals.css               # Global styles
├── lib/
│   ├── viabill.ts                # Utility classes (OutgoingRequests, Helper)
├── .env.local                    # Environment configuration
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Development

### Build for Production

```bash
npm run build
npm run start
```

### Linting and Type Checking

```bash
npm run lint
```

## Key Files

### `lib/viabill.ts`
Utility classes for ViaBill integration:
- **ViaBillOutgoingRequests**: Handles API calls with HMAC-SHA256 signature
- **ViaBillHelper**: Configuration management and helper methods

### `app/api/viabill/*/route.ts`
API route handlers for each ViaBill operation with proper error handling and validation.

## Using Cloudflare as a Tunnel

You can use Cloudflare as a tunnel to securely expose your local development environment to the internet. This is especially useful for testing webhooks and APIs.

### Steps to Set Up Cloudflare Tunnel

1. **Install Cloudflare Tunnel:**: Make sure you have the cloudflared command-line tool installed. You can download it from [Cloudflare's official downloads page](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation).

2. **Run the Tunnel:** To start the tunnel, run the following command:

   ```cloudflared tunnel --url http://localhost:3000```

Now you can access your application through the provided Cloudflare URL.

## Security Considerations

1. **Secret Key Protection**: The `VIABILL_SECRET_KEY` is only accessible on the server-side (not exposed to the browser)
2. **Signature Validation**: All incoming webhooks are validated using HMAC-SHA256
3. **HTTPS Required**: Always use HTTPS in production
4. **Environment Variables**: Never commit `.env.local` to version control

## Support

For issues or questions about ViaBill integration, contact: teknik@viabill.com

