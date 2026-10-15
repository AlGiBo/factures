import { Invoice, InvoiceStatus, ColumnMapping, SheetTabInfo } from '../types/invoice';

/**
 * Extracts a spreadsheet ID from a Google Sheets URL or raw ID string.
 */
export function extractSpreadsheetId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Pattern matches: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // If it's directly an ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Fetches sheet tabs metadata using Google Sheets API v4.
 */
export async function fetchSpreadsheetTabs(
  spreadsheetId: string,
  accessToken: string
): Promise<SheetTabInfo[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error en carregar informació del full (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const sheets = data.sheets || [];

  return sheets.map((item: any) => ({
    sheetId: item.properties?.sheetId ?? 0,
    title: item.properties?.title || 'Full1',
    rowCount: item.properties?.gridProperties?.rowCount,
    columnCount: item.properties?.gridProperties?.columnCount,
  }));
}

/**
 * Fetches rows from a specific tab using Google Sheets API v4.
 */
export async function fetchSheetValues(
  spreadsheetId: string,
  sheetTitle: string,
  accessToken: string
): Promise<string[][]> {
  const encodedTitle = encodeURIComponent(sheetTitle);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodedTitle}'!A1:ZZ10000`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error en obtenir les files del full (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.values || [];
}

/**
 * Fetches sheet rows via public Google Visualization CSV export endpoint
 * (useful if a sheet is shared publicly without requiring sign-in).
 */
export async function fetchPublicSheetCsv(
  spreadsheetId: string,
  sheetTitle?: string
): Promise<string[][]> {
  const sheetParam = sheetTitle ? `&sheet=${encodeURIComponent(sheetTitle)}` : '';
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv${sheetParam}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`No s'ha pogut obtenir el full públic (${res.status})`);
  }
  const csvText = await res.text();
  return parseCsv(csvText);
}

/**
 * Robust CSV parser handling quoted cells and multiline.
 */
export function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c !== '')) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      lines.push(currentRow);
    }
  }

  return lines;
}

/**
 * Detects matching columns based on common Catalan, Spanish, and English terms.
 */
export function detectColumnMapping(headers: string[]): ColumnMapping {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const cleanedHeaders = headers.map(clean);

  const findBestMatch = (candidates: string[]): string => {
    for (const cand of candidates) {
      const idx = cleanedHeaders.findIndex((h) => h === cand || h.includes(cand));
      if (idx !== -1) {
        return headers[idx];
      }
    }
    return '';
  };

  return {
    number: findBestMatch(['numfactura', 'num', 'factura', 'nro', 'numero', 'invoice', 'codi', 'referencia', 'ref']),
    date: findBestMatch(['datafactura', 'data', 'fecha', 'fechafactura', 'date', 'dia', 'emissio']),
    vendor: findBestMatch(['proveidor', 'proveedor', 'vendor', 'emissor', 'empresa', 'nom', 'client', 'supplier']),
    concept: findBestMatch(['concepte', 'descripcio', 'concepto', 'descripcion', 'description', 'detall', 'item']),
    category: findBestMatch(['categoria', 'category', 'tipus', 'departament', 'classificacio', 'tag']),
    baseAmount: findBestMatch(['baseimposable', 'base', 'subtotal', 'net', 'neto']),
    taxAmount: findBestMatch(['importiva', 'iva', 'impost', 'tax', 'vat', 'cuotaiva']),
    totalAmount: findBestMatch(['total', 'importtotal', 'import', 'importe', 'muntant', 'amount', 'preutotal']),
    status: findBestMatch(['estat', 'estado', 'status', 'situacio', 'pagat', 'pagada']),
    dueDate: findBestMatch(['venciment', 'datavenciment', 'fechavencimiento', 'vencimiento', 'duedate']),
    paymentDate: findBestMatch(['datapagament', 'fechapago', 'pagatdia', 'paymentdate']),
    paymentMethod: findBestMatch(['metodepagament', 'formapago', 'metodopago', 'metode', 'paymentmethod']),
    notes: findBestMatch(['observacions', 'notes', 'notas', 'comentaris', 'comentarios']),
  };
}

/**
 * Cleans string and parses numeric amount (e.g. "1.250,50 €" -> 1250.50).
 */
export function parseAmount(val: string | number | undefined | null): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;

  let s = String(val).trim();
  // Remove currency symbols & spaces
  s = s.replace(/[€$£\s]/g, '');

  // Detect European notation: 1.250,50 vs US notation 1,250.50
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      // European: dots are thousands, comma is decimal
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // US: commas are thousands, dot is decimal
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    // Only comma present, check if it's decimal
    s = s.replace(',', '.');
  }

  const num = parseFloat(s);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

/**
 * Normalizes dates to YYYY-MM-DD.
 */
export function normalizeDate(val: string | number | undefined | null): string {
  if (!val) {
    return new Date().toISOString().split('T')[0];
  }

  const s = String(val).trim();

  // Excel serial date number (e.g. 45290 -> ~2024)
  if (/^\d{5}$/.test(s)) {
    const serial = parseInt(s, 10);
    const date = new Date((serial - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  // Matches YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(s)) {
    const parts = s.split(/[-/.]/);
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }

  // Matches DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(s)) {
    const parts = s.split(/[-/.]/);
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }

  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Normalizes status into standardized union.
 */
export function normalizeStatus(val: string | undefined | null): InvoiceStatus {
  if (!val) return 'paid';
  const s = String(val).toLowerCase().trim();

  if (s.includes('pend') || s.includes('pendent') || s.includes('no') || s.includes('unpaid')) {
    return 'pending';
  }
  if (s.includes('venç') || s.includes('venc') || s.includes('overdue') || s.includes('caduc')) {
    return 'overdue';
  }
  if (s.includes('anul') || s.includes('cancel') || s.includes('rebutj')) {
    return 'cancelled';
  }
  return 'paid';
}

/**
 * Parses raw 2D array of rows into structured Invoices.
 */
export function parseSheetDataToInvoices(
  rows: string[][],
  customMapping?: Partial<ColumnMapping>
): { invoices: Invoice[]; headers: string[]; mapping: ColumnMapping } {
  if (!rows || rows.length < 2) {
    return { invoices: [], headers: [], mapping: detectColumnMapping([]) };
  }

  // Find header row (first non-empty row)
  let headerRowIndex = 0;
  while (headerRowIndex < rows.length && rows[headerRowIndex].every((c) => !c || c.trim() === '')) {
    headerRowIndex++;
  }

  const headers = rows[headerRowIndex].map((h) => h?.trim() || '');
  const detected = detectColumnMapping(headers);
  const mapping: ColumnMapping = {
    ...detected,
    ...customMapping,
  };

  const getColIndex = (colName: string) => {
    if (!colName) return -1;
    return headers.findIndex((h) => h.toLowerCase() === colName.toLowerCase());
  };

  const numIdx = getColIndex(mapping.number);
  const dateIdx = getColIndex(mapping.date);
  const vendorIdx = getColIndex(mapping.vendor);
  const conceptIdx = getColIndex(mapping.concept);
  const catIdx = getColIndex(mapping.category);
  const baseIdx = getColIndex(mapping.baseAmount);
  const taxIdx = getColIndex(mapping.taxAmount);
  const totalIdx = getColIndex(mapping.totalAmount);
  const statusIdx = getColIndex(mapping.status);
  const dueIdx = getColIndex(mapping.dueDate);
  const payDateIdx = getColIndex(mapping.paymentDate);
  const payMethodIdx = getColIndex(mapping.paymentMethod);
  const notesIdx = getColIndex(mapping.notes);

  const invoices: Invoice[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c || c.trim() === '')) {
      continue;
    }

    const number = numIdx !== -1 && row[numIdx] ? row[numIdx].trim() : `FAC-${i}`;
    const rawDate = dateIdx !== -1 ? row[dateIdx] : '';
    const date = normalizeDate(rawDate);
    const vendor = vendorIdx !== -1 && row[vendorIdx] ? row[vendorIdx].trim() : 'Proveïdor desconegut';
    const concept = conceptIdx !== -1 && row[conceptIdx] ? row[conceptIdx].trim() : 'Sense concepte';
    let category = catIdx !== -1 && row[catIdx] ? row[catIdx].trim() : '';

    if (!category) {
      category = guessCategory(vendor, concept);
    }

    const baseAmount = baseIdx !== -1 ? parseAmount(row[baseIdx]) : 0;
    const taxAmount = taxIdx !== -1 ? parseAmount(row[taxIdx]) : 0;
    let totalAmount = totalIdx !== -1 ? parseAmount(row[totalIdx]) : 0;

    // Fallbacks if total is missing
    if (totalAmount === 0 && (baseAmount > 0 || taxAmount > 0)) {
      totalAmount = Math.round((baseAmount + taxAmount) * 100) / 100;
    }

    const status = statusIdx !== -1 ? normalizeStatus(row[statusIdx]) : 'paid';

    // Build raw row record for inspection
    const rawRow: Record<string, string> = {};
    headers.forEach((h, hIdx) => {
      if (h) rawRow[h] = row[hIdx] || '';
    });

    invoices.push({
      id: `inv-${i}-${Math.random().toString(36).substring(2, 7)}`,
      number,
      date,
      vendor,
      concept,
      category,
      baseAmount: baseAmount || Math.round((totalAmount / 1.21) * 100) / 100,
      taxAmount: taxAmount || Math.round((totalAmount - totalAmount / 1.21) * 100) / 100,
      totalAmount,
      status,
      dueDate: dueIdx !== -1 && row[dueIdx] ? normalizeDate(row[dueIdx]) : undefined,
      paymentDate: payDateIdx !== -1 && row[payDateIdx] ? normalizeDate(row[payDateIdx]) : undefined,
      paymentMethod: payMethodIdx !== -1 ? row[payMethodIdx]?.trim() : undefined,
      notes: notesIdx !== -1 ? row[notesIdx]?.trim() : undefined,
      rawRow,
    });
  }

  return { invoices, headers, mapping };
}

/**
 * Intelligent category guesser based on vendor names & concepts.
 */
function guessCategory(vendor: string, concept: string): string {
  const text = `${vendor} ${concept}`.toLowerCase();
  if (text.match(/lloguer|coworking|oficina|planta|edifici|lloc/)) return 'Lloguer & Seu';
  if (text.match(/endesa|naturgy|ibredrola|llum|aigua|gas|electric|clima/)) return 'Subministraments';
  if (text.match(/aws|google cloud|microsoft|github|slack|notion|saas|software|host|domini|licen/)) return 'Software & SaaS';
  if (text.match(/gestor|advocat|assessor|legal|notari|banc|comissio/)) return 'Assessoria & Legal';
  if (text.match(/ads|publicitat|marketing|marqueting|meta|instagram|facebook|campanya|disseny|logo/)) return 'Màrqueting & Publicitat';
  if (text.match(/ordinador|portatil|dell|apple|lenovo|pantalla|servidor|hardware|impres/)) return 'Equipament & Hardware';
  if (text.match(/paper|toner|lyreco|amazon|boligraf|material/)) return 'Material d\'Oficina';
  if (text.match(/renfe|ave|vueling|iberia|taxi|vol|hotel|allotjament|viatg/)) return 'Viatges & Transports';
  if (text.match(/telefon|movil|movistar|vodafone|orange|fibra|internet/)) return 'Telecomunicacions';
  return 'Despeses Generals';
}
