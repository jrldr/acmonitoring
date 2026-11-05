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
  var data = sheet.getDataRange().getValues();
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

    // Format date in YYYY-MM-DD preserving exact local date (avoiding UTC timezone shift)
    let cutoffStr = String(row[dateIdx]).trim();
    if (cutoffStr.includes('T')) {
      const datePart = cutoffStr.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        cutoffStr = datePart;
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoffStr) && cutoffStr.length > 5) {
      try {
        const d = new Date(cutoffStr);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          cutoffStr = `${year}-${month}-${day}`;
        }
      } catch {
        // keep raw string
      }
    }

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
