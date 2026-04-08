# PRD — Connected Apps Security Dashboard
**Project:** cal.com class project (Pursuit Cycle 4)  
**Team:** Ismael Caraballo, Beatrice, Joel, Pedro, John C (Michael)  
**Feature:** External Services / Connected Apps management

---

## Problem

cal.com users connect third-party services (Google Calendar, Zoom, Stripe, etc.) to power their scheduling workflows. Today there is no single place to:

- See all connected apps at a glance
- Know when a credential was last used or has gone stale
- Revoke access to a specific app without going to each integration's settings page individually

This creates a security blind spot — users can't tell if old or forgotten integrations still have active tokens.

---

## Goal

Give every cal.com user a **Connected Apps Security Dashboard** — a settings page that surfaces all active OAuth credentials, highlights stale ones, and makes revocation a single-click action.

---

## Users

- **Individuals** using cal.com for personal scheduling (Google Calendar, Zoom)
- **Teams / businesses** with payment integrations (Stripe) and CRM connections
- **Security-conscious users** who periodically audit their connected services

---

## Requirements

### Must Have (MVP)

| # | Requirement |
|---|-------------|
| M1 | List all installed/connected apps for the authenticated user |
| M2 | Show app name, logo, and category for each credential |
| M3 | Allow revoking a credential with a confirmation step |
| M4 | Revoke provider token via OAuth API before deleting locally |
| M5 | Credential deletion must be authorized (user can only delete their own) |
| M6 | Graceful degradation: if provider revocation fails, still delete locally and log a warning |

### Should Have

| # | Requirement |
|---|-------------|
| S1 | Show when each credential was last used (`lastUsedAt`) |
| S2 | Flag credentials unused for 30+ days as "stale" |
| S3 | Shared `STALE_THRESHOLD_DAYS` constant across all endpoints |
| S4 | Skeleton loading state while data fetches |
| S5 | Empty state when no apps are connected |
| S6 | Error state with retry when the query fails |

### Nice to Have

| # | Requirement |
|---|-------------|
| N1 | Bulk revoke (revoke all stale at once) |
| N2 | Email notification when a credential is revoked |
| N3 | Last-used timestamp updated automatically on each API call |

---

## Team Member Scope

| Member | Scope |
|--------|-------|
| **Beatrice** | Prisma schema — `lastUsedAt` migration, Zod/Kysely generators, CredentialResponseDto |
| **Joel** | REST v1 read endpoint — computeStatus() returning active/stale/invalid, ordered list |
| **Pedro** | REST v1 write endpoint — revokeCredential with RBAC ownership check, graceful provider revocation |
| **John C (Michael)** | OAuth revocation layer — revokeOAuthCredential for Google/Zoom/Stripe/Office365, handleDeleteCredential |
| **Ismael** | Frontend — /settings/security/connected-apps page, stale badge, revoke dialog, test suite |

---

## Architecture

```
Frontend (Next.js)
  ConnectedAppsView
    tRPC: viewer.credentials.delete
      handleDeleteCredential (Michael)
        revokeOAuthCredential — provider token revocation
        prisma.credential.delete

REST v1 (Joel + Pedro)
  GET  /api/credentials  → getCredentialsForUser → computeStatus (isStale)
  DELETE /api/credentials/:id → revokeCredential (RBAC + graceful degradation)

Prisma Schema (Beatrice)
  Credential.lastUsedAt: DateTime?
  STALE_THRESHOLD_DAYS = 30 (packages/lib/credentials/constants.ts)
```

---

## Success Metrics

- User can view all connected apps in under 2 seconds
- Revocation completes (local delete) even if provider API is down
- Zero credentials accessible to users who don't own them
- All 9 frontend tests pass
- Stale credentials surfaced visually after 30 days of inactivity

---

## Out of Scope

- Re-connecting an app after revocation (handled by existing install flow)
- OAuth token refresh / rotation
- Admin-level credential management across users
