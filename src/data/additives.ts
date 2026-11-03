export interface AdditiveItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  desc: string;
  tags: string[];
  regex: RegExp;
}

export const ADDITIVES_DATABASE: AdditiveItem[] = [
      {
        id: 'bvo',
        name: 'Brominated Vegetable Oil (BVO)',
        type: 'FDA-Banned Beverage Emulsifier (2024)',
        icon: '🛑',
        desc: 'Vegetable oil chemically bonded with bromine (E443). Officially banned by the US FDA in July 2024 and prohibited across Europe due to bioaccumulation in fat tissue and thyroid toxicity.',
        tags: ['en:e443', 'en:brominated-vegetable-oil', 'e443', 'bvo', 'brominated-oil'],
        regex: /\bbvo\b|brominated\s+vegetable\s+oils?|\be[-_\s]*443\b/i
      },
      {
        id: 'propylparaben',
        name: 'Propylparaben (Preservative)',
        type: 'California- & EU-Banned Endocrine Disruptor',
        icon: '🛑',
        desc: 'Paraben-class synthetic antimicrobial preservative (E216) prohibited in the EU and banned under the California Food Safety Act. Animal toxicology shows disruption of endocrine and reproductive hormones.',
        tags: ['en:e216', 'en:e217', 'en:propylparaben', 'en:sodium-propylparaben', 'e216', 'e217', 'propylparaben'],
        regex: /(?:sodium\s+)?propyl\s*paraben|\be[-_\s]*21[67]\b/i
      },
      {
        id: 'confectioners_glaze',
        name: 'Confectioner’s Glaze & Shellac (E904)',
        type: 'Insect-Derived Resin Coating',
        icon: '🪲',
        desc: 'Purified resin secreted by female lac beetles (Kerria lacca). Used to give hard glossy coatings to jelly beans, sprinkles, chocolate-covered candies, and pharmaceutical pills.',
        tags: ['en:e904', 'en:shellac', 'e904', 'confectioners-glaze', 'shellac', 'resinous-glaze'],
        regex: /confectioner'?s\s+glaze|resinous\s+glaze|\bshellac\b|\be[-_\s]*904\b/i
      },
      {
        id: 'datem_ssl',
        name: 'DATEM & Sodium Stearoyl Lactylate (SSL)',
        type: 'Industrial Dough Strengthener',
        icon: '🍞',
        desc: 'Synthetic dough conditioners (E472e & E481) used in commercial sliced bread, hamburger buns, and packaged donuts to unnaturally retain moisture and extend factory shelf life.',
        tags: ['en:e472e', 'en:e481', 'en:datem', 'en:sodium-stearoyl-lactylate', 'datem', 'e472e', 'e481'],
        regex: /\bdatem\b|diacetyl\s+tartaric\s+acid\s+esters?|sodium\s+stearoyl[-_\s]*(?:lactylate|2[-_\s]*lactylate)|\be[-_\s]*(?:472e|481)\b/i
      },
      {
        id: 'aluminum_compounds',
        name: 'Sodium Aluminum Phosphate & Sulfates',
        type: 'Aluminum-Based Chemical Leavener',
        icon: '⚠️',
        desc: 'Aluminum-containing chemical leavening salts (E541 / E521) found in commercial pancake mixes, frozen waffles, and processed cheese. Strictly limited in Europe due to neurotoxicity concerns.',
        tags: ['en:e541', 'en:e521', 'en:sodium-aluminium-phosphate', 'e541', 'e521'],
        regex: /(?:sodium\s+)?alumin(?:um|ium)\s+(?:phosphate|sulfate|silicate)|\be[-_\s]*5(?:41|21)\b/i
      },
      {
        id: 'silicon_dioxide',
        name: 'Silicon Dioxide & Synthetic Silicates (E551)',
        type: 'Nanoparticle Anti-Caking Powder',
        icon: '⚪',
        desc: 'Synthetic silica powder (E551) added to seasoning packets, grated parmesan, spice blends, and powdered creamers. Under heightened scrutiny by the European Food Safety Authority for nanoparticle gut absorption.',
        tags: ['en:e551', 'en:e552', 'en:silicon-dioxide', 'e551', 'e552', 'silicon-dioxide', 'silica'],
        regex: /silicon\s+dioxide|synthetic\s+silica|calcium\s+silicate|\be[-_\s]*55[12]\b/i
      },
      {
        id: 'propylene_glycol',
        name: 'Propylene Glycol (E1520)',
        type: 'Petrochemical Solvent & Humectant',
        icon: '🧪',
        desc: 'Synthetic chemical solvent (E1520) used as a carrier for artificial food coloring and flavoring extracts, and as a moisture retainer in commercial salad dressings and baked goods.',
        tags: ['en:e1520', 'en:propylene-glycol', 'e1520', 'propylene-glycol'],
        regex: /propylene\s+glycol|\be[-_\s]*1520\b/i
      },
      {
        id: 'maltodextrin_modified_starch',
        name: 'Maltodextrin & Modified Food Starch',
        type: 'High-Glycemic Ultra-Processed Filler',
        icon: '🌽',
        desc: 'Enzymatically hydrolyzed corn, wheat, or tapioca starches with an ultra-high glycemic index (110–185) higher than pure table sugar. Used as cheap bulking fillers in chips, snack dusts, and instant sauces.',
        tags: ['en:maltodextrin', 'en:modified-starch', 'en:modified-corn-starch', 'maltodextrin', 'modified-food-starch'],
        regex: /\bmaltodextrin\b|modified\s+(?:food|corn|wheat|tapioca|potato)\s+starch(?:es)?/i
      },
      {
        id: 'propionate_preservatives',
        name: 'Calcium & Sodium Propionate (E281/E282)',
        type: 'Antifungal Bakery Preservative',
        icon: '🍞',
        desc: 'Synthetic chemical propionates (E281 & E282) added to factory breads and tortillas to prevent mold. Documented in pediatric studies for potential links to behavioral irritability and sleep issues in sensitive children.',
        tags: ['en:e281', 'en:e282', 'e281', 'e282', 'calcium-propionate'],
        regex: /(?:calcium|sodium)\s+propionate|\be[-_\s]*28[12]\b/i
      },
      {
        id: 'natural_flavors_unspecified',
        name: 'Undisclosed "Natural Flavors" / Aroma Blends',
        type: 'Proprietary Chemical Flavor Mixture',
        icon: '❓',
        desc: 'Broad umbrella label legally permitting food manufacturers to group dozens of proprietary chemical solvents, flavor concentrates, and synthetic carriers under a single ambiguous line item.',
        tags: ['en:natural-flavouring', 'en:natural-flavor', 'natural-flavors', 'natural-flavoring'],
        regex: /\bnatural\s+flavou?rs?(?:\s+and\s+artificial\s+flavou?rs?)?\b/i
      },

      {
        id: 'pgpr',
        name: 'PGPR (Polyglycerol Polyricinoleate)',
        type: 'Industrial Cocoa Butter Replacer / Emulsifier',
        icon: '🧪',
        desc: 'Castor bean oil-derived synthetic emulsifier (E476) used by commercial confectionery manufacturers to substitute for expensive natural cocoa butter and accelerate factory throughput. High doses in toxicology studies linked to liver and kidney hypertrophy.',
        tags: ['en:e476', 'en:polyglycerol-polyricinoleate', 'e476', 'pgpr', 'polyglycerol-polyricinoleate'],
        regex: /\bpgpr\b|polyglycerol[-_\s]*polyricinoleate|\be[-_\s]*476\b/i
      },
      {
        id: 'vanillin_artificial',
        name: 'Vanillin & Synthetic Artificial Flavors',
        type: 'Synthetic Petrochemical Flavoring',
        icon: '🧪',
        desc: 'Synthetically produced chemical flavoring compounds (synthetic vanillin, ethyl vanillin, artificial flavors) derived from wood pulp lignin or petroleum. Mimics natural vanilla aromas at low industrial cost without botanical vanilla bean nutrients.',
        tags: ['en:artificial-flavouring', 'en:artificial-flavor', 'en:vanillin', 'vanillin', 'artificial-flavor', 'artificial-vanilla'],
        regex: /\b(?:artificial\s+flavou?rs?|vanillin|ethyl[-_\s]*vanillin)\b/i
      },
      {
        id: 'palm_kernel_oil',
        name: 'Palm Kernel Oil & Fractionated Fats',
        type: 'Refined Tropical Confectionery Fat',
        icon: '🛢️',
        desc: 'Heavily refined and fractionated palm kernel and palm oils used in commercial candy coatings and wafer fillings as cheap dairy fat and cocoa butter replacers. High in saturated lauric and palmitic fatty acids.',
        tags: ['en:palm-kernel-oil', 'en:fractionated-palm-kernel-oil', 'en:modified-palm-oil', 'palm-kernel-oil'],
        regex: /\b(?:fractionated\s+|modified\s+)?palm\s+kernel\s+oils?\b/i
      },

      {
        id: 'red40',
        name: 'Red 40 (Allura Red)',
        type: 'Synthetic Petroleum Dye',
        icon: '🎨',
        desc: 'Petroleum-derived artificial food coloring (FD&C Red No. 40 / E129). Requires a mandatory warning label in the European Union regarding hyperactivity in children.',
        tags: ['en:e129', 'en:allura-red-ac', 'en:allura-red', 'e129', 'red-40', 'ci-16035', 'ci 16035', 'food-red-17'],
        regex: /(?:fd\s*&?\s*c\s*)?red\s*(?:#\s*|no\.?\s*|dye\s*)?40(?:\s*lake)?|allura[-_\s]*red(?:\s*ac)?|\be[-_\s]*129\b|\bci[-_\s]*16035\b/i
      },
      {
        id: 'yellow5',
        name: 'Yellow 5 (Tartrazine)',
        type: 'Synthetic Petroleum Dye',
        icon: '🎨',
        desc: 'Azo food dye (FD&C Yellow No. 5 / E102). Flagged for potential allergic-like reactions, hives, and attention deficit behavior in sensitive individuals.',
        tags: ['en:e102', 'en:tartrazine', 'e102', 'yellow-5', 'ci-19140', 'food-yellow-4'],
        regex: /(?:fd\s*&?\s*c\s*)?yellow\s*(?:#\s*|no\.?\s*|dye\s*)?5(?:\s*lake)?|tartrazine|\be[-_\s]*102\b|\bci[-_\s]*19140\b/i
      },
      {
        id: 'yellow6',
        name: 'Yellow 6 (Sunset Yellow)',
        type: 'Synthetic Petroleum Dye',
        icon: '🎨',
        desc: 'Synthetic petroleum-derived colorant (FD&C Yellow No. 6 / E110). Subject to strict warning requirements in Europe due to behavioral impact studies.',
        tags: ['en:e110', 'en:sunset-yellow-fcf', 'en:sunset-yellow', 'e110', 'yellow-6', 'ci-15985', 'orange-yellow-s'],
        regex: /(?:fd\s*&?\s*c\s*)?yellow\s*(?:#\s*|no\.?\s*|dye\s*)?6(?:\s*lake)?|sunset[-_\s]*yellow(?:\s*fcf)?|\be[-_\s]*110\b|\bci[-_\s]*15985\b/i
      },
      {
        id: 'blue1',
        name: 'Blue 1 (Brilliant Blue)',
        type: 'Synthetic Petroleum Dye',
        icon: '🎨',
        desc: 'Synthetic triarylmethane colorant (FD&C Blue No. 1 / E133). Under regulatory scrutiny in Europe for neurotoxicity questions at elevated intake levels.',
        tags: ['en:e133', 'en:brilliant-blue-fcf', 'en:brilliant-blue', 'e133', 'blue-1', 'ci-42090'],
        regex: /(?:fd\s*&?\s*c\s*)?blue\s*(?:#\s*|no\.?\s*|dye\s*)?1(?:\s*lake)?|brilliant[-_\s]*blue(?:\s*fcf)?|\be[-_\s]*133\b|\bci[-_\s]*42090\b/i
      },
      {
        id: 'blue2',
        name: 'Blue 2 (Indigotine)',
        type: 'Synthetic Petroleum Dye',
        icon: '🎨',
        desc: 'Synthetic dye (FD&C Blue No. 2 / E132 / Indigo Carmine). Targeted by consumer health groups due to animal study links to brain tumors.',
        tags: ['en:e132', 'en:indigotine', 'e132', 'blue-2', 'indigo-carmine', 'ci-73015'],
        regex: /(?:fd\s*&?\s*c\s*)?blue\s*(?:#\s*|no\.?\s*|dye\s*)?2(?:\s*lake)?|indigotine|indigo[-_\s]*carmine|\be[-_\s]*132\b|\bci[-_\s]*73015\b/i
      },
      {
        id: 'red3',
        name: 'Red 3 (Erythrosine)',
        type: 'Banned / High-Risk Dye',
        icon: '🛑',
        desc: 'FDA banned from cosmetics in 1990 and prohibited under the California Food Safety Act. Documented link to thyroid tumors in animal studies.',
        tags: ['en:e127', 'en:erythrosine', 'e127', 'red-3', 'ci-45430'],
        regex: /(?:fd\s*&?\s*c\s*)?red\s*(?:#\s*|no\.?\s*|dye\s*)?3(?:\s*lake)?|erythrosine|\be[-_\s]*127\b|\bci[-_\s]*45430\b/i
      },
      {
        id: 'green3',
        name: 'Green 3 (Fast Green)',
        type: 'Synthetic Dye',
        icon: '🎨',
        desc: 'Synthetic triphenylmethane dye (FD&C Green No. 3 / E143). Restricted food additive with European Union usage limits.',
        tags: ['en:e143', 'en:fast-green-fcf', 'e143', 'green-3', 'ci-42053'],
        regex: /(?:fd\s*&?\s*c\s*)?green\s*(?:#\s*|no\.?\s*|dye\s*)?3(?:\s*lake)?|fast[-_\s]*green(?:\s*fcf)?|\be[-_\s]*143\b|\bci[-_\s]*42053\b/i
      },
      {
        id: 'titanium_dioxide',
        name: 'Titanium Dioxide (E171)',
        type: 'EU-Banned Mineral Whitener',
        icon: '⚪',
        desc: 'Inorganic whitening agent (E171). Officially banned from all food products by the European Commission due to nanoparticle accumulation and genotoxicity.',
        tags: ['en:e171', 'en:titanium-dioxide', 'e171', 'titanium-white', 'ci-77891'],
        regex: /titanium[-_\s]*dioxide|\be[-_\s]*171\b|\bci[-_\s]*77891\b/i
      },
      {
        id: 'bha_bht',
        name: 'BHA & BHT (Preservatives)',
        type: 'Synthetic Chemical Preservative',
        icon: '🛑',
        desc: 'Butylated hydroxyanisole & hydroxytoluene (E320 & E321). Synthetic phenolic antioxidants classified as potential endocrine disruptors.',
        tags: ['en:e320', 'en:e321', 'en:bha', 'en:bht', 'e320', 'e321'],
        regex: /\b(?:bha|bht)\b|butylated[-_\s]*hydroxyanisole|butylated[-_\s]*hydroxytoluene|\be[-_\s]*32[01]\b/i
      },
      {
        id: 'tbhq',
        name: 'TBHQ (Preservative)',
        type: 'Synthetic Preservative',
        icon: '🛑',
        desc: 'Tertiary butylhydroquinone (E319). Chemical preservative synthesized from butane/petroleum; linked to cellular damage in animal studies.',
        tags: ['en:e319', 'en:tbhq', 'e319'],
        regex: /\btbhq\b|tert(?:iary)?[-_\s]*butylhydroquinone|\be[-_\s]*319\b/i
      },
      {
        id: 'nitrites',
        name: 'Sodium Nitrites / Nitrates',
        type: 'Curing Agent & Preservative',
        icon: '🥓',
        desc: 'Sodium or potassium nitrite/nitrate (E249–E252). Preservatives in deli meats that form carcinogenic nitrosamines when heated.',
        tags: ['en:e249', 'en:e250', 'en:e251', 'en:e252', 'e249', 'e250', 'e251', 'e252'],
        regex: /(?:sodium|potassium)[-_\s]*(?:nitrite|nitrate)|\be[-_\s]*2(?:49|50|51|52)\b/i
      },
      {
        id: 'bromate_ada',
        name: 'Potassium Bromate & ADA',
        type: 'Banned Dough Conditioner',
        icon: '🛑',
        desc: 'Potassium bromate & azodicarbonamide (E924 / E927a). Chemical flour bleachers and dough conditioners banned across the EU, Canada, and California.',
        tags: ['en:e924', 'en:e927a', 'en:azodicarbonamide', 'e924', 'e927a'],
        regex: /potassium[-_\s]*bromate|azodicarbonamide|\be[-_\s]*924\b|\be[-_\s]*927a?\b/i
      },
      {
        id: 'sweeteners',
        name: 'Artificial Sweeteners',
        type: 'Non-Nutritive Sweetener',
        icon: '🍬',
        desc: 'High-potency synthetic sweeteners (Aspartame / NutraSweet, Sucralose / Splenda, Acesulfame Potassium / Ace-K, Saccharin). Under study for microbiome disruption.',
        tags: ['en:e950', 'en:e951', 'en:e954', 'en:e955', 'e950', 'e951', 'e954', 'e955', 'aspartame', 'sucralose'],
        regex: /aspartame|nutrasweet|sucralose|splenda|acesulfame[-_\s]*(?:potassium|k)?|\bace[-_\s]*k\b|saccharin|\be[-_\s]*95[0145]\b/i
      },
      {
        id: 'hfcs',
        name: 'High Fructose Corn Syrup (HFCS)',
        type: 'Ultra-Processed Sweetener',
        icon: '🌽',
        desc: 'Enzymatically converted liquid corn sweetener (HFCS-55 / HFCS-42). Rapidly absorbed fructose metabolized in the liver, linked to metabolic strain.',
        tags: ['en:high-fructose-corn-syrup', 'en:glucose-fructose-syrup', 'en:isoglucose', 'hfcs'],
        regex: /high[-_\s]*fructose[-_\s]*corn[-_\s]*syrup|\bhfcs\b|glucose[-_\s]*fructose[-_\s]*syrup|isoglucose/i
      },
      {
        id: 'carrageenan',
        name: 'Carrageenan (E407)',
        type: 'Inflammatory Thickener',
        icon: '🧪',
        desc: 'Red seaweed-derived gelling agent (E407). Widely researched for triggering intestinal inflammation and gut mucosal permeability.',
        tags: ['en:e407', 'en:e407a', 'en:carrageenan', 'e407', 'e407a'],
        regex: /carrageenan|irish[-_\s]*moss[-_\s]*extract|\be[-_\s]*407a?\b/i
      },
      {
        id: 'polysorbates',
        name: 'Polysorbate 60 / 80',
        type: 'Synthetic Emulsifier',
        icon: '🧪',
        desc: 'Synthetic non-ionic surfactants (E433 & E435). Animal studies show erosion of protective intestinal mucus layers.',
        tags: ['en:e433', 'en:e435', 'en:polysorbate-80', 'en:polysorbate-60', 'e433', 'e435'],
        regex: /polysorbate[-_\s]*(?:60|80)|\be[-_\s]*43[35]\b/i
      },
      {
        id: 'hydrogenated_oils',
        name: 'Hydrogenated Vegetable Oils',
        type: 'Industrial Stabilizer / Hydrogenated Fat',
        icon: '🛢️',
        desc: 'Chemically altered vegetable oils (partially or fully hydrogenated cottonseed, soybean, or rapeseed) used to prevent oil separation in commercial spreads. Linked to cardiovascular strain and inflammation.',
        tags: ['en:hydrogenated-vegetable-oil', 'en:fully-hydrogenated-vegetable-oil', 'en:partially-hydrogenated-vegetable-oil', 'en:hydrogenated-cottonseed-oil', 'en:hydrogenated-soybean-oil', 'en:hydrogenated-rapeseed-oil', 'en:hydrogenated-palm-oil', 'hydrogenated-oil'],
        regex: /\b(?:fully\s+|partially\s+)?hydrogenated\s+(?:vegetable|soybean|cottonseed|rapeseed|palm|canola)\s+oils?\b|\bhydrogenated\s+oils?\b/i
      },
      {
        id: 'mono_diglycerides',
        name: 'Mono- & Diglycerides (E471)',
        type: 'Synthetic Emulsifier / Hidden Trans-Fat',
        icon: '🧪',
        desc: 'Glycerol-derived emulsifiers (E471 / monoglycerides) used to stabilize commercial peanut butters, baked goods, and ice cream. Often contain unmeasured low levels of industrial trans fats.',
        tags: ['en:e471', 'en:mono-and-diglycerides-of-fatty-acids', 'en:monoglycerides', 'en:diglycerides', 'e471', 'monoglycerides', 'diglycerides'],
        regex: /\b(?:mono\s*[-–—]?\s*(?:and|&)\s*diglycerides?|monoglycerides?|diglycerides?)\b|\be[-_\s]*471\b/i
      },
      {
        id: 'benzoates_sorbates',
        name: 'Sodium Benzoate & Potassium Sorbate',
        type: 'Chemical Antimicrobial Preservative',
        icon: '🛑',
        desc: 'Synthetic chemical preservatives (E211 & E202) used in condiments, beverages, and sauces. When combined with Vitamin C (ascorbic acid), sodium benzoate can form trace benzene.',
        tags: ['en:e211', 'en:e202', 'en:sodium-benzoate', 'en:potassium-sorbate', 'e211', 'e202'],
        regex: /\bsodium\s*benzoate\b|\bpotassium\s*sorbate\b|\be[-_\s]*2(?:02|11)\b/i
      },
      {
        id: 'edta',
        name: 'Calcium Disodium EDTA (E385)',
        type: 'Chelating Preservative',
        icon: '🛑',
        desc: 'Synthetic chelating compound (E385) used in dressings, spreads, and canned vegetables to bind metals and preserve color. Restricted in Europe and Australia.',
        tags: ['en:e385', 'en:calcium-disodium-edta', 'en:edta', 'e385'],
        regex: /\b(?:calcium\s+disodium\s+)?edta\b|\be[-_\s]*385\b/i
      },
      {
        id: 'caramel_color',
        name: 'Caramel Color (Class III / IV)',
        type: 'Ammonia-Processed Colorant',
        icon: '🎨',
        desc: 'Synthetically manufactured caramel coloring (E150c / E150d) produced with ammonia compounds, containing trace 4-methylimidazole (4-MEI), a California Prop 65 listed compound.',
        tags: ['en:e150c', 'en:e150d', 'en:caramel-color', 'en:caramel-colour', 'e150c', 'e150d'],
        regex: /\bcaramel\s*colou?r(?:ing)?\b|\be[-_\s]*150[cd]\b/i
      },
      {
        id: 'msg',
        name: 'MSG & Flavor Enhancers (E621)',
        type: 'Concentrated Umami Enhancer',
        icon: '🧂',
        desc: 'Monosodium glutamate (E621), disodium inosinate (E631), or guanylate (E627). Concentrated sodium salts used to stimulate savory umami taste receptors.',
        tags: ['en:e621', 'en:e627', 'en:e631', 'en:monosodium-glutamate', 'e621', 'msg'],
        regex: /\bmonosodium\s*glutamate\b|\bmsg\b|\bdisodium\s*(?:inosinate|guanylate)\b|\be[-_\s]*6(?:21|27|31)\b/i
      },
      {
        id: 'propyl_gallate',
        name: 'Propyl Gallate (E310)',
        type: 'Fat Antioxidant Preservative',
        icon: '🛑',
        desc: 'Synthetic antioxidant preservative (E310) added to vegetable oils, meat products, and snacks to prevent fat rancidity. Flagged for potential endocrine disruption.',
        tags: ['en:e310', 'en:propyl-gallate', 'e310'],
        regex: /\bpropyl\s*gallate\b|\be[-_\s]*310\b/i
      },
      {
        id: 'bleached_flour',
        name: 'Bleached Flour / Chemical Bleaching',
        type: 'Flour Chemical Treatment',
        icon: '🌾',
        desc: 'Flour treated with benzoyl peroxide, chlorine dioxide, or potassium bromate to artificially accelerate aging and whiten texture. Banned across the EU and UK.',
        tags: ['en:bleached-flour', 'en:bleached-wheat-flour'],
        regex: /\bbleached\s+(?:wheat\s+|all[-_\s]*purpose\s+|white\s+)?flour\b|\bbenzoyl\s*peroxide\b/i
      }
    ];

export const ADDITIVE_OPTIONS = ADDITIVES_DATABASE;
