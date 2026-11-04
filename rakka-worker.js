/**
 * RAKKA Cloud Edge Hook - Serverless Barcode Aggregator & Community Cache
 * Designed for Cloudflare Workers (100,000 free requests/day)
 * 100% Private: Zero PII, Zero User Accounts, Zero Tracking
 */

export default {
  async fetch(request, env, ctx) {
    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    };

    // 2. Health check / status
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'RAKKA Cloud Edge Hook',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }), { headers: corsHeaders });
    }

    // 3. GET /lookup?upc=...
    if (url.pathname === '/lookup' || url.pathname === '/api/lookup') {
      const rawUpc = url.searchParams.get('upc') || '';
      const cleanUpc = rawUpc.replace(/\D/g, '');
      if (!cleanUpc || cleanUpc.length < 6) {
        return new Response(JSON.stringify({ error: 'Valid barcode digits required' }), { status: 400, headers: corsHeaders });
      }

      // Tier 1: Check Cloudflare KV Community Cache (0ms)
      if (env && env.RAKKA_COMMUNITY_DB) {
        try {
          const cached = await env.RAKKA_COMMUNITY_DB.get(`upc:${cleanUpc}`, { type: 'json' });
          if (cached && cached.name && !cached.name.startsWith('Retail Grocery Item')) {
            return new Response(JSON.stringify({
              found: true,
              source: 'community_cache',
              product: cached
            }), { headers: corsHeaders });
          }
        } catch (kvErr) {
          console.warn('KV read error:', kvErr);
        }
      }

      // Tier 2: Multi-Cluster Open Food Facts Query
      const queryCodes = [cleanUpc];
      if (cleanUpc.length === 11) queryCodes.push('0' + cleanUpc, '00' + cleanUpc);
      if (cleanUpc.length === 12) queryCodes.push('0' + cleanUpc);
      if (cleanUpc.length === 13 && cleanUpc.startsWith('0')) queryCodes.push(cleanUpc.substring(1));
      if (cleanUpc.length === 8) queryCodes.push(cleanUpc.padStart(12, '0'), cleanUpc.padStart(13, '0'));

      const uniqueCodes = [...new Set(queryCodes)];
      let offProduct = null;

      try {
        const fetchPromises = uniqueCodes.map(q => {
          return fetch(`https://world.openfoodfacts.org/api/v0/product/${q}.json`, {
            headers: { 'User-Agent': 'RAKKA-FoodSafetyApp/1.0 (https://rakka.app)' }
          })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data && data.status === 1 && data.product) return data.product;
            throw new Error('Not found');
          });
        });
        offProduct = await Promise.any(fetchPromises);
      } catch (e) {}

      if (offProduct) {
        const name = offProduct.product_name || offProduct.product_name_en || offProduct.generic_name;
        const brand = offProduct.brands || offProduct.brand_owner || offProduct.brands_tags?.[0] || 'Packaged Grocery';
        const ingredients = offProduct.ingredients_text_en || offProduct.ingredients_text || '';

        if (name && name.length > 1) {
          const resolved = {
            upc: cleanUpc,
            name: name,
            brand: brand,
            ingredients: ingredients,
            additives: offProduct.additives_tags || [],
            allergens: offProduct.allergens_tags || []
          };

          // Save to KV Community DB if ingredients exist
          if (env && env.RAKKA_COMMUNITY_DB && ingredients) {
            ctx.waitUntil(env.RAKKA_COMMUNITY_DB.put(`upc:${cleanUpc}`, JSON.stringify(resolved)));
          }

          return new Response(JSON.stringify({
            found: true,
            source: 'open_food_facts',
            product: resolved
          }), { headers: corsHeaders });
        }
      }

      // Tier 3: USDA FoodData Central Query
      try {
        const usdaKey = (env && env.USDA_API_KEY) || 'DEMO_KEY';
        const usdaRes = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(cleanUpc)}&dataType=Branded&pageSize=5&api_key=${usdaKey}`);
        if (usdaRes.ok) {
          const usdaData = await usdaRes.json();
          if (usdaData && Array.isArray(usdaData.foods)) {
            const match = usdaData.foods.find(f => {
              const gtin = String(f.gtinUpc || '').replace(/\D/g, '');
              return gtin === cleanUpc || gtin.padStart(12, '0') === cleanUpc.padStart(12, '0') || gtin.padStart(13, '0') === cleanUpc.padStart(13, '0');
            });

            if (match && match.description) {
              const resolved = {
                upc: cleanUpc,
                name: match.description,
                brand: match.brandOwner || match.brandName || 'Grocery Brand',
                ingredients: match.ingredients || '',
                additives: [],
                allergens: []
              };

              if (env && env.RAKKA_COMMUNITY_DB && match.ingredients) {
                ctx.waitUntil(env.RAKKA_COMMUNITY_DB.put(`upc:${cleanUpc}`, JSON.stringify(resolved)));
              }

              return new Response(JSON.stringify({
                found: true,
                source: 'usda_fooddata',
                product: resolved
              }), { headers: corsHeaders });
            }
          }
        }
      } catch (uErr) {}

      // Tier 4: GS1 Manufacturer Prefix Directory
      const GS1_DIRECTORY = {
        '406936': "Mama Cozzi's Pizza Kitchen (Aldi)",
        '406145': "Clancy's / Aldi",
        '406': "Mama Cozzi's / Clancy's (Aldi)",
        '409910': "Bake Shop / Simply Nature (Aldi)",
        '4099': "Bake Shop / Simply Nature (Aldi)",
        '041498': "Aldi Brand (Mama Cozzi's / Clancy's / Millville)",
        '41498': "Aldi Brand (Mama Cozzi's / Clancy's / Millville)",
        '049000': 'Coca-Cola',
        '49000': 'Coca-Cola',
        '072250': 'Flowers Foods (Wonder Bread)',
        '72250': 'Flowers Foods (Wonder Bread)',
        '888109': 'Hostess Brands',
        '088810': 'Hostess Brands',
        '051000': "Campbell's Soup Co.",
        '051500': 'J.M. Smucker Co.',
        '037600': 'Hormel Foods / Skippy',
        '044000': 'Nabisco / Mondelēz',
        '028000': 'Nestlé / Ferrero',
        '034000': "Hershey's",
        '040000': 'Mars Wrigley',
        '028400': 'Frito-Lay',
        '012000': 'PepsiCo',
        '016000': 'General Mills',
        '038000': "Kellogg's",
        '078742': 'Great Value (Walmart)',
        '085239': 'Good & Gather (Target)',
        '096619': 'Kirkland Signature (Costco)',
        '099482': '365 Whole Foods Market',
        '041220': 'H-E-B Brand (Texas)',
        '041415': 'Publix Brand',
        '021130': 'Signature SELECT (Safeway)',
        '077890': 'Wegmans Brand',
        '030034': 'Giant Eagle Brand',
        '024300': 'Little Debbie / McKee Foods',
        '014100': 'Pepperidge Farm',
        '024100': 'Cheez-It / Keebler',
        '041500': "French's / McCormick",
        '048001': "Hellmann's / Unilever",
        '071100': 'Hidden Valley Ranch',
        '076808': 'Barilla Pasta',
        '052000': 'Gatorade / PepsiCo',
        '036800': 'TopCare / Food Club'
      };

      for (const [prefix, mappedBrand] of Object.entries(GS1_DIRECTORY)) {
        if (cleanUpc.startsWith(prefix) || ('0' + cleanUpc).startsWith(prefix)) {
          return new Response(JSON.stringify({
            found: true,
            source: 'gs1_prefix',
            product: {
              upc: cleanUpc,
              name: `${mappedBrand} Packaged Food Item (${cleanUpc})`,
              brand: mappedBrand,
              ingredients: '',
              additives: [],
              allergens: []
            }
          }), { headers: corsHeaders });
        }
      }

      // Not found in any registry
      return new Response(JSON.stringify({
        found: false,
        upc: cleanUpc,
        message: 'Product not yet indexed in public food registries'
      }), { status: 404, headers: corsHeaders });
    }

    // 4. POST /contribute: Community label indexing with Anti-Pollution Validation
    if (request.method === 'POST' && (url.pathname === '/contribute' || url.pathname === '/api/contribute')) {
      try {
        const body = await request.json();
        const cleanUpc = String(body.upc || '').replace(/\D/g, '');
        const productName = String(body.name || '').trim();
        const brandName = String(body.brand || '').trim();
        let ingredients = String(body.ingredients || '').trim();

        // Optional: If an image was submitted, call Gemini 1.5 Flash OCR (free tier)
        if (body.imageBase64 && env && env.GEMINI_API_KEY && !ingredients) {
          try {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: 'Extract ONLY the raw printed ingredient list from this grocery packaging label. Return the exact comma-separated ingredients text without any intro or commentary.' },
                    { inline_data: { mime_type: body.mimeType || 'image/jpeg', data: body.imageBase64.replace(/^data:image\/\w+;base64,/, '') } }
                  ]
                }]
              })
            });
            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const extracted = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (extracted && extracted.length > 5) {
                ingredients = extracted.trim();
              }
            }
          } catch (gErr) {
            console.warn('Gemini OCR fallback error:', gErr);
          }
        }

        // STRICT ANTI-POLLUTION QUALITY GATE:
        // Reject generic placeholders, empty names, or junk inputs
        if (!cleanUpc || cleanUpc.length < 6) {
          return new Response(JSON.stringify({ error: 'Valid barcode required' }), { status: 400, headers: corsHeaders });
        }
        if (!productName || productName.toLowerCase().startsWith('retail grocery item') || productName.length < 3) {
          return new Response(JSON.stringify({ error: 'Meaningful product name required' }), { status: 400, headers: corsHeaders });
        }

        const validFoodTokens = /\b(water|flour|sugar|salt|oil|syrup|yeast|milk|wheat|corn|soy|beef|chicken|pork|egg|eggs|butter|cream|vinegar|extract|juice|starch|protein|flavor|flavors|spice|spices|preservative|calcium|sodium|potassium|acid|gum|lecithin|dextrose|cocoa|oats|rice|cheese|tomato|potato|beans|cocoa)\b/i;
        if (ingredients && !validFoodTokens.test(ingredients)) {
          return new Response(JSON.stringify({ error: 'Ingredients must contain valid food components' }), { status: 400, headers: corsHeaders });
        }

        const record = {
          upc: cleanUpc,
          name: productName,
          brand: brandName || 'Grocery Brand',
          ingredients: ingredients || '',
          additives: [],
          allergens: [],
          verifiedAt: new Date().toISOString()
        };

        if (env && env.RAKKA_COMMUNITY_DB) {
          await env.RAKKA_COMMUNITY_DB.put(`upc:${cleanUpc}`, JSON.stringify(record));
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Product successfully indexed in community cache',
          product: record
        }), { status: 201, headers: corsHeaders });
      } catch (parseErr) {
        return new Response(JSON.stringify({ error: 'Invalid contribution payload' }), { status: 400, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers: corsHeaders });
  }
};
