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

  // Member 3: implement this
  // TODO:
  //   1. Find the credential by id
  //   2. Check that credential.userId === userId — throw ForbiddenException if not
  //      (IMPORTANT: users can only revoke their own credentials)
  //   3. Call revokeCredential(credential) to revoke on the provider side (Member 4)
  //   4. Delete the credential row from the DB
  //   5. Return { success: true, message: "Credential revoked" }
  async revokeCredential(credentialId: number, userId: number) {
    throw new Error("TODO: Member 3 — implement revokeCredential");
  }
}
