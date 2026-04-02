// Member 2 & 3: API — Service layer
// Handles the database queries and revocation logic.

import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { revokeCredential as revokeOnProvider } from "../../../../packages/revocation/providers";
import { CredentialResponseDto } from "./dto/credential.dto";

const STALE_DAYS = 30;

@Injectable()
export class CredentialsService {
  constructor(private readonly prisma: PrismaService) {}

  // Member 2: GET /api/v2/credentials
  // Returns all connected app credentials for the authenticated user,
  // with a computed isStale flag indicating connection health.
  async getCredentialsForUser(userId: number): Promise<CredentialResponseDto[]> {
    const credentials = await this.prisma.credential.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        appId: true,
        lastUsedAt: true,
      },
    });

    const staleThreshold = new Date();
    staleThreshold.setDate(staleThreshold.getDate() - STALE_DAYS);

    return credentials.map((c) => ({
      id: c.id,
      type: c.type,
      appId: c.appId,
      lastUsedAt: c.lastUsedAt,
      // Stale if never used, or last used more than STALE_DAYS ago
      isStale: c.lastUsedAt === null || c.lastUsedAt < staleThreshold,
    }));
  }

  // Member 3: DELETE /api/v2/credentials/:id
  // Revokes a connected app: verifies ownership, calls provider revocation,
  // then removes the credential row from the database.
  async revokeCredential(credentialId: number, userId: number) {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      throw new NotFoundException(`Credential ${credentialId} not found`);
    }

    // Security guard: users may only revoke their own credentials
    if (credential.userId !== userId) {
      throw new ForbiddenException("You do not own this credential");
    }

    // Notify the external provider (Google, Zoom, Stripe, etc.)
    // This is fire-and-forget from a UX perspective — the local delete
    // proceeds even if the remote call fails (handled inside each provider).
    await revokeOnProvider(credential);

    // Remove the credential from the database
    await this.prisma.credential.delete({ where: { id: credentialId } });

    return { success: true, message: "Credential revoked" };
  }
}
