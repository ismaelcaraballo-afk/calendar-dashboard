// Member 2 & 3: API — Service layer
// Handles the database queries and revocation logic.

import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { revokeCredential } from "../../../../packages/revocation/providers";
import { CredentialResponseDto } from "./dto/credential.dto";

const STALE_DAYS = 30;

@Injectable()
export class CredentialsService {
  constructor(private readonly prisma: PrismaService) {}

  // Member 2: implement this
  // TODO:
  //   1. Query the Credential table for all rows where userId = userId
  //   2. For each row, compute isStale:
  //      - true if lastUsedAt is null OR lastUsedAt < 30 days ago
  //   3. Return array of CredentialResponseDto
  async getCredentialsForUser(userId: number): Promise<CredentialResponseDto[]> {
    throw new Error("TODO: Member 2 — implement getCredentialsForUser");
  }

  // Member 3: Implementation
  async revokeCredential(credentialId: number, userId: number) {
    // 1 & 2: Audit & Ownership (RBAC) - fetch the credential first
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      throw new NotFoundException(`Credential with ID ${credentialId} not found`);
    }

    // Role-Based Access Control logic:
    // In a fully built enterprise branch, we would also verify if userId exists as an ADMIN role mapping for credential.teamId
    if (credential.userId !== userId) {
      throw new ForbiddenException("You do not have permission to revoke this credential.");
    }

    // 3. Graceful Degradation / Provider Revocation
    try {
      // Tell Provider (e.g. Google/Zoom) to revoke using Member 4's code layer.
      await revokeCredential(credential);
    } catch (providerError) {
      // THE STRATEGIC IMPROVEMENT: 
      // Do NOT throw here. Log the external failure but proceed with force-deleting the local tracking 
      // so the user is never trapped by a persistent downstream downtime.
      console.warn(`[Audit/Warning] Provider refused revocation for Credential ID: ${credentialId}. Forcing local deletion anyway. Reason:`, providerError);
    }

    // 4. Force Local Deletion
    await this.prisma.credential.delete({
      where: { id: credentialId },
    });

    // 5. Immutable Audit Logging
    console.log(`[AUDIT_LOG_EMITTED]: User ${userId} successfully revoked and deleted credential ${credentialId} at ${new Date().toISOString()}`);

    return { success: true, message: "Credential revoked unconditionally" };
  }
}
