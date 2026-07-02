import type { SubscriptionStatus } from "@prisma/client";

export type StaffRealm = "admin" | "executive";

export interface StaffAccountRecord {
  id: string;
  realm: StaffRealm;
  email: string;
  fullName: string;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  phone?: string | null;
  rut?: string | null;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionExpiresAt?: string | null;
}

export interface CreateStaffAccountInput {
  realm: StaffRealm;
  email: string;
  /** Opcional al invitar; se completa en la activación. */
  fullName?: string;
  phone?: string;
  rut?: string;
  subscriptionStatus?: SubscriptionStatus;
}

export interface PendingStaffInviteRecord {
  id: string;
  email: string;
  realm: StaffRealm;
  rut: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface UpdateStaffAccountInput {
  active?: boolean;
  fullName?: string;
  phone?: string | null;
  rut?: string | null;
  subscriptionStatus?: SubscriptionStatus;
}
