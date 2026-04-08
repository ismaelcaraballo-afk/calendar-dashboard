// apps/api/v1/pages/api/credentials/_get.ts
//
// GET /v1/credentials
//
// Returns all OAuth credentials connected to the authenticated user's account,
// with a computed `status` field indicating whether each connection is healthy.
//
// ─── Status logic ────────────────────────────────────────────────────────────
//
//   "active"  — lastUsedAt within the past 30 days
//   "stale"   — lastUsedAt older than 30 days, OR never recorded (null)
//   "invalid" — the stored key/token is empty or null (token refresh failed)
//
// The `key` field (raw OAuth token) is NEVER returned. This matches the
// existing behaviour across all Cal.com API layers — `credential.key` is
// the most protected field in the schema.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@calcom/prisma";
import type { ApiKeyAuthResult } from "../../../lib/helpers/apiKeyHandler";

// How old a lastUsedAt must be before we mark the credential "stale"
const STALE_THRESHOLD_DAYS = 30;

type CredentialStatus = "active" | "stale" | "invalid";

export interface CredentialReadPublic {
  id: number;
  type: string;
  appId: string | null;
  userId: number | null;
  teamId: number | null;
  lastUsedAt: string | null;   // ISO-8601, or null if never recorded
  status: CredentialStatus;
  createdAt?: string;          // only if ?includeCreatedAt=true
}

function computeStatus(
  key: unknown,
  lastUsedAt: Date | null
): CredentialStatus {
  // Invalid: the token itself is missing or empty
  if (!key || (typeof key === "object" && Object.keys(key as object).length === 0)) {
    return "invalid";
  }

  if (!lastUsedAt) {
    // Never seen — treat as stale (we have no evidence it works)
    return "stale";
  }

  const daysSinceUsed =
    (Date.now() - lastUsedAt.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceUsed <= STALE_THRESHOLD_DAYS ? "active" : "stale";
}

export async function getCredentials(
  req: NextApiRequest,
  res: NextApiResponse,
  auth?: Extract<ApiKeyAuthResult, { valid: true }>
): Promise<void> {
  // Auth is injected by withApiKeyAuth — guaranteed non-null in normal flow.
  // The optional parameter keeps the type signature flexible for tests.
  const userId = auth?.userId ?? Number(req.query.userId);
  const includeCreatedAt = req.query.includeCreatedAt === "true";

  const credentials = await prisma.credential.findMany({
    where: { userId },
    select: {
      id: true,
      type: true,
      appId: true,
      userId: true,
      teamId: true,
      key: true,          // needed for status computation; stripped before response
      lastUsedAt: true,
      ...(includeCreatedAt ? { createdAt: true } : {}),
    },
    orderBy: { lastUsedAt: { sort: "desc", nulls: "last" } },
  });

  const response: CredentialReadPublic[] = credentials.map((c) => ({
    id: c.id,
    type: c.type,
    appId: c.appId,
    userId: c.userId,
    teamId: c.teamId,
    lastUsedAt: c.lastUsedAt?.toISOString() ?? null,
    status: computeStatus(c.key, c.lastUsedAt ?? null),
    ...(includeCreatedAt && "createdAt" in c
      ? { createdAt: (c.createdAt as Date).toISOString() }
      : {}),
    // `key` is intentionally omitted — never expose raw OAuth tokens
  }));

  return res.status(200).json({ credentials: response });
}
