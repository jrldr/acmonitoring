import { ACRecord } from '../types';
import { recalculateAllRecords } from './calculations';

export const APPS_SCRIPT_TEMPLATE = `// === AC POWER TRACKER GOOGLE SHEET SYNC SCRIPT ===
// 1. In your Google Sheet, click Extensions > Apps Script
// 2. Delete everything and paste this entire code
// 3. Click "Deploy" > "New deployment"
// 4. Select type: "Web app"
// 5. Description: AC Power Sync
// 6. Execute as: "Me"
// 7. Who has access: "Anyone"
// 8. Click "Deploy", copy the Web App URL, and paste it in the AC App!

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getDisplayValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    
    if (payload.action === 'sync') {
      var rows = payload.rows;
      if (rows && rows.length > 0) {
        sheet.clearContents();
        sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
        sheet.getRange(1, 1, 1, rows[0].length).setFontWeight("bold");
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: rows.length - 1 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export const HEADERS = [
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

/**
 * Normalizes date strings from Google Sheets / CSV without timezone date shifts.
 */
export function normalizeSheetCutoffDate(raw: unknown): string {
  if (!raw) return '';
  let str = String(raw).trim();

  // 1. If it's already a clean YYYY-MM-DD string, keep as-is!
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // 2. If ISO string containing T (e.g. "2024-10-20T16:00:00.000Z")
  // Google Apps Script converts 2024-10-21 00:00:00 (Asia/Manila) into 2024-10-20T16:00:00.000Z
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      // Add 12 hours to account for UTC-to-local offset (e.g. 16:00 UTC = 00:00 next day)
      const adjusted = new Date(d.getTime() + 12 * 3600 * 1000);
      const year = adjusted.getUTCFullYear();
      const month = String(adjusted.getUTCMonth() + 1).padStart(2, '0');
      const day = String(adjusted.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // 3. Handle slash formats e.g. "10/21/2024" or "2024/10/21" or "21/10/2024"
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        let p1 = parseInt(parts[0], 10);
        let p2 = parseInt(parts[1], 10);
        let y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        if (!isNaN(p1) && !isNaN(p2)) {
          if (p1 > 12) {
            // DD/MM/YYYY
            return `${y}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
          } else {
            // MM/DD/YYYY
            return `${y}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
          }
        }
      }
    }
  }

  // 4. Fallback Date parsing
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // keep raw string
  }

  return str;
}

/**
 * Validates Google Apps Script Web App URL format
 */
export function isValidScriptUrl(url: string): boolean {
  if (!url) return false;
  return url.trim().startsWith('https://script.google.com/macros/s/') && url.trim().endsWith('/exec');
}

/**
 * Fetch records from Google Sheet via Apps Script
 */
export async function fetchRecordsFromAppsScript(scriptUrl: string): Promise<ACRecord[]> {
  const url = scriptUrl.trim();
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to contact Google Sheet: HTTP ${res.status}`);
  }

  const raw = await res.json();
  if (!Array.isArray(raw) || raw.length < 2) {
    return [];
  }

  const headers = raw[0].map((h: unknown) => String(h).trim());
  const dateIdx = headers.indexOf('CutoffDate');
  const kwCutoffIdx = headers.indexOf('KW_CutOff');
  const kwMonthIdx = headers.indexOf('KW_Month');
  const rateIdx = headers.indexOf('RatePerKwh');
  const offsetIdx = headers.indexOf('OffsetDays');
  const paymentIdx = headers.indexOf('Payment');

  if (dateIdx === -1 || kwCutoffIdx === -1) {
    throw new Error('Google Sheet is missing required headers: CutoffDate, KW_CutOff');
  }

  const rawRecords: ACRecord[] = [];

  for (let i = 1; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[dateIdx]) continue;

    // Use timezone-aware date normalization
    const cutoffStr = normalizeSheetCutoffDate(row[dateIdx]);

    const rateStr = rateIdx !== -1 && row[rateIdx] !== undefined ? String(row[rateIdx]).trim() : '';
    const rateNum = rateStr && !isNaN(Number(rateStr)) ? Number(rateStr) : null;

    rawRecords.push({
      CutoffDate: cutoffStr,
      KW_CutOff: kwCutoffIdx !== -1 ? Number(row[kwCutoffIdx]) || 0 : 0,
      KW_Month: kwMonthIdx !== -1 ? Number(row[kwMonthIdx]) || 0 : 0,
      KW_Statement: 0,
      RatePerKwh: rateNum,
      Bill: 0,
      CycleDays: 0,
      AveCost_Day: 0,
      OffsetDays: offsetIdx !== -1 ? Number(row[offsetIdx]) || 0 : 0,
      TotalDue: 0,
      Payment: paymentIdx !== -1 ? Number(row[paymentIdx]) || 0 : 0,
      Balance: 0,
    });
  }

  return recalculateAllRecords(rawRecords);
}

/**
 * Pushes all records into Google Sheet via Apps Script
 */
export async function pushRecordsToAppsScript(
  scriptUrl: string,
  records: ACRecord[]
): Promise<void> {
  const url = scriptUrl.trim();

  // Sort records chronologically
  const sorted = [...records].sort(
    (a, b) => new Date(a.CutoffDate).getTime() - new Date(b.CutoffDate).getTime()
  );

  const rows: (string | number)[][] = [HEADERS];

  sorted.forEach((r) => {
    rows.push([
      r.CutoffDate,
      r.KW_CutOff,
      r.KW_Month,
      r.KW_Statement,
      r.RatePerKwh !== null && r.RatePerKwh !== undefined ? r.RatePerKwh : '',
      r.Bill,
      r.CycleDays,
      r.AveCost_Day,
      r.OffsetDays || 0,
      r.TotalDue,
      r.Payment,
      r.Balance,
    ]);
  });

  const payload = {
    action: 'sync',
    rows,
  };

  // Using text/plain avoids CORS preflight OPTIONS check with Google Apps Script
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to sync to Google Sheet: HTTP ${res.status}`);
  }

  const result = await res.json().catch(() => ({ status: 'success' }));
  if (result.status === 'error') {
    throw new Error(result.message || 'Google Sheet update failed');
  }
}
