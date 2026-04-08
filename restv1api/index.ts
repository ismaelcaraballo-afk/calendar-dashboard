// apps/api/v1/pages/api/credentials/index.ts
//
// Route dispatcher for GET /v1/credentials
// Follows the same pattern as other v1 routes (e.g. /bookings/index.ts).

import type { NextApiRequest, NextApiResponse } from "next";
import { withApiKeyAuth } from "../../../lib/helpers/apiKeyHandler";
import { getCredentials } from "./_get";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return getCredentials(req, res);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withApiKeyAuth(handler);
