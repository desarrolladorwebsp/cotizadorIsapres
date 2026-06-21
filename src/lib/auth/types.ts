import type { SubscriptionStatus } from "@prisma/client";
import type { AuthRealm } from "@/lib/auth/constants";

export interface SessionPayload {
  sub: string;
  email: string;
  realm: AuthRealm;
  mustChangePassword: boolean;
  iat: number;
  exp: number;
}

export interface AdminSessionUser {
  id: string;
  email: string;
  fullName: string;
  mustChangePassword: boolean;
}

export interface ExecutiveSessionUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: string | null;
  subscriptionActive: boolean;
  mustChangePassword: boolean;
}

export interface LoginResponseUser {
  mustChangePassword: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
