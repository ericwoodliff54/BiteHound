import { RECALL_DATABASE, STAPLES_CATALOG_EMBEDDED, RecallRecord } from '../data/recallDatabase';
import { NATIONAL_BULLETINS } from '../data/nationalBulletins';
import { ALLERGEN_OPTIONS } from '../data/allergens';
import { expandUPCE, findRecallRecord } from './barcode';
import { auditFoodAdditives } from './additives';
import { parseAllergensFromText } from './allergens';
import { FDACachedRecall, FamilyProfile, ProductResult } from '../types';

let staplesCatalog: Record<string, Partial<RecallRecord>> = { ...STAPLES_CATALOG_EMBEDDED };

// Attempt to load external staples_catalog.json if available
export async function initStaplesCatalog() {
  try {
    const res = await fetch('/staples_catalog.json');
    if (res.ok) {
      const data = await res.json();
      staplesCatalog = { ...staplesCatalog, ...data };
    }
  } catch (e) {
    console.warn('Staples catalog hydration fallback:', e);
  }
}

export function getCatalogProduct(rawCode: string): Partial<RecallRecord> | null {
  const code = String(rawCode || '').replace(/\D/g, '');
  if (!code) return null;
  if (staplesCatalog[code]) return staplesCatalog[code];

  const upce = expandUPCE(code);
  if (upce && staplesCatalog[upce]) return staplesCatalog[upce];

  const withZero = code.startsWith('0') ? code : '0' + code;
  if (staplesCatalog[withZero]) return staplesCatalog[withZero];

  const strippedZero = code.replace(/^0+/, '');
  if (staplesCatalog[strippedZero]) return staplesCatalog[strippedZero];

  return null;
}

export function getCachedFDARecalls(): FDACachedRecall[] {
  try {
    const saved = localStorage.getItem('safebite_cached_recalls');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function getLastSyncTimestamp(): number | null {
  try {
    const saved = localStorage.getItem('safebite_last_sync_time');
    if (saved) return parseInt(saved, 10);
  } catch {}
  return null;
}

export async function syncFDARecalls(forceManual = false): Promise<{ count: number; recalls: FDACachedRecall[] }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const cached = getCachedFDARecalls();
    return { count: cached.length, recalls: cached };
  }

  const lastSync = getLastSyncTimestamp();
  if (!forceManual && lastSync && Date.now() - lastSync < 20 * 60 * 1000) {
    const cached = getCachedFDARecalls();
    return { count: cached.length, recalls: cached };
  }

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 6500);

  try {
    const res = await fetch(
      'https://api.fda.gov/food/enforcement.json?limit=150&sort=recall_initiation_date:desc',
      { signal: ctrl.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const parsed: FDACachedRecall[] = [];
        for (const r of data.results) {
          const textBlob = `${r.code_info || ''} ${r.product_description || ''}`;
          const upcMatches = textBlob.match(/\b\d{10,14}\b/g) || [];
          let fdaDate = 'Recent Notice';
          if (r.recall_initiation_date && r.recall_initiation_date.length === 8) {
            const y = r.recall_initiation_date.slice(0, 4);
            const m = r.recall_initiation_date.slice(4, 6);
            const d = r.recall_initiation_date.slice(6, 8);
            fdaDate = `${m}/${d}/${y}`;
          }

          parsed.push({
            id: r.recall_number || Math.random().toString(),
            product: r.product_description || 'Grocery Item',
            brand: r.recalling_firm || 'Food Brand',
            reason: r.reason_for_recall || 'Federal health and safety recall notice.',
            severity: r.classification || 'Class I Alert',
            date: fdaDate,
            status: r.status || 'Ongoing',
            upcs: upcMatches,
            raw: (r.product_description + ' ' + r.recalling_firm + ' ' + (r.code_info || '')).toLowerCase(),
          });
        }

        try {
          localStorage.setItem('safebite_cached_recalls', JSON.stringify(parsed));
          localStorage.setItem('safebite_last_sync_time', Date.now().toString());
        } catch {}

        return { count: parsed.length, recalls: parsed };
      }
    }
  } catch (err) {
    console.warn('FDA Auto-sync fallback to local cache:', err);
  }

  const cached = getCachedFDARecalls();
  return { count: cached.length, recalls: cached };
}

/**
 * Full Lookup Pipeline for any Barcode / UPC
 */
export async function processBarcode(
  rawCode: string,
  profiles: FamilyProfile[],
  isPlus: boolean,
  source: 'scanner' | 'manual' = 'scanner'
): Promise<ProductResult> {
  const code = String(rawCode).replace(/\D/g, '');
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const timestamp = `${dateStr} • ${timeStr}`;

  let productName = `Retail Grocery Item (${code})`;
  let brandName = 'Grocery Brand';
  let isRecalled = false;
  let recallRecord = findRecallRecord(code);
  let terminatedNotice = null;
  const detectedAllergenIds: string[] = [];
  let ingredientsSummary = '';
  const productAdditivesTags: string[] = [];
  let offProductData: Record<string, any> | null = null;
  let stores: string[] = [];
  let states: string[] = [];

  // 1. Check local pre-indexed recall database
  if (recallRecord) {
    productName = recallRecord.product;
    brandName = recallRecord.brand;
    isRecalled = Boolean(recallRecord.isRecalled);
    if (recallRecord.allergens) detectedAllergenIds.push(...recallRecord.allergens);
    if (recallRecord.ingredients) ingredientsSummary = recallRecord.ingredients;
    if (recallRecord.additives_tags) productAdditivesTags.push(...recallRecord.additives_tags);
    if (recallRecord.stores) stores = recallRecord.stores;
    if (recallRecord.states) states = recallRecord.states;
  }

  // 2. Check staples catalog
  if (!recallRecord || (!ingredientsSummary && !recallRecord.isRecalled)) {
    const staple = getCatalogProduct(code);
    if (staple) {
      if (!recallRecord) {
        productName = staple.product || productName;
        brandName = staple.brand || brandName;
        isRecalled = Boolean(staple.isRecalled);
      }
      if (staple.allergens) detectedAllergenIds.push(...staple.allergens);
      if (staple.ingredients && !ingredientsSummary) ingredientsSummary = staple.ingredients;
      if (staple.additives_tags) productAdditivesTags.push(...staple.additives_tags);
      if (staple.stores && stores.length === 0) stores = staple.stores;
    }
  }

  // 3. Online Lookups if not in local recall DB
  if (!recallRecord && typeof navigator !== 'undefined' && navigator.onLine) {
    const qCode = code.startsWith('0') ? code.replace(/^0+/, '') : code;

    // A. Open Food Facts
    try {
      const offCtrl = new AbortController();
      const offTimeout = setTimeout(() => offCtrl.abort(), 2800);
      const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${qCode}.json`, {
        signal: offCtrl.signal,
      });
      clearTimeout(offTimeout);

      if (offRes.ok) {
        const offJson = await offRes.json();
        if (offJson.status === 1 && offJson.product) {
          const p = offJson.product;
          offProductData = p;
          productName = p.product_name || p.product_name_en || productName;
          brandName = p.brands || brandName;
          if (p.ingredients_text || p.ingredients_text_en) {
            ingredientsSummary = p.ingredients_text || p.ingredients_text_en;
          }
          if (Array.isArray(p.allergens_tags)) {
            for (const at of p.allergens_tags) {
              const clean = at.replace(/^en:/, '').toLowerCase();
              if (!detectedAllergenIds.includes(clean)) detectedAllergenIds.push(clean);
            }
          }
          if (Array.isArray(p.additives_tags)) {
            productAdditivesTags.push(...p.additives_tags);
          }
        }
      }
    } catch {}

    // B. USDA FoodData Central fallback if product name or ingredients still missing
    if (ingredientsSummary.length === 0 || productName.startsWith('Retail Grocery')) {
      try {
        const fdcCtrl = new AbortController();
        const fdcTimeout = setTimeout(() => fdcCtrl.abort(), 2600);
        const fdcRes = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${code}&dataType=Branded&pageSize=3&api_key=DEMO_KEY`,
          { signal: fdcCtrl.signal }
        );
        clearTimeout(fdcTimeout);

        if (fdcRes.ok) {
          const fdcJson = await fdcRes.json();
          if (fdcJson && fdcJson.foods && fdcJson.foods.length > 0) {
            const fItem = fdcJson.foods[0];
            if (fItem.description && productName.startsWith('Retail Grocery')) {
              productName = fItem.description;
            }
            if (fItem.brandOwner && brandName === 'Grocery Brand') {
              brandName = fItem.brandOwner;
            }
            if (fItem.ingredients && ingredientsSummary.length === 0) {
              ingredientsSummary = fItem.ingredients;
            }
          }
        }
      } catch {}
    }

    // C. Live openFDA Recall Enforcement Check
    try {
      const fdaCtrl = new AbortController();
      const fdaTimeout = setTimeout(() => fdaCtrl.abort(), 2800);
      const q = `search=openfda.upc:"${code}"&limit=1`;
      const fdaRes = await fetch(`https://api.fda.gov/food/enforcement.json?${q}`, {
        signal: fdaCtrl.signal,
      });
      clearTimeout(fdaTimeout);

      if (fdaRes.ok) {
        const fdaData = await fdaRes.json();
        if (fdaData && fdaData.results && fdaData.results.length > 0) {
          const r = fdaData.results[0];
          if (r.status === 'Terminated') {
            terminatedNotice = {
              title: r.product_description || productName,
              brand: r.recalling_firm || brandName,
              date: r.termination_date || 'Previous Recall',
              agency: 'FDA Consumer Safety Archive',
              reason: r.reason_for_recall || 'Prior hazard remediation complete.',
              severity: r.classification || 'Class I Notice (Resolved)',
            };
          } else {
            isRecalled = true;
            recallRecord = {
              isRecalled: true,
              brand: r.recalling_firm || brandName,
              product: r.product_description || productName,
              upc: code,
              recallDate: r.recall_initiation_date || 'Active FDA Wire Alert',
              hazard: r.reason_for_recall || 'Identified potential health risk by regulatory inspection.',
              action: r.voluntary_mandated || 'Voluntary Consumer Recall. Do not consume.',
              severity: r.classification || 'Class I High Risk',
              agency: 'openFDA Food Safety Wire',
              tag: 'Active Recall',
              states: r.distribution_pattern ? [r.distribution_pattern] : ['National'],
              stores: ['Multiple Retailers'],
            };
          }
        }
      }
    } catch {}
  }

  // 4. Match against National & Regional Curated Bulletins
  if (!isRecalled) {
    const query = `${brandName} ${productName}`.toLowerCase();
    const matchedBulletin = NATIONAL_BULLETINS.find((b) => {
      const bBrand = b.brand.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const brandMatch = query.includes(bBrand) || bBrand.includes(brandName.toLowerCase());
      const titleMatch = query.includes(bTitle) || bTitle.includes(productName.toLowerCase());
      return brandMatch && titleMatch;
    });

    if (matchedBulletin) {
      isRecalled = true;
      recallRecord = {
        isRecalled: true,
        brand: matchedBulletin.brand,
        product: matchedBulletin.title,
        upc: code,
        recallDate: matchedBulletin.date,
        hazard: matchedBulletin.reason,
        action: 'Voluntary Consumer Recall. Return to store of purchase for immediate full refund.',
        severity: matchedBulletin.severity,
        agency: `${matchedBulletin.agency} Consumer Protection Wire`,
        tag: 'Active Recall',
        states: matchedBulletin.states,
        stores: ['Major Grocery & Retail Outlets'],
      };
    }
  }

  // 5. Check cached FDA recalls (offline store-ready list)
  if (!isRecalled) {
    const cachedRecalls = getCachedFDARecalls();
    const matchedFda = cachedRecalls.find((r) => {
      if (r.upcs && r.upcs.includes(code)) return true;
      if (r.raw && r.raw.includes(code)) return true;
      const bLower = brandName.toLowerCase();
      const pLower = productName.toLowerCase();
      if (bLower.length > 2 && r.brand.toLowerCase().includes(bLower)) {
        if (pLower.length > 3 && r.raw.includes(pLower)) return true;
      }
      return false;
    });

    if (matchedFda) {
      isRecalled = true;
      recallRecord = {
        isRecalled: true,
        brand: matchedFda.brand,
        product: matchedFda.product,
        upc: code,
        recallDate: matchedFda.date,
        hazard: matchedFda.reason,
        action: 'Active FDA Enforcement Recall. Discard or return to store.',
        severity: matchedFda.severity,
        agency: 'FDA Food Safety Wire',
        tag: 'Active Recall',
        states: ['National Distribution'],
        stores: ['Grocery Retailers'],
      };
    }
  }

  // 6. Comprehensive Allergen Detection
  const parsedAllergens = parseAllergensFromText(
    productName,
    brandName,
    ingredientsSummary,
    offProductData?.allergens || '',
    offProductData?.allergens_tags || []
  );
  for (const a of parsedAllergens) {
    if (!detectedAllergenIds.includes(a)) detectedAllergenIds.push(a);
  }

  // 7. Match against Family Profiles
  const triggeredFamilyMatches: Array<{
    profileId: string;
    profileName: string;
    profileIcon: string;
    allergens: string[];
  }> = [];

  for (const prof of profiles) {
    const matches = (prof.allergens || []).filter((a) => detectedAllergenIds.includes(a));
    if (matches.length > 0) {
      const names = matches.map((id) => {
        const opt = ALLERGEN_OPTIONS.find((o) => o.id === id);
        return opt ? `${opt.icon} ${opt.name}` : id;
      });
      triggeredFamilyMatches.push({
        profileId: prof.id,
        profileName: prof.name,
        profileIcon: prof.icon,
        allergens: names,
      });
    }
  }

  // 8. Additive Audit
  const detectedAdditives = auditFoodAdditives(ingredientsSummary, productAdditivesTags, productName);

  // Status computation
  let status: 'clear' | 'recalled' | 'allergen_alert' | 'terminated' = 'clear';
  if (isRecalled) {
    status = 'recalled';
  } else if (terminatedNotice) {
    status = 'terminated';
  } else if (triggeredFamilyMatches.length > 0) {
    status = 'allergen_alert';
  }

  return {
    upc: code,
    productName,
    brand: brandName,
    isRecalled,
    recallRecord,
    terminatedNotice,
    detectedAllergens: Array.from(new Set(detectedAllergenIds)),
    familyMatches: triggeredFamilyMatches,
    detectedAdditives,
    ingredients: ingredientsSummary,
    stores: stores.length > 0 ? stores : ['National Grocery & Supermarket Retailers'],
    states: states.length > 0 ? states : ['All US States & Territories'],
    timestamp,
    status,
    source,
  };
}
