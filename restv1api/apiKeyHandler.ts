// apps/api/v1/lib/helpers/apiKeyHandler.ts
//
// This file wraps every v1 route that requires API key authentication.
// ─────────────────────────────────────────────────────────────────────
// CHANGE: After validating the key, we now fire a non-blocking
// `prisma.apiKey.update` to stamp `lastUsedAt = now()`.
//
// Why non-blocking (`void` + no await)?
//   — We do not want the stamp to slow down the actual request.
//   — A failed write here (e.g. transient DB hiccup) should never
//     cause a 500 on an otherwise valid API call.
//   — We log failures silently for observability without disrupting callers.
// ─────────────────────────────────────────────────────────────────────

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@calcom/prisma";
import { hashAPIKey } from "@calcom/lib/auth";

export type ApiKeyAuthResult =
  | { valid: false }
  | { valid: true; userId: number; isAdmin: boolean; apiKeyId: string };

/**
 * Validates the `?apiKey=` query parameter on a v1 request.
 *
 * On success: resolves the userId, role, and apiKeyId, and
 * asynchronously stamps `lastUsedAt` on the key record.
 *
 * On failure: returns `{ valid: false }`.
 */
export async function validateApiKey(
  req: NextApiRequest
): Promise<ApiKeyAuthResult> {
  const rawKey = req.query.apiKey;

  if (!rawKey || typeof rawKey !== "string") {
    return { valid: false };
  }

  const hashedKey = hashAPIKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { hashedKey },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      user: { select: { role: true } },
    },
  });

  if (!apiKey) return { valid: false };

  // Reject expired keys
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false };
  }

  // ─── Stamp lastUsedAt (non-blocking) ──────────────────────────────────
  // Fire-and-forget: we do not await this. Any error is caught and logged
  // without affecting the response to the caller.
  void prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch((err: unknown) => {
      console.error(
        `[apiKeyHandler] Failed to stamp lastUsedAt for key ${apiKey.id}:`,
        err
      );
    });
  // ──────────────────────────────────────────────────────────────────────

  return {
    valid: true,
    userId: apiKey.userId,
    isAdmin: apiKey.user.role === "ADMIN",
    apiKeyId: apiKey.id,
  };
}

/**
 * Higher-order handler that validates the API key before calling
 * the route's own handler. Returns 401 if the key is missing or invalid.
 *
 * Usage:
 *   export default withApiKeyAuth(handler);
 */
export function withApiKeyAuth(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    auth: Extract<ApiKeyAuthResult, { valid: true }>
  ) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const auth = await validateApiKey(req);
    if (!auth.valid) {
      return res.status(401).json({
        message: "Invalid or missing API key. Pass ?apiKey=cal_live_xxx",
      });
    }
    return handler(req, res, auth);
  };
}
