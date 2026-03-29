// Member 4: External Services — Provider router
// Routes a credential to the correct revocation handler based on its type.
// Member 3 calls this from credentials.service.ts.

import { revokeGoogle } from "./google";
import { revokeZoom } from "./zoom";
import { revokeStripe } from "./stripe";

// TODO:
//   1. Add cases for any additional providers you want to support
//   2. For providers with no revocation support, just log and return
export async function revokeCredential(credential: { type: string; key: any }) {
  switch (true) {
    case credential.type.startsWith("google_"):
      return revokeGoogle(credential);

    case credential.type.startsWith("zoom_"):
      return revokeZoom(credential);

    case credential.type.startsWith("stripe_"):
      return revokeStripe(credential);

    default:
      // Unknown provider — no remote revocation, local delete is enough
      console.log(`[revocation] No remote revocation for type: ${credential.type}`);
  }
}
