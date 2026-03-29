"use client";

// Member 5: Frontend — Connected Apps settings page
// Main page that fetches and displays all connected apps.

// TODO:
//   1. Fetch connected apps from GET /api/v2/credentials using React Query
//      Hint: useQuery from "@tanstack/react-query"
//   2. Handle loading state — show a spinner or skeleton
//   3. Handle empty state — "No connected apps" message
//   4. Render a <CredentialCard /> for each credential
//   5. On revoke:
//      a. Call DELETE /api/v2/credentials/:id
//      b. Ask for confirmation before deleting ("Are you sure?")
//      c. Refresh the list after success
//      d. Show an error toast if it fails
//
// The page should live under Settings → Security → Connected Apps

import { CredentialCard } from "./components/CredentialCard";

export default function ConnectedAppsPage() {
  throw new Error("TODO: Member 5 — implement ConnectedAppsPage");
}
