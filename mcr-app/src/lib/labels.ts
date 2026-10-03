import type {
  ClientType,
  CostCategory,
  EquipmentStatus,
  ExpenseStatus,
  PaymentMethod,
  ProjectStatus,
  ProjectType,
  Role,
} from "@prisma/client";

export const ROLES: Record<Role, string> = {
  ADMIN: "Admin",
  FINANCE: "Finance",
  SITE_MANAGER: "Site manager",
  VIEWER: "Viewer",
};

export const CLIENT_TYPES: Record<ClientType, string> = {
  GOVERNMENT: "Government",
  NGO: "NGO",
  UN_AGENCY: "UN agency",
  PRIVATE: "Private",
};

export const PROJECT_TYPES: Record<ProjectType, string> = {
  NEW_BUILD: "New build",
  REHABILITATION: "Rehabilitation",
  ROADS: "Roads",
  WATER_SANITATION: "Water & sanitation",
  OTHER: "Other",
};

export const PROJECT_STATUSES: Record<ProjectStatus, string> = {
  TENDER: "Tender",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const COST_CATEGORIES: Record<CostCategory, string> = {
  MATERIALS: "Materials",
  LABOUR: "Labour",
  EQUIPMENT: "Equipment",
  SUBCONTRACT: "Subcontractors",
  TRANSPORT: "Transport",
  SECURITY: "Security",
  PERMITS: "Permits & fees",
  OVERHEAD: "Overhead",
  OTHER: "Other",
};

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  BANK: "Bank transfer",
  EVC_PLUS: "EVC Plus",
  ZAAD: "Zaad",
  SAHAL: "Sahal",
  CHEQUE: "Cheque",
};

export const EXPENSE_STATUSES: Record<ExpenseStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  PAID: "Paid",
  REJECTED: "Rejected",
};

export const EQUIPMENT_STATUSES: Record<EquipmentStatus, string> = {
  AVAILABLE: "Available",
  ON_SITE: "On site",
  MAINTENANCE: "Maintenance",
  RETIRED: "Retired",
};

export function oneOf<T extends string>(map: Record<T, string>, v: FormDataEntryValue | null): T {
  const s = String(v ?? "");
  if (!(s in map)) throw new Error(`Invalid value: ${s}`);
  return s as T;
}
