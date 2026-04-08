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

// ─── Root: HTML landing page ──────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Calendar Dashboard · v1 API Dev Harness</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #0d0f14;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 40px 24px;
    }
    .container { max-width: 860px; margin: 0 auto; }
    header { margin-bottom: 40px; }
    .badge {
      display: inline-block;
      background: #1a2a1a;
      color: #4ade80;
      border: 1px solid #166534;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 12px;
      margin-bottom: 16px;
      letter-spacing: 0.05em;
    }
    h1 { font-size: 28px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; }
    .subtitle { color: #94a3b8; font-size: 15px; }
    .url-bar {
      background: #161b27;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 14px 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #7dd3fc;
      margin: 28px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .url-bar .method { color: #4ade80; font-weight: 600; }
    .section-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 14px;
    }
    .cards { display: grid; gap: 12px; margin-bottom: 36px; }
    .card {
      background: #131720;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      text-decoration: none;
      color: inherit;
    }
    .card:hover { border-color: #3b82f6; background: #161d2e; }
    .card.danger:hover { border-color: #ef4444; background: #1f1215; }
    .card-icon {
      width: 38px; height: 38px;
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .card-icon.green { background: #14281f; }
    .card-icon.red   { background: #2a1012; }
    .card-body { flex: 1; }
    .card-label { font-size: 14px; font-weight: 600; color: #f1f5f9; margin-bottom: 3px; }
    .card-url { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #64748b; }
    .card-arrow { color: #334155; font-size: 18px; }
    .seed-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .seed-table th {
      text-align: left; padding: 10px 14px;
      background: #0f1520; color: #64748b;
      font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
      border-bottom: 1px solid #1e293b;
    }
    .seed-table td { padding: 12px 14px; border-bottom: 1px solid #1a2235; }
    .seed-table tr:last-child td { border-bottom: none; }
    .pill {
      display: inline-block; border-radius: 999px;
      padding: 2px 10px; font-size: 11px; font-weight: 600;
    }
    .pill.active  { background: #14281f; color: #4ade80; }
    .pill.stale   { background: #1e1a10; color: #fbbf24; }
    .pill.invalid { background: #2a1012; color: #f87171; }
    .result-panel {
      background: #0a0d14;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 20px;
      margin-top: 16px;
      display: none;
    }
    .result-panel pre {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #7dd3fc;
      white-space: pre-wrap;
      word-break: break-all;
    }
    footer { margin-top: 48px; text-align: center; color: #334155; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">🟢 SERVER RUNNING</div>
      <h1>Calendar Dashboard · v1 API Dev Harness</h1>
      <p class="subtitle">Standalone test environment — no real database required. All data is seeded in-memory.</p>
    </header>

    <div class="url-bar">
      <span class="method">GET</span>
      <span>http://localhost:3001/v1/credentials?apiKey=cal_live_test123</span>
    </div>

    <p class="section-title">✅ Happy Path Tests</p>
    <div class="cards">
      <a class="card" href="/v1/credentials?apiKey=cal_live_test123" target="_blank">
        <div class="card-icon green">📋</div>
        <div class="card-body">
          <div class="card-label">List all credentials</div>
          <div class="card-url">GET /v1/credentials?apiKey=cal_live_test123</div>
        </div>
        <span class="card-arrow">↗</span>
      </a>
      <a class="card" href="/v1/credentials?apiKey=cal_live_test123&includeCreatedAt=true" target="_blank">
        <div class="card-icon green">📅</div>
        <div class="card-body">
          <div class="card-label">Include createdAt timestamps</div>
          <div class="card-url">GET /v1/credentials?apiKey=cal_live_test123&includeCreatedAt=true</div>
        </div>
        <span class="card-arrow">↗</span>
      </a>
    </div>

    <p class="section-title">❌ Error Case Tests</p>
    <div class="cards">
      <a class="card danger" href="/v1/credentials" target="_blank">
        <div class="card-icon red">🔑</div>
        <div class="card-body">
          <div class="card-label">Missing API key → 401</div>
          <div class="card-url">GET /v1/credentials</div>
        </div>
        <span class="card-arrow">↗</span>
      </a>
      <a class="card danger" href="/v1/credentials?apiKey=cal_live_wrong" target="_blank">
        <div class="card-icon red">🚫</div>
        <div class="card-body">
          <div class="card-label">Wrong API key → 401</div>
          <div class="card-url">GET /v1/credentials?apiKey=cal_live_wrong</div>
        </div>
        <span class="card-arrow">↗</span>
      </a>
    </div>

    <p class="section-title">🌱 Seed Data (userId 1)</p>
    <table class="seed-table">
      <thead>
        <tr>
          <th>ID</th><th>Type</th><th>App ID</th><th>Last Used</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td><td>google_calendar</td><td>google-calendar</td><td>2 days ago</td>
          <td><span class="pill active">ACTIVE</span></td>
        </tr>
        <tr>
          <td>2</td><td>zoom_video</td><td>zoom</td><td>45 days ago</td>
          <td><span class="pill stale">STALE</span></td>
        </tr>
        <tr>
          <td>3</td><td>stripe_payment</td><td>stripe</td><td>never</td>
          <td><span class="pill stale">STALE</span></td>
        </tr>
        <tr>
          <td>4</td><td>salesforce_crm</td><td>salesforce</td><td>1 day ago</td>
          <td><span class="pill invalid">INVALID</span></td>
        </tr>
      </tbody>
    </table>

    <footer>calendar-dashboard · v1 API Dev Harness · localhost:3001</footer>
  </div>
</body>
</html>`);
});

// Catch-all for unmapped routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "Not found — available routes: GET / (dashboard), GET /v1/credentials",
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
