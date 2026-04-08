// Member 4: External Services — Zoom revocation
// Tells Zoom to invalidate the OAuth token when a user disconnects.

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
    const res = await fetch(
      `https://zoom.us/oauth/revoke?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { Authorization: `Basic ${basic}` },
      }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[revocation][zoom] revoke failed ${res.status}: ${body}`);
    }
  } catch (err) {
    // Same error-tolerant pattern as google.ts — log, don't throw.
    console.error("[revocation][zoom] error calling revoke endpoint:", err);
  }
}
