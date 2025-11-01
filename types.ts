export interface Worker {
  workerId: string;
  workerName: string;
  jobPosition: string;
  pieceRateKs: number;
  productType: string;
}

export interface ProductionEntry {
  id: string;
  date: string;
  shift: 'Day' | 'Night';
  workerName: string;
  jobPosition: string;
  completedQuantity: number;
  defectQuantity: number;
  // Layer 3: Calculated fields
  pieceRate: number;
  basePay: number;
  deductionAmount: number;
}