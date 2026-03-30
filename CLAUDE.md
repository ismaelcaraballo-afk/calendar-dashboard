# CLAUDE.md — AI Context for Calendar Dashboard

## Project
**Connected Apps Security Feature** for cal.com — a settings page that lets users
see, audit, and revoke third-party OAuth integrations connected to their account.

## Active Member
- **Member 1 — Beatrice** (Database layer)
- Working branch: `member-1/database`
- Owns: `packages/prisma/`

## Team & Layer Map
| Member | Layer | Folder |
|--------|-------|--------|
| Member 1 (Beatrice) | Database | `packages/prisma/` |
| Member 2 | API — Read (GET) | `apps/api/v2/src/modules/credentials/` |
| Member 3 | API — Write + Auth (DELETE) | `apps/api/v2/src/modules/credentials/` |
| Member 4 | External Services | `packages/revocation/` |
| Member 5 | Frontend | `apps/web/...connected-apps/` |

## Stack
- **DB:** PostgreSQL + Prisma 6
- **API:** NestJS 10
- **Frontend:** Next.js 16 + React 18 + Tailwind CSS
- **Types:** TypeScript throughout

## Member 1's Specific Scope
The `Credential` table in cal.com's existing Prisma schema needs a new field:

```prisma
model Credential {
  // ...existing fields...
  lastUsedAt  DateTime?   // tracks when each connected app was last active
}
```

The SQL migration is already written at:
`packages/prisma/migrations/20260329_add_last_used_at_credential/migration.sql`

Remaining tasks:
1. Create/update `packages/prisma/schema.prisma` with the `lastUsedAt` field
2. Run `npx prisma generate` to regenerate the Prisma client
3. Verify Zod types update automatically

## Key Data Rules
- `lastUsedAt` is **nullable** (`DateTime?`) — existing credentials have no value yet
- `isStale` is computed by the API layer (Member 2), not stored in the DB:
  - `true` if `lastUsedAt IS NULL` OR `lastUsedAt < NOW() - 30 days`

## Working Conventions
- Never commit directly to `main` — all work goes on `member-1/database`
- Keep `schema.prisma` changes minimal and scoped to this feature only
- Document any decisions or open questions in `NOTES.md`
- Track progress against milestones in `ROADMAP.md`

## Downstream Consumers of This Schema
These files depend on `lastUsedAt` existing in the Prisma client:
- `apps/api/v2/src/modules/credentials/credentials.service.ts`
- `apps/api/v2/src/modules/credentials/dto/credential.dto.ts`
- `apps/web/modules/settings/security/connected-apps-view.tsx`

## Data Flow (for full picture)
```
Frontend (Member 5)
  → GET  /api/v2/credentials           Member 2
  → DELETE /api/v2/credentials/:id     Member 3
        → revokeCredential()           Member 4
        → Credential table             Member 1 (YOU)
```
