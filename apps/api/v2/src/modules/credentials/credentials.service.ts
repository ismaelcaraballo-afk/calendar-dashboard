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

  async getCredentialsForUser(userId: number): Promise<CredentialResponseDto[]> {
    const creds = await this.prisma.credential.findMany({
      where: { userId },
      select: { id: true, type: true, appId: true, lastUsedAt: true },
      orderBy: { id: "asc" },
    });

    const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);

    return creds.map((c) => ({
      id: c.id,
      type: c.type,
      appId: c.appId ?? null,
      lastUsedAt: c.lastUsedAt ?? null,
      isStale: !c.lastUsedAt || c.lastUsedAt < cutoff,
    }));
  }

  async revokeCredential(credentialId: number, userId: number) {
    const credential = await this.prisma.credential.findUnique({ where: { id: credentialId } });
    if (!credential) throw new NotFoundException("Credential not found");
    if (credential.userId !== userId) throw new ForbiddenException("Not your credential");

    await revokeCredential(credential);
    await this.prisma.credential.delete({ where: { id: credentialId } });

    return { success: true, message: "Credential revoked" };
  }
}
