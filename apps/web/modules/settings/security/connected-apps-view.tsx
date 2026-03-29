"use client";

import { useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogFooter } from "@calcom/ui/components/dialog";
import { SkeletonButton, SkeletonContainer, SkeletonText } from "@calcom/ui/components/skeleton";
import { showToast } from "@calcom/ui/components/toast";

// TODO: add "connected_apps" and "connected_apps_description" to translation files
// For now these strings are hardcoded until i18n keys are added

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="border-subtle divide-subtle divide-y border-x">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="space-y-2">
              <SkeletonText className="h-4 w-32" />
              <SkeletonText className="h-3 w-24" />
            </div>
            <SkeletonButton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </SkeletonContainer>
  );
};

type Credential = {
  id: number;
  appId: string | null;
  type: string;
  lastUsedAt: Date | null;
  isStale: boolean;
};

function CredentialCard({
  credential,
  onRevoke,
}: {
  credential: Credential;
  onRevoke: (id: number) => void;
}) {
  const appName = credential.appId
    ? credential.appId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : credential.type;

  const lastUsedText = credential.lastUsedAt
    ? `Last used: ${new Date(credential.lastUsedAt).toLocaleDateString()}`
    : "Never used";

  return (
    <div className="flex items-center justify-between px-4 py-4 sm:px-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-emphasis text-sm font-medium">{appName}</span>
          {credential.isStale ? (
            <Badge variant="warning">Stale</Badge>
          ) : (
            <Badge variant="success">Active</Badge>
          )}
        </div>
        <p className="text-subtle text-xs">{lastUsedText}</p>
      </div>
      <Button
        color="destructive"
        size="sm"
        onClick={() => onRevoke(credential.id)}>
        Revoke
      </Button>
    </div>
  );
}

export default function ConnectedAppsView() {
  const { t } = useLocale();
  const [revokeId, setRevokeId] = useState<number | null>(null);

  // TODO: wire up to real tRPC endpoint once Member 2 (Joel) completes the GET endpoint
  // Replace with: const { data: credentials, isLoading } = trpc.viewer.credentials.list.useQuery();
  const isLoading = false;
  const credentials: Credential[] = []; // placeholder until API is ready

  // TODO: wire up to real tRPC mutation once Member 3 completes the DELETE endpoint
  // Replace with: const revokeCredential = trpc.viewer.credentials.revoke.useMutation(...)
  const handleConfirmRevoke = () => {
    if (!revokeId) return;
    showToast("Credential revoked", "success");
    setRevokeId(null);
  };

  if (isLoading) return <SkeletonLoader />;

  return (
    <>
      <div className="border-subtle rounded-b-xl border-x border-b">
        {credentials.length === 0 ? (
          <div className="border-subtle flex flex-col items-center justify-center px-4 py-12 sm:px-6">
            <p className="text-subtle text-sm">No connected apps found.</p>
          </div>
        ) : (
          <div className="divide-subtle divide-y">
            {credentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                onRevoke={(id) => setRevokeId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Revoke confirmation dialog */}
      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent
          title="Revoke access"
          description="This will disconnect the app from your account. You can reconnect it at any time from the app store.">
          <DialogFooter>
            <DialogClose />
            <Button color="destructive" onClick={handleConfirmRevoke}>
              Yes, revoke access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
