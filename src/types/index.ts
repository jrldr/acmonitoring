export interface ACRecord {
  CutoffDate: string; // YYYY-MM-DD
  KW_CutOff: number;
  KW_Month: number;
  KW_Statement: number;
  RatePerKwh: number | null; // null or empty means inherited from previous record
  Bill: number;
  CycleDays: number;
  AveCost_Day: number;
  OffsetDays: number;
  TotalDue: number;
  Payment: number;
  Balance: number;
}

export interface RecordInput {
  CutoffDate: string;
  KW_CutOff: number | string;
  KW_Month?: number | string;
  RatePerKwh?: number | string;
  OffsetDays?: number | string;
  Payment?: number | string;
}

export type ViewTab = 'dashboard' | 'ledger' | 'analytics' | 'estimator';

export type TimeRange = '6m' | '12m' | 'all';
