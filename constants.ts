
import { WorkspaceSettings, WorkspaceStore } from './types';

export const WORKSPACES = [
  { id: 'A', name: 'Cơ sở A' },
  { id: 'B', name: 'Cơ sở B' },
  { id: 'C', name: 'Cơ sở C' }
] as const;

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  electricityPrice: 3500,
  waterAdultPrice: 100000,
  waterChildPrice: 50000,
  livingFeePerAdult: 50000,
  defaultDueDay: 5,
  allowInvoiceWithoutElectric: false,
  bankName: '',
  bankAccount: '',
  bankOwner: ''
};

export const INITIAL_STORE: WorkspaceStore = {
  units: [],
  tenants: [],
  leases: [],
  electricReadings: [],
  invoices: [],
  payments: [],
  maintenance: [],
  settings: DEFAULT_SETTINGS
};
