# Mevamahal — Premium Dry Fruits E-commerce

Full-stack e-commerce site: React (JS/JSX, Vite) + Express + PostgreSQL, JWT auth with Google OAuth.

## What's included

**Customer side:** home, shop (search + filter + sort + pagination), product detail with reviews,
cart, wishlist, checkout, account dashboard (profile / orders / address), email+password login,
Google "Continue with" login.

**Admin dashboard** (`/admin`, only visible to `role = admin` users):
revenue/orders/customers/products stats, 14-day sales chart, low-stock alerts, recent orders,
full product CRUD, order status management, customer list with role management.

## 1. Database setup

Install PostgreSQL locally (or use a hosted one — Railway, Neon, Supabase all work fine), create a database:

```bash
createdb mevamahal
```

## 2. Backend

```bash
cd backend
npm install
Copy-Item .env.example .env     # fill in DATABASE_URL, JWT_SECRET, Google OAuth keys
npm run db:init          # creates all tables + seed categories
npm run dev              # starts on http://localhost:5000
```

### Google OAuth setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (Web application).
3. Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Copy Client ID / Secret into `backend/.env`.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5173
```

Vite proxies `/api` requests to the backend, so the two run side by side with no CORS pain in dev.

## Local PostgreSQL configuration

The API must be running separately from Vite. Create `backend/.env` from the example and set the password for the local `postgres` user. The supplied connection identifies the local database as `meva-mahal`:

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@127.0.0.1:5432/meva-mahal
```

Then run `npm run db:init`, `npm run dev:api`, and `npm run dev:web` from the project root (the latter two in separate terminals). Vite now proxies to `127.0.0.1:5000`, avoiding Windows resolving `localhost` to IPv6 (`::1`).

## 4. Make yourself an admin

After registering an account through the site, run this once in `psql`:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

Then visit `http://localhost:5173/admin`.

## Notes / what to extend next

- Payments: checkout currently only supports Cash on Delivery. To add Razorpay/Stripe, hook into
  the `payment_method` field in `orders` and create a payment route.
- Image uploads: products currently take an `image_url` (paste any hosted image link). Multer is
  already in `package.json` if you want local file uploads.
- Product images use placeholders where none is set — swap in real product photography for launch.
- The "Journal" and "About" nav links are placeholders — add pages under `frontend/src/pages/` when ready.
