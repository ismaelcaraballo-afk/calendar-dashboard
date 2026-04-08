import { Injectable, NotFoundException } from "@nestjs/common";
import { CredentialsRepository } from "./credentials.repository";
import { revokeCredential } from "@calcom/revocation/providers";
import type { CredentialResponseDto } from "./dto/credential-response.dto";

const STALE_DAYS = 30;

@Injectable()
export class CredentialsService {
  constructor(private readonly credentialsRepo: CredentialsRepository) {}

  // Member 2: GET /api/v2/credentials
  // Returns all connected app credentials for the authenticated user,
  // with a computed isStale flag indicating connection health.
  async getCredentialsForUser(userId: number): Promise<CredentialResponseDto[]> {
    const creds = await this.credentialsRepo.getAllUserCredentialsById(userId);
    const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);

    return credentials.map((c) => ({
      id: c.id,
      type: c.type,
      appId: c.appId ?? null,
      lastUsedAt: "lastUsedAt" in c ? (c as { lastUsedAt: Date | null }).lastUsedAt ?? null : null,
      isStale:
        "lastUsedAt" in c && (c as { lastUsedAt: Date | null }).lastUsedAt
          ? (c as { lastUsedAt: Date | null }).lastUsedAt < cutoff
          : true,
    }));
  }

  // Member 3: DELETE /api/v2/credentials/:id
  // Revokes a connected app: verifies ownership, calls provider revocation,
  // then removes the credential row from the database.
  async revokeCredential(credentialId: number, userId: number) {
    const credential = await this.credentialsRepo.findCredentialByIdAndUserId(credentialId, userId);
    if (!credential) throw new NotFoundException("Credential not found");

    await revokeCredential(credential);
    await this.credentialsRepo.deleteUserCredentialById(userId, credentialId);

    // Audit trail
    console.log(
      `[AUDIT_LOG_EMITTED]: User ${userId} successfully revoked and deleted credential ${credentialId} at ${new Date().toISOString()}`
    );

    return { success: true, message: "Credential revoked" };
  }
}
