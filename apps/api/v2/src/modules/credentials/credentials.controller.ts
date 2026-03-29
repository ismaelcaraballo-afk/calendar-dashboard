// Member 2 & 3: API — Controller (routes)
// Defines the HTTP endpoints.

import { Controller, Get, Delete, Param, UseGuards } from "@nestjs/common";
import { CredentialsService } from "./credentials.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetUser } from "../auth/decorators/get-user.decorator";

@Controller("credentials")
@UseGuards(JwtAuthGuard) // all routes require a valid JWT — Member 3 owns this
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  // Member 2: GET /api/v2/credentials
  // Returns all connected apps for the logged-in user
  @Get()
  async getCredentials(@GetUser("id") userId: number) {
    return this.credentialsService.getCredentialsForUser(userId);
  }

  // Member 3: DELETE /api/v2/credentials/:id
  // Revokes a specific connected app
  @Delete(":id")
  async revokeCredential(
    @Param("id") credentialId: number,
    @GetUser("id") userId: number
  ) {
    return this.credentialsService.revokeCredential(credentialId, userId);
  }
}
