// dev-harness/mocks/prisma.ts
//
// Mocks @calcom/prisma for the dev harness.
// Provides an in-memory implementation that mirrors the shape of the real
// Prisma client used by restv1api/ — no database required.
//
// Seed data is designed to exercise all three credential statuses:
//   active  → lastUsedAt within the last 30 days
//   stale   → lastUsedAt older than 30 days, or null
//   invalid → key is empty / null (token refresh failed)

import { hashAPIKey } from "./auth";
import { createHash } from "crypto";

// ─── Seed: API Keys ──────────────────────────────────────────────────────────

const RAW_KEY = "cal_live_test123";

const seedApiKeys = [
  {
    id: "apikey_1",
    userId: 1,
    hashedKey: hashAPIKey(RAW_KEY),
    expiresAt: null,
    lastUsedAt: null,
    user: { role: "USER" },
  },
];

// ─── Seed: Credentials ───────────────────────────────────────────────────────

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

const seedCredentials = [
  {
    id: 1,
    userId: 1,
    type: "google_calendar",
    appId: "google-calendar",
    teamId: null,
    key: { access_token: "ya29.mock_google_token" },
    lastUsedAt: daysAgo(2),     // 2 hours ago effectively — status: ACTIVE
    createdAt: daysAgo(90),
  },
  {
    id: 2,
    userId: 1,
    type: "zoom_video",
    appId: "zoom",
    teamId: null,
    key: { access_token: "mock_zoom_token" },
    lastUsedAt: daysAgo(45),    // 45 days ago — status: STALE
    createdAt: daysAgo(180),
  },
  {
    id: 3,
    userId: 1,
    type: "stripe_payment",
    appId: "stripe",
    teamId: null,
    key: { stripe_key: "sk_test_mock" },
    lastUsedAt: null,           // never used — status: STALE
    createdAt: daysAgo(60),
  },
  {
    id: 4,
    userId: 1,
    type: "salesforce_crm",
    appId: "salesforce",
    teamId: null,
    key: {},                    // empty key — status: INVALID
    lastUsedAt: daysAgo(1),
    createdAt: daysAgo(30),
  },
];

// ─── In-memory "database" ────────────────────────────────────────────────────

// These are mutable so the harness can demonstrate deletes during a session.
let apiKeys = [...seedApiKeys];
let credentials = [...seedCredentials];

// ─── Mock Prisma Client ───────────────────────────────────────────────────────

const prisma = {
  apiKey: {
    findUnique: async ({ where }: { where: { hashedKey?: string; id?: string } }) => {
      return apiKeys.find((k) =>
        (where.hashedKey && k.hashedKey === where.hashedKey) ||
        (where.id && k.id === where.id)
      ) ?? null;
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const key = apiKeys.find((k) => k.id === where.id);
      if (key) Object.assign(key, data);
      return key;
    },
  },

  credential: {
    findMany: async ({ where, select, orderBy }: any) => {
      let result = credentials.filter((c) => {
        if (where?.userId !== undefined && c.userId !== where.userId) return false;
        return true;
      });

      // Apply orderBy lastUsedAt desc, nulls last
      if (orderBy?.lastUsedAt) {
        result = result.sort((a, b) => {
          if (a.lastUsedAt === null && b.lastUsedAt === null) return 0;
          if (a.lastUsedAt === null) return 1;
          if (b.lastUsedAt === null) return -1;
          return b.lastUsedAt.getTime() - a.lastUsedAt.getTime();
        });
      }

      // Apply select (include only requested fields)
      if (select) {
        return result.map((c) =>
          Object.fromEntries(
            Object.entries(c).filter(([k]) => select[k] === true)
          )
        );
      }

      return result;
    },

    findUnique: async ({ where }: { where: { id: number } }) => {
      return credentials.find((c) => c.id === where.id) ?? null;
    },

    delete: async ({ where }: { where: { id: number } }) => {
      const idx = credentials.findIndex((c) => c.id === where.id);
      if (idx !== -1) credentials.splice(idx, 1);
    },
  },
};

export default prisma;

// ─── Helpers for the harness README ─────────────────────────────────────────
export { RAW_KEY };
