// Member 4: External Services — Zoom revocation
// Tells Zoom to invalidate the OAuth token when a user disconnects.

// TODO:
//   1. Extract access_token from credential.key
//   2. POST to https://zoom.us/oauth/revoke?token=<access_token>
//      with Authorization: Basic <base64(clientId:clientSecret)>
//   3. Same error handling pattern as google.ts — log, don't throw

export async function revokeZoom(credential: { key: any }) {
  const token = credential?.key?.access_token;
  if (!token) {
    console.warn("[revocation][zoom] missing access_token; skipping remote revoke");
    return;
  }

  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("[revocation][zoom] missing client credentials; skipping remote revoke");
    return;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const res = await fetch(`https://zoom.us/oauth/revoke?token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(`[revocation][zoom] revoke failed ${res.status}: ${body}`);
    }
  } catch (err) {
    console.warn("[revocation][zoom] error calling revoke endpoint", err);
  }
}
