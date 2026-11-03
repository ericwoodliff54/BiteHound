import { ALLERGEN_OPTIONS } from '../data/allergens';

export { ALLERGEN_OPTIONS };

export function parseAllergensFromText(
  productName: string = '',
  brandName: string = '',
  ingredientsSummary: string = '',
  extraAllergensText: string = '',
  allergensTags: string[] = []
): string[] {
  const detectedAllergenIds: string[] = [];
  const combinedFoodText = `${productName} ${brandName} ${ingredientsSummary} ${extraAllergensText} ${allergensTags.join(' ')}`.toLowerCase();

  // 1. Gluten & Wheat
  if (
    /gluten|wheat|barley|rye|malt|flour|bread|pasta|semolina|spelt|farro|graham|kamut|triticale|durum|couscous|einkorn|emmer/.test(
      combinedFoodText
    )
  ) {
    if (!detectedAllergenIds.includes('gluten')) detectedAllergenIds.push('gluten');
  }

  // 2. Dairy & Milk
  if (
    /milk|dairy|lactose|cheese|whey|butter|cream|casein|caseinate|yogurt|ghee|curds|butterfat|buttermilk|lactalbumin|lactoglobulin/.test(
      combinedFoodText
    )
  ) {
    if (!detectedAllergenIds.includes('dairy')) detectedAllergenIds.push('dairy');
  }

  // 3. Peanuts
  if (/peanut|arachis/.test(combinedFoodText)) {
    if (!detectedAllergenIds.includes('peanuts')) detectedAllergenIds.push('peanuts');
  }

  // 4. Tree Nuts
  if (
    /almond|cashew|walnut|pecan|pistachio|hazelnut|filbert|macadamia|pine\s*nut|pignoli|chestnut|brazil\s*nut|praline/.test(
      combinedFoodText
    )
  ) {
    if (!detectedAllergenIds.includes('treenuts')) detectedAllergenIds.push('treenuts');
  }

  // 5. Soy
  if (/soy|soya|soybean|tofu|edamame|lecithin|tempeh|miso|tamari|shoyu|tvp/.test(combinedFoodText)) {
    if (!detectedAllergenIds.includes('soy')) detectedAllergenIds.push('soy');
  }

  // 6. Eggs
  if (/egg|albumin|ovalbumin|yolk|mayonnaise|lysozyme|meringue|ovomucin/.test(combinedFoodText)) {
    if (!detectedAllergenIds.includes('eggs')) detectedAllergenIds.push('eggs');
  }

  // 7. Shellfish & Crustaceans
  if (
    /shrimp|crab|lobster|prawn|clam|mussel|oyster|scallop|crustacean|crawfish|crayfish|krill/.test(
      combinedFoodText
    )
  ) {
    if (!detectedAllergenIds.includes('shellfish')) detectedAllergenIds.push('shellfish');
  }

  // 8. Fish & Finfish
  if (
    /fish|finfish|salmon|tuna|cod|tilapia|halibut|pollock|anchov|trout|haddock|sardine|mackerel|snapper|fish\s*sauce|worcestershire/.test(
      combinedFoodText
    )
  ) {
    if (!detectedAllergenIds.includes('fish')) detectedAllergenIds.push('fish');
  }

  // 9. Sesame
  if (/sesame|tahini|benne|sesamum|gingelly|halvah/.test(combinedFoodText)) {
    if (!detectedAllergenIds.includes('sesame')) detectedAllergenIds.push('sesame');
  }

  // 10. Corn
  if (/corn|cornstarch|corn\s*syrup|maize|dextrose|dextrin|maltodextrin|hfcs/.test(combinedFoodText)) {
    if (!detectedAllergenIds.includes('corn')) detectedAllergenIds.push('corn');
  }

  // 11. Sulfites
  if (/sulfite|sulphite|sulfur\s*dioxide|bisulfite|metabisulfite/.test(combinedFoodText)) {
    if (!detectedAllergenIds.includes('sulfites')) detectedAllergenIds.push('sulfites');
  }

  // 12. Yeast
  if (/yeast|autolyzed\s*yeast|yeast\s*extract|torula|brewer'?s\s*yeast|baker'?s\s*yeast|saccharomyces/.test(combinedFoodText)) {
    if (!detectedAllergenIds.includes('yeast')) detectedAllergenIds.push('yeast');
  }

  return detectedAllergenIds;
}
