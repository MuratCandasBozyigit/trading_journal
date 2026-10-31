# Ledgerly

## Project layout

- `index.html`: public home page
- `pages/pricing.html`: plans, market roadmap, and coffee support
- `pages/admin.html`: server-authenticated plan administration
- `pages/legal.html`: privacy, terms, and payment notes (review before launch)
- `assets/css/`: public and admin styles
- `assets/js/`: public and admin browser code
- `assets/fonts/`: locally served DM Sans and Manrope fonts with OFL licenses
- `backend/server.mjs`: dependency-free Node HTTP server and API
- `backend/data/`: server-side plan and payment-order JSON data; never served publicly

## Run locally

Requires Node.js 20.6 or newer. Copy `.env.example` to `.env`, then set a unique admin username and a long random admin password. Keep `.env` private; it is ignored by Git and blocked by the static server.

```sh
cp .env.example .env
npm start
```

Open `http://localhost:3000`. If `.env` values are blank, admin login and PayTR checkout intentionally remain unavailable.

Generate the private-data encryption key with `openssl rand -base64 32` and put it in `APP_ENCRYPTION_KEY`. Back this key up separately and securely. Losing it makes encrypted private user records unreadable. User passwords are stored as scrypt hashes; profiles and trade ledgers are encrypted with per-user AES-256-GCM data keys, themselves wrapped by the app key. User sessions are server-side and use HttpOnly/SameSite cookies plus CSRF tokens for mutations.

Accounts can export all or selected trades from the personal dashboard as UTF-8 CSV or JSON. Export files are plaintext, so store them securely.

## PayTR setup

1. Fill `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, and `PAYTR_MERCHANT_SALT` in `.env` using the merchant panel values. Keep `PAYTR_TEST_MODE=1` while testing.
2. Deploy behind HTTPS and set `APP_BASE_URL` to the public HTTPS origin.
3. Set the PayTR merchant panel notification URL to `https://YOUR_DOMAIN/api/payments/paytr/notify`.
4. Test a payment and confirm the callback marks the order paid before switching test mode off.

The server creates PayTR iFrame tokens and validates callback hashes. Browser code never sees merchant secrets. A customer redirect alone is not treated as proof of payment. Donation amounts include 25, 50, 100, 200, 500 TRY and a custom integer amount from 25 to 50,000 TRY. This demo stores plans, payment orders, and encrypted user records as files under `backend/data`; use a transactional database and durable session store before running multiple server instances or production traffic.

## Legal content

`pages/legal.html` is a starter notice, not legal advice. Replace the business identity, contact, data retention, KVKK/privacy disclosures, billing and refund terms with reviewed, accurate information before public launch. The BytewaveStudio link points to `https://bytewavestudio.com`.
