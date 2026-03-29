// Member 5: Frontend — Single connected app card
// Renders one row in the connected apps list.

// TODO:
//   1. Display the app name and icon (use appId to look up icon)
//   2. Show a green "Active" badge if isStale is false
//   3. Show a yellow "Stale" badge if isStale is true
//   4. Show lastUsedAt as a human-readable string (e.g. "3 days ago")
//      Hint: cal.com uses dayjs — import { dayjs } from "@calcom/dayjs"
//   5. Wire the Revoke button to call onRevoke(id)

type Props = {
  id: number;
  appId: string;
  type: string;
  lastUsedAt: string | null;
  isStale: boolean;
  onRevoke: (id: number) => void;
};

export function CredentialCard({ id, appId, type, lastUsedAt, isStale, onRevoke }: Props) {
  throw new Error("TODO: Member 5 — implement CredentialCard");
}
