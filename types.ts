
export type WorkspaceId = 'A' | 'B' | 'C';

export enum UnitStatus {
  Vacant = 'Vacant',
  Occupied = 'Occupied',
  Maintenance = 'Maintenance'
}

export interface Unit {
  id: string;
  name: string;
  baseRent: number;
  status: UnitStatus;
}

export interface Tenant {
  id: string;
  fullName: string;
  phone: string;
  emergencyContact: string;
  cccd: string;
  notes: string;
  vehiclePlates: string[];
  creditBalance: number; // Tiền thừa/trả trước của khách
}

export enum LeaseStatus {
  Active = 'Active',
  Ended = 'Ended'
}

export interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  months: number;
  endDate: string;
  deposit: number;
  rentMonthly: number;
  adults: number;
  children: number;
  status: LeaseStatus;
}

export interface ElectricReading {
  id: string;
  unitId: string;
  month: string; // YYYY-MM
  startValue: number;
  endValue: number;
  kwh: number;
}

export enum InvoiceStatus {
  Unpaid = 'Unpaid',
  Partial = 'Partial',
  Paid = 'Paid',
  Overdue = 'Overdue'
}

export interface InvoiceLine {
  label: string;
  amount: number;
}

export interface Invoice {
  id: string;
  unitId: string;
  leaseId: string;
  month: string; // YYYY-MM
  dueDate: string;
  lines: InvoiceLine[];
  total: number;
  paid: number;
  remaining: number;
  status: InvoiceStatus;
  missingElectric?: boolean;
}

export interface Payment {
  id: string;
  invoiceId: string;
  tenantId?: string; // Có thể thanh toán trực tiếp cho khách (nạp tiền)
  date: string;
  amount: number;
  method: 'Cash' | 'Bank';
  note: string;
  isCreditTopUp?: boolean; // Đánh dấu là nạp tiền vào tài khoản khách
}

export enum MaintenancePriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export enum MaintenanceStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed'
}

export interface MaintenanceTicket {
  id: string;
  unitId: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  slaDueDate: string;
  repairCost: number;
}

export interface WorkspaceSettings {
  electricityPrice: number;
  waterAdultPrice: number;
  waterChildPrice: number;
  livingFeePerAdult: number;
  defaultDueDay: number;
  allowInvoiceWithoutElectric: boolean;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
}

export interface WorkspaceStore {
  units: Unit[];
  tenants: Tenant[];
  leases: Lease[];
  electricReadings: ElectricReading[];
  invoices: Invoice[];
  payments: Payment[];
  maintenance: MaintenanceTicket[];
  settings: WorkspaceSettings;
}
