import type { StaffRole } from "@prisma/client";
import type { StaffRealm } from "@/types/staff-account";

export function staffRoleToRealm(role: StaffRole): StaffRealm {
  return role === "ADMIN" ? "admin" : "executive";
}

export function staffRealmToRole(realm: StaffRealm): StaffRole {
  return realm === "admin" ? "ADMIN" : "EXECUTIVE";
}

export function isExecutiveRole(role: StaffRole): boolean {
  return role === "EXECUTIVE";
}

export function isAdminRole(role: StaffRole): boolean {
  return role === "ADMIN";
}
