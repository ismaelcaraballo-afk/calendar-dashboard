# Dev Harness — v1 Credentials API

Standalone server for testing the `restv1api/` endpoint without the full Cal.com monorepo.

## Start

```bash
cd dev-harness
npm install
npm run dev
```

Server starts at **http://localhost:3001**

---

## Test with curl

### ✅ List all credentials (happy path)
```bash
curl "http://localhost:3001/v1/credentials?apiKey=cal_live_test123"
```

Expected response — all 4 seed credentials, each with a computed `status`:
```json
{
  "credentials": [
    { "id": 1, "type": "google_calendar",  "status": "active",  "lastUsedAt": "..." },
    { "id": 4, "type": "salesforce_crm",   "status": "invalid", "lastUsedAt": "..." },
    { "id": 2, "type": "zoom_video",       "status": "stale",   "lastUsedAt": "..." },
    { "id": 3, "type": "stripe_payment",   "status": "stale",   "lastUsedAt": null  }
  ]
}
```
> Note: order is `lastUsedAt DESC, nulls last` — matches the Prisma `orderBy` in `_get.ts`.

---

### ✅ Include createdAt (optional flag)
```bash
curl "http://localhost:3001/v1/credentials?apiKey=cal_live_test123&includeCreatedAt=true"
```
Each credential will include a `createdAt` ISO-8601 string.

---

### ❌ Missing API key → 401
```bash
curl "http://localhost:3001/v1/credentials"
```
```json
{ "message": "Invalid or missing API key. Pass ?apiKey=cal_live_xxx" }
```

---

### ❌ Wrong API key → 401
```bash
curl "http://localhost:3001/v1/credentials?apiKey=cal_live_wrong"
```
```json
{ "message": "Invalid or missing API key. Pass ?apiKey=cal_live_xxx" }
```

---

### ❌ Wrong HTTP method → 405
```bash
curl -X POST "http://localhost:3001/v1/credentials?apiKey=cal_live_test123"
```
```json
{ "message": "Method not allowed" }
```

---

## How it works

```
Express server (server.ts)
    ↓ adapts req/res to Next.js shape
restv1api/index.ts
    ↓ withApiKeyAuth()
restv1api/apiKeyHandler.ts  →  mocks/prisma.ts  (validates hash)
    ↓
restv1api/_get.ts           →  mocks/prisma.ts  (queries credentials)
    ↓
JSON response
```

`@calcom/prisma` and `@calcom/lib/auth` are resolved to `mocks/` via
`tsconfig.json` path aliases — zero real database required.

---

## Seed Data

| API Key | Maps to |
|---------|---------|
| `cal_live_test123` | userId 1 |

| ID | Type | lastUsedAt | Status |
|----|------|-----------|--------|
| 1 | `google_calendar` | 2 days ago | `active` |
| 2 | `zoom_video` | 45 days ago | `stale` |
| 3 | `stripe_payment` | null | `stale` |
| 4 | `salesforce_crm` | 1 day ago (empty key `{}`) | `invalid` |
