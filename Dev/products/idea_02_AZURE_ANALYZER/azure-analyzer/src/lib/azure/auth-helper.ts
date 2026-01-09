
import { TokenCredential, AccessToken } from "@azure/core-auth";

export class StaticTokenCredential implements TokenCredential {
  constructor(private token: string) {}

  async getToken(): Promise<AccessToken | null> {
    return {
      token: this.token,
      expiresOnTimestamp: Date.now() + 3600 * 1000, // Assume valid for 1 hour from instantiation
    };
  }
}
