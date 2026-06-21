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
  fullName: string;
  phone?: string;
  rut?: string;
  subscriptionStatus?: SubscriptionStatus;
}

export interface UpdateStaffAccountInput {
  active?: boolean;
  fullName?: string;
  phone?: string | null;
  rut?: string | null;
  subscriptionStatus?: SubscriptionStatus;
}
