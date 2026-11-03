export interface NationalBulletin {
  id: string;
  title: string;
  brand: string;
  date: string;
  agency: string;
  reason: string;
  severity: string;
  states: string[];
}

export const NATIONAL_BULLETINS: NationalBulletin[] = [
      
      {
        id: "REC-2026-904",
        title: "Organic Whole Carrots",
        brand: "SunVale Farms",
        date: "Oct 28, 2026",
        agency: "FDA",
        reason: "E. Coli O121 risk in multi-pound retail bags",
        severity: "Class I",
        states: ['ALL'],
        stores: ['Kroger', 'Giant Eagle', 'Walmart', 'Target', 'Meijer', 'Aldi']
      },
      {
        id: "REC-2026-882",
        title: "Smoked Turkey Breast Slices",
        brand: "DeliPrime Provisions",
        date: "Oct 22, 2026",
        agency: "USDA-FSIS",
        reason: "Listeria monocytogenes detection in pre-packaged deli cuts",
        severity: "Class I",
        states: ['OH', 'PA', 'MI', 'IL'],
        stores: ['Giant Eagle', 'Kroger', 'Meijer']
      },
      {
        id: "REC-2026-871",
        title: "Crunchy Peanut Butter 16oz",
        brand: "Country Mill Co.",
        date: "Oct 15, 2026",
        agency: "FDA",
        reason: "Potential metal fragment contamination from packaging line",
        severity: "Class II",
        states: ['ALL'],
        stores: ['Walmart', 'Target', 'Aldi']
      },
      {
        id: "REC-2026-855",
        title: "Classic Caesar Salad Bowl Kit",
        brand: "FreshField Bistro",
        date: "Oct 09, 2026",
        agency: "FDA",
        reason: "Undeclared egg and anchovy dressing allergen",
        severity: "Class II",
        states: ['OH', 'PA', 'NY'],
        stores: ['Giant Eagle', 'Trader Joe\'s', 'Kroger']
      }
    ];
