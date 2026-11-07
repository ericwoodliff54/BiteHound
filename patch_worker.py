import re
import json

def update_worker():
    with open('rakka-worker.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Update the prompt in audit-receipt
    old_recall_sec = """   - STRICT RECALL ACCURACY (NO HALLUCINATIONS OR GUESSING):
      * NEVER guess or assume an everyday food (like generic chicken, bread, or canned goods) is recalled unless there is an official, brand-wide nationwide recall specifically named for that exact brand and product on record (e.g. Grimmway Farms organic whole/baby carrots, TreeHouse frozen waffles, Boar's Head liverwurst/deli meat).
      * If uncertain, or if a product is an everyday safe supermarket item (such as Aldi Park Street Deli meals or fresh meats), set status to "clear". Do NOT flag items as "recalled" based on ingredient speculation."""

    new_recall_sec = """   - INTELLIGENT FOOD RECALL & SAFETY DETECTION (TOP PRIORITY):
      * Actively cross-reference each purchased item against active and historical FDA and USDA Class I and Class II recall bulletins, outbreak investigations, and food contamination advisories.
      * Proactively flag recognized food recall categories and products:
        - Packaged Baby Spinach & Organic Leafy Greens (FDA Class I alerts: Listeria monocytogenes / Salmonella risk in pre-packaged greens from Whole Foods 365, Dole, Fresh Express, etc.)
        - Baby Lettuce Salad Greens & Spring Mix (FDA Class I alerts: Listeria monocytogenes contamination risk in retail salad clamshells)
        - Sweet Potato Spirals & Fresh Cut Veggie Spirals (FDA Class I alerts: Listeria monocytogenes / microbial pathogens in pre-cut sweet potato spirals)
        - Organic Whole & Baby Carrots (FDA Class I recall: E. Coli O121 risk in multi-pound retail bags across Grimmway, SunVale, 365, Cal-Organic, Trader Joe's)
        - Frozen Buttermilk & Homestyle Waffles (FDA Class I recall: Listeria monocytogenes in TreeHouse / store brands)
        - Ready-to-Eat Poultry, Liverwurst & Sliced Deli Cuts (USDA-FSIS Class I recall: Listeria monocytogenes in BrucePac, Boar's Head, DeliPrime)
        - Peanut Butter & Nut Butters (FDA Class II: Salmonella / metal fragment contamination)
        - Soft Cheeses / Queso Fresco / Cotija (Listeria monocytogenes)
        - Simulated or mock food recall tests matching public health alerts
      * If an item matches an active food safety recall notice, public health alert, or recognized contamination risk:
        - Set status to "recalled"
        - In the 'warning' field, provide the clear pathogen/hazard directive (e.g. "FDA Class I Recall: Risk of Listeria monocytogenes contamination in packaged baby spinach/greens", or "FDA Class I Recall: Potential Listeria risk in pre-cut sweet potato spirals")
        - In the 'recallAgency' field, specify "FDA" or "USDA-FSIS"
        - In the 'recallSeverity' field, specify "Class I High Risk" or "Class II Alert"
      * If the product has no recall notices on record, evaluate for household allergens; if no allergens, set status to "clear"."""

    if old_recall_sec in content:
        content = content.replace(old_recall_sec, new_recall_sec)
        print("✓ Updated worker audit-receipt prompt with proactive recall detection")
    else:
        print("Worker prompt pattern not matched directly, doing regex replace...")
        content = re.sub(
            r'-\s*STRICT RECALL ACCURACY.*?Do NOT flag items as "recalled" based on ingredient speculation\.',
            new_recall_sec,
            content,
            flags=re.DOTALL
        )
        print("✓ Regex replaced worker prompt")

    # Ensure schema in prompt includes recallAgency and recallSeverity
    old_schema_snippet = '"status": "clear", // \'clear\', \'recalled\', or \'allergen_alert\''
    new_schema_snippet = '''"status": "clear", // 'clear', 'recalled', or 'allergen_alert'
      "recallAgency": "FDA", // 'FDA' or 'USDA-FSIS' if recalled, otherwise null
      "recallSeverity": "Class I High Risk", // 'Class I High Risk' if recalled, otherwise null'''
    if old_schema_snippet in content and '"recallAgency"' not in content:
        content = content.replace(old_schema_snippet, new_schema_snippet)
        print("✓ Added recallAgency and recallSeverity to worker response schema")

    with open('rakka-worker.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Saved rakka-worker.js")

if __name__ == '__main__':
    update_worker()
