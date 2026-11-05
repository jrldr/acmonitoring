import { ACRecord, RecordInput } from '../types';

/**
 * Re-calculates the complete sequence of records chronologically,
 * exactly preserving the billing logic from the user's PHP application.
 */
export function recalculateAllRecords(rawRecords: ACRecord[]): ACRecord[] {
  // Sort chronologically ascending by CutoffDate
  const sorted = [...rawRecords].sort((a, b) => {
    return new Date(a.CutoffDate).getTime() - new Date(b.CutoffDate).getTime();
  });

  let effectiveRatePrev = 0;
  const results: ACRecord[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const row = sorted[i];
    const prevRow = i > 0 ? results[i - 1] : null;

    const prevKWMonth = prevRow ? Number(prevRow.KW_Month) || 0 : 0;
    const prevKWCutOff = prevRow ? Number(prevRow.KW_CutOff) || 0 : 0;

    const currKWCutOff = Number(row.KW_CutOff) || 0;
    const offsetDays = Number(row.OffsetDays) || 0;

    // Days from start of month to cutoff date (e.g. 21 for 2026-09-21)
    const dateParts = row.CutoffDate.split('-');
    let daysStartToCutoff = dateParts.length === 3 ? parseInt(dateParts[2], 10) : 1;
    if (isNaN(daysStartToCutoff) || daysStartToCutoff <= 0) {
      daysStartToCutoff = 1;
    }

    // KW_Statement calculation:
    // Carryover kWh from previous cycle cutoff to end of previous month = (prevKWMonth - prevKWCutOff)
    // If prevKWMonth was unrecorded (0) or less than cutoff, carryover is 0
    let carryOverKW = 0;
    if (prevKWMonth > 0 && prevKWMonth >= prevKWCutOff) {
      carryOverKW = prevKWMonth - prevKWCutOff;
    }
    const offsetAdjustment = offsetDays * (currKWCutOff / daysStartToCutoff);
    const kwStatementRaw = carryOverKW + currKWCutOff + offsetAdjustment;
    const kwStatement = Math.round(kwStatementRaw * 100) / 100;

    // CycleDays
    let cycleDays = daysStartToCutoff;
    if (prevRow) {
      const prevTime = new Date(`${prevRow.CutoffDate}T00:00:00`).getTime();
      const currTime = new Date(`${row.CutoffDate}T00:00:00`).getTime();
      const diffDays = Math.round(Math.abs(currTime - prevTime) / (86400 * 1000));
      cycleDays = diffDays > 0 ? diffDays : 1;
    }
    if (cycleDays <= 0) cycleDays = 1;

    // Rate & Bill
    const rateVal = row.RatePerKwh;
    let usedRate = 0;
    if (rateVal !== null && rateVal !== undefined && !isNaN(Number(rateVal)) && Number(rateVal) > 0) {
      usedRate = Number(rateVal);
      effectiveRatePrev = usedRate;
    } else {
      usedRate = effectiveRatePrev;
    }

    const bill = Math.round(kwStatement * usedRate * 100) / 100;

    // AveCost_Day
    const aveCostDay = Math.round((bill / cycleDays) * 100) / 100;

    // TotalDue & Balance: ALWAYS use previous record's freshly calculated Balance!
    const prevBalance = prevRow ? prevRow.Balance : 0;
    const totalDue = Math.round((bill + prevBalance) * 100) / 100;
    const payment = Number(row.Payment) || 0;
    const balance = Math.round((totalDue - payment) * 100) / 100;

    results.push({
      CutoffDate: row.CutoffDate,
      KW_CutOff: currKWCutOff,
      KW_Month: Number(row.KW_Month) || 0,
      KW_Statement: kwStatement,
      RatePerKwh: row.RatePerKwh,
      Bill: bill,
      CycleDays: cycleDays,
      AveCost_Day: aveCostDay,
      OffsetDays: offsetDays,
      TotalDue: totalDue,
      Payment: payment,
      Balance: balance,
    });
  }

  return results;
}

/**
 * Preview calculated values for a draft entry before saving
 */
export function computePreview(
  input: RecordInput,
  existingRecords: ACRecord[],
  editingDate?: string
): {
  kwStatement: number;
  cycleDays: number;
  usedRate: number;
  bill: number;
  totalDue: number;
  balance: number;
  aveCostDay: number;
} {
  const cutoffDate = input.CutoffDate;
  if (!cutoffDate) {
    return {
      kwStatement: 0,
      cycleDays: 30,
      usedRate: 0,
      bill: 0,
      totalDue: 0,
      balance: 0,
      aveCostDay: 0,
    };
  }

  // Filter out the record being edited if any
  const otherRecords = editingDate
    ? existingRecords.filter((r) => r.CutoffDate !== editingDate)
    : [...existingRecords];

  // Construct draft record
  const draftRate =
    input.RatePerKwh !== undefined && input.RatePerKwh !== '' && !isNaN(Number(input.RatePerKwh)) && Number(input.RatePerKwh) > 0
      ? Number(input.RatePerKwh)
      : null;

  const draftRecord: ACRecord = {
    CutoffDate: cutoffDate,
    KW_CutOff: Number(input.KW_CutOff) || 0,
    KW_Month: Number(input.KW_Month) || 0,
    KW_Statement: 0,
    RatePerKwh: draftRate,
    Bill: 0,
    CycleDays: 0,
    AveCost_Day: 0,
    OffsetDays: Number(input.OffsetDays) || 0,
    TotalDue: 0,
    Payment: Number(input.Payment) || 0,
    Balance: 0,
  };

  const recomputed = recalculateAllRecords([...otherRecords, draftRecord]);
  const calculated = recomputed.find((r) => r.CutoffDate === cutoffDate);

  if (!calculated) {
    return {
      kwStatement: 0,
      cycleDays: 30,
      usedRate: 0,
      bill: 0,
      totalDue: 0,
      balance: 0,
      aveCostDay: 0,
    };
  }

  return {
    kwStatement: calculated.KW_Statement,
    cycleDays: calculated.CycleDays,
    usedRate: calculated.RatePerKwh || (calculated.KW_Statement > 0 ? calculated.Bill / calculated.KW_Statement : 0),
    bill: calculated.Bill,
    totalDue: calculated.TotalDue,
    balance: calculated.Balance,
    aveCostDay: calculated.AveCost_Day,
  };
}

/**
 * Format currency in Philippine Peso (₱)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₱0.00';
  return `₱${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format kilowatt hours
 */
export function formatKwh(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0.00';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format month label (e.g., "Sep 2026")
 */
export function formatMonthLabel(dateString: string): string {
  try {
    const d = new Date(`${dateString}T00:00:00`);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

/**
 * Parse CSV text into records
 */
export function parseCSV(csvText: string): ACRecord[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const dateIdx = headers.indexOf('CutoffDate');
  const kwCutoffIdx = headers.indexOf('KW_CutOff');
  const kwMonthIdx = headers.indexOf('KW_Month');
  const rateIdx = headers.indexOf('RatePerKwh');
  const offsetIdx = headers.indexOf('OffsetDays');
  const paymentIdx = headers.indexOf('Payment');

  if (dateIdx === -1 || kwCutoffIdx === -1) {
    throw new Error('CSV missing required headers (CutoffDate, KW_CutOff)');
  }

  const rawRecords: ACRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',');

    const cutoffDate = cols[dateIdx]?.trim();
    if (!cutoffDate) continue;

    const rateStr = rateIdx !== -1 ? cols[rateIdx]?.trim() : '';
    const rateNum = rateStr && !isNaN(Number(rateStr)) ? Number(rateStr) : null;

    rawRecords.push({
      CutoffDate: cutoffDate,
      KW_CutOff: Number(cols[kwCutoffIdx]) || 0,
      KW_Month: kwMonthIdx !== -1 ? Number(cols[kwMonthIdx]) || 0 : 0,
      KW_Statement: 0,
      RatePerKwh: rateNum,
      Bill: 0,
      CycleDays: 0,
      AveCost_Day: 0,
      OffsetDays: offsetIdx !== -1 ? Number(cols[offsetIdx]) || 0 : 0,
      TotalDue: 0,
      Payment: paymentIdx !== -1 ? Number(cols[paymentIdx]) || 0 : 0,
      Balance: 0,
    });
  }

  return recalculateAllRecords(rawRecords);
}

/**
 * Export records to standard CSV
 */
export function exportToCSV(records: ACRecord[]): string {
  const headers = [
    'CutoffDate',
    'KW_CutOff',
    'KW_Month',
    'KW_Statement',
    'RatePerKwh',
    'Bill',
    'CycleDays',
    'AveCost_Day',
    'OffsetDays',
    'TotalDue',
    'Payment',
    'Balance',
  ];

  const rows = records.map((r) => [
    r.CutoffDate,
    r.KW_CutOff,
    r.KW_Month,
    r.KW_Statement,
    r.RatePerKwh ?? '',
    r.Bill,
    r.CycleDays,
    r.AveCost_Day,
    r.OffsetDays || '',
    r.TotalDue,
    r.Payment,
    r.Balance,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
