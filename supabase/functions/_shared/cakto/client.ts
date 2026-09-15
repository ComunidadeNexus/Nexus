import type { CaktoTokenResponse } from "./types.ts";
import { CaktoError, CaktoNotConfiguredError } from "./errors.ts";

const DEFAULT_API_URL = "https://api.cakto.com.br";

export class CaktoClient {
  private accessToken?: string;
  private tokenExpiresAt = 0;
  readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    this.baseUrl = (Deno.env.get("CAKTO_API_URL") || DEFAULT_API_URL).replace(/\/$/, "");
    this.clientId = Deno.env.get("CAKTO_CLIENT_ID") || "";
    this.clientSecret = Deno.env.get("CAKTO_CLIENT_SECRET") || "";
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  private async authenticate(): Promise<void> {
    if (!this.isConfigured()) throw new CaktoNotConfiguredError();
    const response = await fetch(`${this.baseUrl}/public_api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });
    if (!response.ok) {
      throw new CaktoError("Falha ao autenticar na Cakto.", response.status);
    }
    const token = (await response.json()) as CaktoTokenResponse;
    this.accessToken = token.access_token;
    this.tokenExpiresAt = Date.now() + Math.max(60, (token.expires_in || 3600) - 60) * 1000;
  }

  private async headers(extra?: HeadersInit): Promise<Headers> {
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.authenticate();
    }
    const headers = new Headers(extra);
    headers.set("Authorization", `Bearer ${this.accessToken}`);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    return headers;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = await this.headers(init.headers);
    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    if (!response.ok) {
      throw new CaktoError(`Cakto ${path} falhou (${response.status}).`, response.status);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
}
