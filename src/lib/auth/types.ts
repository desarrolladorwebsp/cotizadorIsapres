import type { SubscriptionStatus } from "@prisma/client";
import type { AuthRealm } from "@/lib/auth/constants";

export interface SessionPayload {
  sub: string;
  email: string;
  realm: AuthRealm;
  iat: number;
  exp: number;
}

export interface AdminSessionUser {
  id: string;
  email: string;
  fullName: string;
}

export interface ExecutiveSessionUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: string | null;
  subscriptionActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
