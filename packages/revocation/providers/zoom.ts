// Member 4: External Services — Zoom revocation
// Tells Zoom to invalidate the OAuth token when a user disconnects.

export async function revokeZoom(credential: { key: any }) {
  const accessToken = credential.key?.access_token;
  const clientId = process.env.ZOOM_CLIENT_ID ?? "";
  const clientSecret = process.env.ZOOM_CLIENT_SECRET ?? "";

  if (!accessToken) {
    console.warn("[revocation] revokeZoom: no access_token found in key, skipping remote call");
    return;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(
      `https://zoom.us/oauth/revoke?token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      console.error(
        `[revocation] revokeZoom: Zoom returned ${response.status} — ${body}`
      );
    }
  } catch (err) {
    // Same error-tolerant pattern as google.ts — log, don't throw.
    console.error("[revocation] revokeZoom: fetch failed:", err);
  }
}
