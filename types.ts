// FIX: Removed self-import of 'FirebaseTimestamp' to resolve the name conflict error. The interface is defined within this file.
export type Shift = 'Day' | 'Night';
export type UserRole = 'owner' | 'supervisor';
export type SubscriptionStatus = 'TRIAL' | 'PAID' | 'EXPIRED' | 'INVALID';

export interface ProductionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  shift: Shift;
  workerName: string; // This is OK for a "log" - it's a snapshot in time
  taskName: string;   // This is also OK for a "log"
  completedQuantity: number;
  defectQuantity: number;
  pieceRate: number; // in Ks
  basePay: number; // in Ks
  deductionAmount: number; // in Ks
}

// === ပြင်ဆင်မှု ၁ ===
// "position: string" (နာမည်) အစား "positionId: string" (ID) ကို သုံးပါမယ်။
export interface Worker {
  id: string;
  name: string;
  positionId: string; // <--- THIS IS THE FIX
}

export interface RateCardEntry {
  id: string;
  taskName: string;
  unit: string;
  rate: number; // piece rate in Ks
}

// === ပြင်ဆင်မှု ၂ ===
// JobPosition ကို သူ့ရဲ့ ကိုယ်ပိုင် "id" တစ်ခု ထည့်ပေးလိုက်ပါတယ်။
export interface JobPosition {
  id: string; // <--- THIS IS THE FIX (e.g., "jp_001" or a random Firestore ID)
  englishName: string;
  myanmarName: string;
  notes: string;
}

export interface PaymentLog {
  id: string;
  workerId: string;
  workerName: string; // This is OK for a "log"
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
  ownerPassword?: string; // Optional field for backward compatibility
  ownerEmail?: string; // Email of the account owner (used for Firebase Auth)
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
}