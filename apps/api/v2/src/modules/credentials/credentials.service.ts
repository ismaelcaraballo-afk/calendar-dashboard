import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CredentialsRepository } from "./credentials.repository";
import { revokeCredential } from "@calcom/revocation/providers";
import type { CredentialResponseDto } from "./dto/credential-response.dto";

const STALE_DAYS = 30;

@Injectable()
export class CredentialsService {
  private readonly logger = new Logger(CredentialsService.name);

  constructor(private readonly credentialsRepo: CredentialsRepository) {}

  // Member 2: GET /api/v2/credentials
  // Returns all connected app credentials for the authenticated user,
  // with a computed isStale flag indicating connection health.
  async getCredentialsForUser(userId: number): Promise<CredentialResponseDto[]> {
    const creds = await this.credentialsRepo.getAllUserCredentialsById(userId);
    const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);

    return creds.map((c) => ({
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

    try {
      await revokeCredential(credential);
    } catch (providerError) {
      // Provider is down or refused — log but don't block local cleanup.
      // The user should never be trapped by external downtime.
      this.logger.warn(
        `Provider revocation failed for credential ${credentialId} — forcing local delete anyway: ${providerError}`
      );
    }

    await this.credentialsRepo.deleteUserCredentialById(userId, credentialId);

    this.logger.log(
      `[AUDIT] User ${userId} revoked credential ${credentialId} at ${new Date().toISOString()}`
    );

    return { success: true, message: "Credential revoked" };
  }
}
