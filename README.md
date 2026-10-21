# ⚡ PaymentCaptured — Webhook Processing Service

A production-ready full-stack service that receives payment transaction webhooks (like RazorPay), acknowledges them instantly, and processes them reliably in the background.

**Live Demo:** [Frontend](https://your-app.netlify.app) · [Backend API](https://your-app.onrender.com)

---

## 📸 Preview

```
Customer pays → RazorPay sends webhook → Our server replies 202 in <500ms
                                              ↓
                                    Background processes in 30s
                                              ↓
                                    Supabase DB updated (PROCESSED)
                                              ↓
                                    Frontend updates live via Realtime
```

---

## 🛠️ Tech Stack

| Layer                 | Technology                       |
| --------------------- | -------------------------------- |
| **Frontend**          | React 18, TypeScript, Vite, CSS  |
| **Backend**           | Node.js, Express, TypeScript     |
| **Database**          | Supabase (PostgreSQL + Realtime) |
| **Deploy (Frontend)** | Netlify                          |
| **Deploy (Backend)**  | Render                           |

---

## ✅ Features

- **POST /v1/webhooks/transactions** — Accepts payment webhooks, responds in < 500ms
- **Background Processing** — 30-second simulated processing (external API calls)
- **Idempotency** — Same `transaction_id` sent multiple times = only one record stored
- **GET /v1/transactions/:id** — Query transaction status anytime
- **GET /** — Health check endpoint
- **Live Dashboard** — React frontend with Supabase Realtime (no page refresh needed)
- **Error Handling** — Failed jobs marked as `FAILED` in DB, nothing is lost

---

## 📁 Project Structure

```
paymentCaptured/
├── backend/                        # Express + TypeScript API
│   ├── src/
│   │   ├── index.ts                # Server entry, middleware, routes
│   │   ├── config.ts               # Env vars validation
│   │   ├── supabaseClient.ts       # Supabase (service role key)
│   │   ├── routes/
│   │   │   ├── health.ts           # GET /
│   │   │   ├── webhooks.ts         # POST /v1/webhooks/transactions
│   │   │   └── transactions.ts     # GET /v1/transactions/:id
│   │   ├── services/
│   │   │   ├── transactionService.ts    # All DB operations
│   │   │   └── backgroundProcessor.ts  # 30s background job
│   │   └── middleware/
│   │       └── validateWebhook.ts  # Input validation
│   ├── Dockerfile
│   ├── render.yaml
│   └── .env.example
│
├── frontend/                       # React + TypeScript Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx          # API health indicator
│   │   │   ├── WebhookForm.tsx     # Send test webhooks
│   │   │   ├── TransactionTable.tsx # Live transactions table
│   │   │   ├── TransactionLookup.tsx# Query by ID
│   │   │   ├── StatusBadge.tsx     # PROCESSING / PROCESSED / FAILED
│   │   │   └── Toast.tsx           # Notifications
│   │   └── styles/
│   │       └── global.css          # Design tokens, layout
│   ├── netlify.toml
│   └── .env.example
│
└── supabase/
    └── migrations/
        ├── 001_create_transactions.sql   # Schema + RLS
        └── 002_seed_sample_data.sql      # Optional dev data
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- Supabase account (free)
- Git

### 1. Clone the repo

```bash
git clone https://github.com/your-username/paymentCaptured.git
cd paymentCaptured
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Open **SQL Editor** → paste and run `supabase/migrations/001_create_transactions.sql`
3. Go to **Settings → API** → copy your Project URL and keys

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
```

Fill in `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

```bash
npm install
npm run dev
```

✅ Backend running at `http://localhost:3001`

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Fill in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=
```

```bash
npm install
npm run dev
```

✅ Frontend running at `http://localhost:5173`

---

## 🧪 Testing the API

### Health Check

```bash
curl http://localhost:3001/
```

```json
{ "status": "HEALTHY", "current_time": "2024-01-15T10:30:00.000Z" }
```

### Send a Webhook

```bash
curl -X POST http://localhost:3001/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_test_001",
    "source_account": "acc_user_789",
    "destination_account": "acc_merchant_456",
    "amount": 1500,
    "currency": "INR"
  }'
```

```json
{
  "message": "Webhook received — transaction queued for processing",
  "transaction_id": "txn_test_001"
}
```

### Check Status (immediately → PROCESSING)

```bash
curl http://localhost:3001/v1/transactions/txn_test_001
```

### Check Status (after 30s → PROCESSED)

```bash
sleep 30 && curl http://localhost:3001/v1/transactions/txn_test_001
```

### Test Idempotency (send same ID 3 times)

```bash
for i in 1 2 3; do
  curl -s -X POST http://localhost:3001/v1/webhooks/transactions \
    -H "Content-Type: application/json" \
    -d '{"transaction_id":"txn_dupe","source_account":"acc_a","destination_account":"acc_b","amount":100,"currency":"INR"}'
  echo ""
done
# All 3 return 202 — but only ONE row in database
```

---

## 📊 Success Criteria

| Test                 | Expected Result                | How                                      |
| -------------------- | ------------------------------ | ---------------------------------------- |
| Send webhook         | 202 in < 500ms                 | Background job via `setTimeout`          |
| Check after 30s      | Status = PROCESSED             | Background processor updates DB          |
| Send duplicate ID    | Still 202, no duplicate row    | `PRIMARY KEY` + `ON CONFLICT DO NOTHING` |
| Frontend live update | Status changes without refresh | Supabase Realtime WebSocket              |

---

## ☁️ Deployment

### Backend → Render

1. Push to GitHub
2. New Web Service → connect repo → set root to `backend`
3. Build: `npm ci && npm run build` · Start: `npm start`
4. Add env vars in Render dashboard

### Frontend → Netlify

1. New Site → import from GitHub → set base to `frontend`
2. Build: `npm run build` · Publish: `dist`
3. Add env vars — set `VITE_API_BASE_URL` to your Render URL

### Connect Real RazorPay (Production)

1. Deploy backend to Render → get public URL
2. RazorPay Dashboard → Settings → Webhooks → Add URL:

```
https://your-backend.onrender.com/v1/webhooks/transactions
```

3. Select event: `payment.captured`
4. Done — RazorPay will POST to your server on every payment

---

## 💡 Technical Decisions

### Why 202 Accepted?

HTTP 202 means "I got it, I'll process it later." This lets us respond instantly and do the heavy work in background — RazorPay won't timeout or retry unnecessarily.

### Why `setTimeout` for background jobs?

Simple, zero-infrastructure cost — perfect for a free-tier deployment with a 30s window. In production, this would be replaced with **BullMQ + Redis** or **AWS SQS** for durability across server restarts.

### Why Supabase PRIMARY KEY for idempotency?

Enforcing uniqueness at the database level is safer than application code — it works even if two requests hit simultaneously (race condition). `ON CONFLICT DO NOTHING` makes it a silent, error-free operation.

### Why Supabase Realtime?

Instead of the frontend polling every few seconds, Supabase pushes DB changes via WebSocket. Status goes from PROCESSING → PROCESSED on screen the moment the DB updates — no refresh needed.

---

## 🔒 Production Improvements

Things to add before going to production:

- [ ] **RazorPay signature verification** — validate `x-razorpay-signature` header
- [ ] **Durable job queue** — BullMQ + Redis or AWS SQS (survive server restarts)
- [ ] **RazorPay payload adapter** — map RazorPay's format to our normalized format
- [ ] **Rate limiting** — prevent webhook flooding
- [ ] **Dead letter queue** — retry failed jobs automatically

---

## 👤 Author

Built for Full Stack Engineer Assessment · October 2026
