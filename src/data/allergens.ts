export interface AllergenOption {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export const ALLERGEN_OPTIONS: AllergenOption[] = [
      { id: 'gluten', name: 'Gluten / Wheat', icon: '🌾', desc: 'Wheat, barley, rye & flour' },
      { id: 'dairy', name: 'Dairy / Milk', icon: '🥛', desc: 'Milk, whey, cheese & butter' },
      { id: 'peanuts', name: 'Peanuts', icon: '🥜', desc: 'Peanuts, peanut butter & oils' },
      { id: 'treenuts', name: 'Tree Nuts', icon: '🌰', desc: 'Almonds, walnuts & cashews' },
      { id: 'soy', name: 'Soy', icon: '🌿', desc: 'Soy lecithin, soybeans & tofu' },
      { id: 'eggs', name: 'Eggs', icon: '🥚', desc: 'Egg whites, yolks & mayo' },
      { id: 'shellfish', name: 'Shellfish', icon: '🦐', desc: 'Shrimp, crab & lobster' },
      { id: 'fish', name: 'Fish', icon: '🐟', desc: 'Salmon, tuna & finfish' },
      { id: 'sesame', name: 'Sesame', icon: '🌱', desc: 'Sesame seeds & tahini' },
      { id: 'corn', name: 'Corn', icon: '🌽', desc: 'Corn syrup, starch & meal' },
      { id: 'sulfites', name: 'Sulfites', icon: '🍷', desc: 'Sulfur dioxide & bisulfites' },
      { id: 'yeast', name: 'Yeast', icon: '🍞', desc: "Baker's, brewer's, yeast extract & torula" }
    ];
