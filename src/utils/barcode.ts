import { RECALL_DATABASE, RecallRecord } from '../data/recallDatabase';

/**
 * UPC-E to UPC-A Barcode Expansion Engine
 * Translates 8-digit compact barcodes (e.g. Kit Kat 03424607 -> 034000002467)
 */
export function expandUPCE(upce: string): string | null {
  if (!upce) return null;
  const s = String(upce).replace(/\D/g, '');
  if (s.length !== 8 || (s[0] !== '0' && s[0] !== '1')) return null;

  const numSys = s[0];
  const d1 = s[1];
  const d2 = s[2];
  const d3 = s[3];
  const d4 = s[4];
  const d5 = s[5];
  const d6 = s[6];
  const check = s[7];

  let expanded = null;
  if (d6 === '0' || d6 === '1' || d6 === '2') {
    expanded = numSys + d1 + d2 + d6 + '0000' + d3 + d4 + d5 + check;
  } else if (d6 === '3') {
    expanded = numSys + d1 + d2 + d3 + '00000' + d4 + d5 + check;
  } else if (d6 === '4') {
    expanded = numSys + d1 + d2 + d3 + d4 + '00000' + d5 + check;
  } else {
    expanded = numSys + d1 + d2 + d3 + d4 + d5 + '0000' + d6 + check;
  }
  return expanded;
}

/**
 * Check digit validation for standard UPC-A (12 digits) and EAN-13 (13 digits)
 */
export function isValidBarcodeCheckDigit(rawDigits: string): boolean {
  const digits = String(rawDigits || '').replace(/\D/g, '');
  if (digits.length === 12) {
    // UPC-A
    let oddSum = 0;
    let evenSum = 0;
    for (let i = 0; i < 11; i++) {
      const d = parseInt(digits[i], 10);
      if (i % 2 === 0) oddSum += d;
      else evenSum += d;
    }
    const check = (10 - ((oddSum * 3 + evenSum) % 10)) % 10;
    return check === parseInt(digits[11], 10);
  }
  if (digits.length === 13) {
    // EAN-13
    let oddSum = 0;
    let evenSum = 0;
    for (let i = 0; i < 12; i++) {
      const d = parseInt(digits[i], 10);
      if (i % 2 === 1) oddSum += d;
      else evenSum += d;
    }
    const check = (10 - ((oddSum * 3 + evenSum) % 10)) % 10;
    return check === parseInt(digits[12], 10);
  }
  // Other barcode standards or shorter/longer formats pass through
  return true;
}

/**
 * Find record in RECALL_DATABASE with fallback normalization, UPC-E expansion, and padding
 */
export function findRecallRecord(rawCode: string): RecallRecord | null {
  if (!rawCode) return null;
  const clean = String(rawCode).replace(/\D/g, '');
  if (!clean) return null;

  if (RECALL_DATABASE[clean]) return RECALL_DATABASE[clean];

  // Algorithmic UPC-E expansion
  const upceExpanded = expandUPCE(clean);
  if (upceExpanded && RECALL_DATABASE[upceExpanded]) return RECALL_DATABASE[upceExpanded];

  const withZero = clean.startsWith('0') ? clean : '0' + clean;
  if (RECALL_DATABASE[withZero]) return RECALL_DATABASE[withZero];

  const strippedZero = clean.replace(/^0+/, '');
  if (RECALL_DATABASE[strippedZero]) return RECALL_DATABASE[strippedZero];

  const pad12 = clean.padStart(12, '0');
  if (RECALL_DATABASE[pad12]) return RECALL_DATABASE[pad12];

  const pad13 = clean.padStart(13, '0');
  if (RECALL_DATABASE[pad13]) return RECALL_DATABASE[pad13];

  for (const [key, val] of Object.entries(RECALL_DATABASE)) {
    if (key.length >= 10 && (clean.includes(key) || key.includes(clean))) {
      return val;
    }
  }

  return null;
}
