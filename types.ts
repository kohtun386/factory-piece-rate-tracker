export type Shift = 'Day' | 'Night';
export type UserRole = 'owner' | 'supervisor';

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
