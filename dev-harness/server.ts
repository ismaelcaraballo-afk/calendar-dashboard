// dev-harness/server.ts
//
// Standalone Express server that runs the restv1api/ v1 credentials endpoint.
//
// The restv1api/ handlers are written for Next.js (NextApiRequest/NextApiResponse).
// Express req/res is already shape-compatible for our purposes — both have
// .query, .method, .status(), .json(), and .setHeader().
//
// Why we don't import restv1api/index.ts directly:
//   index.ts uses a monorepo-relative path "../../../lib/helpers/apiKeyHandler"
//   that assumes it lives inside apps/api/v1/pages/api/credentials/. Since this
//   is a scaffold with only the endpoint files extracted, we wire the same two
//   pieces (withApiKeyAuth + getCredentials) together here instead.
//
// Module resolution (via tsconfig.json paths + tsx):
//   @calcom/prisma   → mocks/prisma.ts   (in-memory seed data)
//   @calcom/lib/auth → mocks/auth.ts     (SHA-256 hashAPIKey)

import express, { Request, Response } from "express";
import { withApiKeyAuth } from "../restv1api/apiKeyHandler";
import { getCredentials } from "../restv1api/_get";
import type { NextApiRequest, NextApiResponse } from "./mocks/next";

const app = express();
const PORT = 3001;

// ─── Route: GET /v1/credentials ──────────────────────────────────────────────
//
// Mirrors exactly what restv1api/index.ts does:
//   1. Wrap with API key auth (withApiKeyAuth)
//   2. On GET → delegate to getCredentials
//   3. Other methods → 405

const credentialsRoute = withApiKeyAuth(async (req: any, res: any, auth: any) => {
  if (req.method === "GET") {
    return getCredentials(req, res, auth);
  }
  return res.status(405).json({ message: "Method not allowed" });
});

app.all("/v1/credentials", async (req: Request, res: Response) => {
  try {
    await credentialsRoute(req as any, res as any);
  } catch (err) {
    console.error("[server] Unhandled error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// Catch-all for unmapped routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "Not found — only GET /v1/credentials is wired up in this harness",
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║       calendar-dashboard  ·  v1 API Dev Harness          ║
╠══════════════════════════════════════════════════════════╣
║  Server:   http://localhost:${PORT}                         ║
║  Endpoint: GET /v1/credentials?apiKey=cal_live_test123   ║
╠══════════════════════════════════════════════════════════╣
║  Seed credentials (userId 1):                            ║
║    id 1  google_calendar   → ACTIVE  (used 2 days ago)   ║
║    id 2  zoom_video        → STALE   (used 45 days ago)  ║
║    id 3  stripe_payment    → STALE   (never used)        ║
║    id 4  salesforce_crm    → INVALID (empty token key)   ║
╚══════════════════════════════════════════════════════════╝
  `);
});
