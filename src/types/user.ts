export type UserRole = "CLIENT" | "EXECUTIVE" | "ADMIN";

export interface UserRecord {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  rut: string | null;
  role: UserRole;
  active: boolean;
  assignedExecutiveId?: string | null;
  assignedExecutiveName?: string | null;
  createdAt: string;
  updatedAt: string;
}
