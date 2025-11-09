// FIX: Removed self-import of 'FirebaseTimestamp' to resolve the name conflict error. The interface is defined within this file.
export type Shift = 'Day' | 'Night';
export type UserRole = 'owner' | 'supervisor';
export type SubscriptionStatus = 'TRIAL' | 'PAID' | 'EXPIRED' | 'INVALID';

export interface ProductionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  shift: Shift;
  workerName: string;
  taskName: string;
  completedQuantity: number;
  defectQuantity: number;
  pieceRate: number; // in Ks
  basePay: number; // in Ks
  deductionAmount: number; // in Ks
}

export interface Worker {
  id: string;
  name: string;
  position: string;
}

export interface RateCardEntry {
  id: string;
  taskName: string;
  unit: string;
  rate: number; // piece rate in Ks
}

export interface JobPosition {
  englishName: string;
  myanmarName: string;
  notes: string;
}

export interface PaymentLog {
  id: string;
  workerId: string;
  workerName: string;
  date: string; // YYYY-MM-DD
  amount: number; // in Ks
  notes?: string;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type AuditTarget = 'PRODUCTION_ENTRY' | 'WORKER' | 'RATE_CARD' | 'JOB_POSITION' | 'PAYMENT_LOG';

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO 8601 format
  user: UserRole;
  action: AuditAction;
  target: AuditTarget;
  details: string;
}

// From Firebase, but defined here for type safety
export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
}

export interface ClientData {
  clientName: string;
  subscriptionStatus: 'TRIAL' | 'PAID';
  trialEndDate?: FirebaseTimestamp;
  ownerPassword?: string; // Optional field for role security
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
}