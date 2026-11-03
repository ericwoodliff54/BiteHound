import { ADDITIVES_DATABASE } from '../data/additives';

export interface DetectedAdditive {
  id: string;
  name: string;
  type: string;
  icon: string;
  desc: string;
}

export function auditFoodAdditives(
  ingredientsText = '',
  tags: string[] = [],
  productName = ''
): DetectedAdditive[] {
  const detected: DetectedAdditive[] = [];
  const cleanText = (String(ingredientsText || '') + ' ' + String(productName || '')).toLowerCase();
  const lowerTags = (Array.isArray(tags) ? tags : []).map((t) => String(t).toLowerCase());

  for (const item of ADDITIVES_DATABASE) {
    let matched = false;

    // 1. Exact Tag match (Open Food Facts e-codes e.g. "en:e129")
    if (lowerTags.length > 0 && item.tags.some((t) => lowerTags.includes(t.toLowerCase()))) {
      matched = true;
    }

    // 2. Regular expression text match (captures "Red #40", "Red No. 40", "Red 40 Lake", "E129", etc.)
    if (!matched && item.regex && item.regex.test(cleanText)) {
      matched = true;
    }

    // 3. Fallback regex match across all raw tags joined
    if (!matched && item.regex && lowerTags.length > 0 && item.regex.test(lowerTags.join(' '))) {
      matched = true;
    }

    if (matched) {
      detected.push({
        id: item.id,
        name: item.name,
        type: item.type,
        icon: item.icon,
        desc: item.desc,
      });
    }
  }

  return detected;
}
