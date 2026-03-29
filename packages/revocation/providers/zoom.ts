// Member 4: External Services — Zoom revocation
// Tells Zoom to invalidate the OAuth token when a user disconnects.

// TODO:
//   1. Extract access_token from credential.key
//   2. POST to https://zoom.us/oauth/revoke?token=<access_token>
//      with Authorization: Basic <base64(clientId:clientSecret)>
//   3. Same error handling pattern as google.ts — log, don't throw

export async function revokeZoom(credential: { key: any }) {
  throw new Error("TODO: Member 4 — implement revokeZoom");
}
