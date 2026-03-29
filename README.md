# Calendar Dashboard — Connected Apps Security Feature
### Cal.com Improvement Project | Pursuit Cohort

A new security settings page that gives cal.com users full visibility
and control over every third-party app connected to their account.

---

## The Problem
Cal.com stores OAuth credentials for 112+ integrations in a single
`Credential` table. Users have no way to see what's connected, when
it was last used, or revoke access without deleting the integration
entirely. This feature fixes that.

---

## What We're Building

```
Connected Apps

Google Calendar    ✓ Active    Last used: 2 hours ago    [Revoke]
Zoom               ✓ Active    Last used: 3 days ago     [Revoke]
Stripe             ⚠ Stale     Last used: 47 days ago    [Revoke]
Salesforce         ✓ Active    Last used: today          [Revoke]
```

---

## Team & Layer Ownership

| Member | Layer | Folder |
|--------|-------|--------|
| Member 1 | Database | `packages/prisma/` |
| Member 2 | API — Read | `apps/api/v2/src/modules/credentials/` (GET) |
| Member 3 | API — Write + Auth | `apps/api/v2/src/modules/credentials/` (DELETE) |
| Member 4 | External Services | `packages/revocation/` |
| Member 5 | Frontend | `apps/web/app/settings/security/connected-apps/` |

---

## How the Layers Connect

```
[Frontend page]
    → GET  /api/v2/credentials         (Member 2)
    → DELETE /api/v2/credentials/:id   (Member 3)
          → calls provider revocation  (Member 4)
          → reads Credential table     (Member 1 schema)
```

---

## Stack
- **DB:** PostgreSQL + Prisma 6
- **API:** NestJS 10
- **Frontend:** Next.js 16 + React 18 + Tailwind CSS
- **Types:** TypeScript throughout

---

## Getting Started

```bash
# clone
git clone https://github.com/ismaelcaraballo-afk/calendar-dashboard

# each member works in their own branch
git checkout -b member-1/database
git checkout -b member-2/api-read
git checkout -b member-3/api-write
git checkout -b member-4/revocation
git checkout -b member-5/frontend
```

---

## Folder Structure

```
calendar-dashboard/
├── packages/
│   ├── prisma/                        ← Member 1
│   │   └── migrations/
│   │       └── 20260329_add_last_used_at_credential/
│   │           └── migration.sql
│   └── revocation/                    ← Member 4
│       └── providers/
│           ├── index.ts
│           ├── google.ts
│           ├── zoom.ts
│           └── stripe.ts
└── apps/
    ├── api/v2/src/modules/credentials/ ← Members 2 & 3
    │   ├── credentials.module.ts
    │   ├── credentials.controller.ts
    │   ├── credentials.service.ts
    │   └── dto/
    │       └── credential.dto.ts
    └── web/app/settings/security/      ← Member 5
        └── connected-apps/
            ├── page.tsx
            └── components/
                └── CredentialCard.tsx
```
