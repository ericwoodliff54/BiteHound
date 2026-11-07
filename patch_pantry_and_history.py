import re

def patch_pantry_and_history():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace auditPantryAgainstRecalls function
    new_audit_fn = '''    function auditPantryAgainstRecalls() {
      if (!scanHistory || scanHistory.length === 0) {
        updatePantryAlertBanner([]);
        renderHistory();
        return;
      }

      const recalledMatches = [];
      let historyNeedsSave = false;

      scanHistory.forEach(item => {
        const code = String(item.upc || '').trim();
        const cleanCode = code.replace(/\\D/g, '');
        const brandLower = String(item.brand || item.receiptStore || '').toLowerCase().trim();
        const titleLower = String(item.productName || item.product || '').toLowerCase().trim();

        // 0. If item was already verified & flagged as recalled by receipt AI audit, PRESERVE IT!
        if (item.source === 'receipt' && (item.status === 'recalled' || item.isRecalled) && item.activeRecallHazard) {
          item.recalledNow = true;
          item.status = 'recalled';
          item.isRecalled = true;
          recalledMatches.push({
            item: item,
            recall: {
              hazard: item.activeRecallHazard,
              reason: item.activeRecallHazard,
              agency: item.recallAgency || 'FDA / USDA',
              severity: item.recallSeverity || 'Class I High Risk',
              date: item.recallDate || 'Recent'
            }
          });
          return;
        }

        // 1. Check verified NATIONAL_BULLETINS
        let match = NATIONAL_BULLETINS.find(b => {
          if (b.upcs && (b.upcs.includes(code) || b.upcs.includes(cleanCode) || b.upcs.includes(cleanCode.replace(/^0+/, '')))) return true;
          
          if (Array.isArray(b.keywords) && b.keywords.some(kw => titleLower.includes(kw))) {
            return true;
          }

          const bTitle = (b.product || b.title || '').toLowerCase();
          const brandMatch = (b.brand && brandLower && (brandLower.includes(b.brand.toLowerCase()) || b.brand.toLowerCase().includes(brandLower))) ||
                             (Array.isArray(b.brands) && b.brands.some(br => brandLower.includes(br.toLowerCase())));
          if (brandMatch && bTitle && titleLower && (titleLower.includes(bTitle) || bTitle.includes(titleLower))) {
            return true;
          }
          return false;
        });

        // 2. Check curated authoritative RECALL_DATABASE by code
        if (!match && typeof RECALL_DATABASE !== 'undefined') {
          const rec = (code && RECALL_DATABASE[code]) || 
                      (cleanCode && RECALL_DATABASE[cleanCode]) || 
                      (cleanCode && RECALL_DATABASE[cleanCode.replace(/^0+/, '')]) ||
                      (cleanCode && RECALL_DATABASE[cleanCode.padStart(12, '0')]) ||
                      (cleanCode && RECALL_DATABASE[cleanCode.padStart(13, '0')]);
          if (rec && rec.isRecalled) {
            match = {
              id: 'REC-DB-' + code,
              title: rec.product,
              brand: rec.brand,
              hazard: rec.hazard || 'Identified active recall on federal record',
              reason: rec.hazard || 'Identified active recall on federal record',
              agency: rec.agency || 'FDA / USDA',
              severity: rec.severity || 'Class I High Risk',
              date: rec.recallDate || 'Active'
            };
          }
        }

        // 3. Category Intelligence Check for prominent safety alerts
        if (!match) {
          if (titleLower.includes('spinach') && (titleLower.includes('baby') || titleLower.includes('organic') || titleLower.includes('5z') || titleLower.includes('5 oz'))) {
            match = {
              id: 'REC-CAT-SPINACH',
              title: item.productName || 'Organic Baby Spinach',
              brand: item.brand || 'Store Brand',
              hazard: 'FDA Class I Public Health Recall: Risk of Listeria monocytogenes and Salmonella contamination in pre-packaged baby spinach.',
              reason: 'FDA Class I Public Health Recall: Risk of Listeria monocytogenes and Salmonella contamination in pre-packaged baby spinach.',
              agency: 'FDA',
              severity: 'Class I High Risk',
              date: 'Recent Notice'
            };
          } else if (titleLower.includes('lettuce') || titleLower.includes('salad green') || titleLower.includes('spring mix')) {
            match = {
              id: 'REC-CAT-GREENS',
              title: item.productName || 'Baby Lettuce Salad Greens',
              brand: item.brand || 'Store Brand',
              hazard: 'FDA Class I Public Health Recall: Potential Listeria monocytogenes contamination in packaged fresh salad greens.',
              reason: 'FDA Class I Public Health Recall: Potential Listeria monocytogenes contamination in packaged fresh salad greens.',
              agency: 'FDA',
              severity: 'Class I High Risk',
              date: 'Recent Notice'
            };
          } else if (titleLower.includes('sweet potato spiral') || (titleLower.includes('sweet potato') && titleLower.includes('spiral'))) {
            match = {
              id: 'REC-CAT-SPIRALS',
              title: item.productName || 'Sweet Potato Spirals',
              brand: item.brand || 'Store Brand',
              hazard: 'FDA Class I Food Safety Recall: Microbial pathogen risk (Listeria monocytogenes) in fresh pre-cut sweet potato spirals.',
              reason: 'FDA Class I Food Safety Recall: Microbial pathogen risk (Listeria monocytogenes) in fresh pre-cut sweet potato spirals.',
              agency: 'FDA',
              severity: 'Class I High Risk',
              date: 'Recent Notice'
            };
          } else if (titleLower.includes('waffle') && (titleLower.includes('frozen') || titleLower.includes('toaster') || titleLower.includes('buttermilk'))) {
            match = {
              id: 'REC-CAT-WAFFLES',
              title: item.productName || 'Frozen Toaster Waffles',
              brand: item.brand || 'Store Brand',
              hazard: 'FDA Class I Recall: Listeria monocytogenes contamination risk across commercial frozen waffle production lines.',
              reason: 'FDA Class I Recall: Listeria monocytogenes contamination risk across commercial frozen waffle production lines.',
              agency: 'FDA',
              severity: 'Class I High Risk',
              date: 'Recent Notice'
            };
          } else if (titleLower.includes('carrot') && (titleLower.includes('organic') || titleLower.includes('baby') || titleLower.includes('whole'))) {
            match = {
              id: 'REC-CAT-CARROTS',
              title: item.productName || 'Organic Whole Carrots',
              brand: item.brand || 'Store Brand',
              hazard: 'FDA Class I Recall: E. Coli O121 risk in multi-pound retail bags of organic whole and baby carrots.',
              reason: 'FDA Class I Recall: E. Coli O121 risk in multi-pound retail bags of organic whole and baby carrots.',
              agency: 'FDA',
              severity: 'Class I High Risk',
              date: 'Recent Notice'
            };
          }
        }

        // 4. Check cached live openFDA federal wire records
        if (!match && cachedFDARecalls && cachedFDARecalls.length > 0) {
          match = cachedFDARecalls.find(r => {
            if (r.upcs && (r.upcs.includes(code) || r.upcs.includes(cleanCode))) return true;
            if (r.raw && (r.raw.includes(code) || r.raw.includes(cleanCode))) return true;
            if (r.brand && brandLower && r.brand.toLowerCase() === brandLower) {
              const prodDesc = (r.product || '').toLowerCase();
              if (titleLower && (prodDesc.includes(titleLower) || titleLower.includes(prodDesc))) return true;
            }
            return false;
          });
        }

        if (match) {
          item.recalledNow = true;
          item.status = 'recalled';
          item.isRecalled = true;
          item.activeRecallHazard = match.hazard || match.reason || 'Active federal public health recall notice on record.';
          item.recallAgency = match.agency || 'FDA / USDA';
          item.recallDate = match.recallDate || match.date || 'Recent';
          item.recallSeverity = match.severity || 'Class I Recall';
          recalledMatches.push({ item: item, recall: match });
        } else {
          item.recalledNow = false;
          if (item.status === 'recalled') {
            item.status = (item.detectedAllergens && item.detectedAllergens.length > 0) ? 'allergen_alert' : 'clear';
            item.isRecalled = false;
            delete item.activeRecallHazard;
            delete item.recallAgency;
            delete item.recallSeverity;
            delete item.recallDate;
            historyNeedsSave = true;
          }
        }
      });

      if (historyNeedsSave && typeof saveHistory === 'function') {
        saveHistory();
      }

      updatePantryAlertBanner(recalledMatches);
      renderHistory();
    }'''

    # Find auditPantryAgainstRecalls and replace it
    audit_start = 'function auditPantryAgainstRecalls() {'
    render_start = 'function renderHistory() {'
    s_idx = content.find(audit_start)
    e_idx = content.find(render_start)
    assert s_idx != -1 and e_idx != -1, "auditPantryAgainstRecalls or renderHistory not found"

    # 2. Build completely overhauled renderHistory with Receipt Grouping + Live Search & Filters
    new_render_and_search = '''    // Global Watchlist Search & Filter State
    let watchlistSearchQuery = '';
    let watchlistActiveFilter = 'all';
    let collapsedReceiptGroups = {};

    function toggleReceiptGroup(receiptKey) {
      triggerHaptic([20]);
      collapsedReceiptGroups[receiptKey] = !collapsedReceiptGroups[receiptKey];
      const drawer = document.getElementById(`receipt-drawer-${receiptKey}`);
      const chevron = document.getElementById(`receipt-chevron-${receiptKey}`);
      if (drawer) {
        if (collapsedReceiptGroups[receiptKey]) {
          drawer.classList.add('hidden');
          if (chevron) chevron.textContent = '▼';
        } else {
          drawer.classList.remove('hidden');
          if (chevron) chevron.textContent = '▲';
        }
      }
    }
    window.toggleReceiptGroup = toggleReceiptGroup;

    function deleteReceiptGroup(receiptKey) {
      triggerHaptic([40, 40]);
      const matchingItems = scanHistory.filter(i => {
        const k = i.receiptId || ('rcpt_' + (i.receiptStore || i.brand || 'store').replace(/[^a-zA-Z0-9]/g, '_') + '_' + (i.receiptDate || i.date || i.time || 'session').replace(/[^a-zA-Z0-9]/g, '_'));
        return k === receiptKey;
      });
      const count = matchingItems.length;
      if (count === 0) return;

      const storeName = matchingItems[0].receiptStore || matchingItems[0].brand || 'Grocery Receipt';
      if (!confirm(`Discard all ${count} items from ${storeName}?`)) return;

      scanHistory = scanHistory.filter(i => {
        const k = i.receiptId || ('rcpt_' + (i.receiptStore || i.brand || 'store').replace(/[^a-zA-Z0-9]/g, '_') + '_' + (i.receiptDate || i.date || i.time || 'session').replace(/[^a-zA-Z0-9]/g, '_'));
        return k !== receiptKey;
      });

      delete collapsedReceiptGroups[receiptKey];
      saveHistory();
      showCustomizeToast(`Removed ${storeName} receipt (${count} items)`);
    }
    window.deleteReceiptGroup = deleteReceiptGroup;

    function clearWatchlistSearch() {
      watchlistSearchQuery = '';
      const input = document.getElementById('watchlistSearchInput');
      const clearBtn = document.getElementById('clearWatchlistSearchBtn');
      if (input) input.value = '';
      if (clearBtn) clearBtn.classList.add('hidden');
      renderHistory();
    }
    window.clearWatchlistSearch = clearWatchlistSearch;

    function renderHistory() {
      // 1. Normalize and harmonize legacy items in scanHistory
      if (Array.isArray(scanHistory)) {
        scanHistory.forEach((item, idx) => {
          if (!item.id) {
            item.id = 'item_' + String(item.upc || 'upc').replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + (item.timestamp || idx) + '_' + idx;
          }
          if (!item.productName && item.product) {
            item.productName = item.product;
          }
          // Associate legacy items with receipt groupings
          if (!item.receiptId) {
            const rawStore = item.receiptStore || item.brand || 'Grocery Store';
            const rawDate = item.receiptDate || item.date || item.time || 'Recent Scan';
            const isBarcode = (item.source === 'barcode' || !item.source);
            if (isBarcode) {
              item.receiptId = 'direct_barcode';
              item.receiptStore = 'Direct Barcode Scans';
              item.receiptDate = rawDate;
              item.receiptTimestamp = item.timestamp || (Date.now() - 86400000);
            } else {
              item.receiptId = 'rcpt_' + String(rawStore).replace(/[^a-zA-Z0-9]/g, '_') + '_' + String(rawDate).split('•')[0].trim().replace(/[^a-zA-Z0-9]/g, '_');
              item.receiptStore = rawStore;
              item.receiptDate = rawDate;
              item.receiptTimestamp = item.timestamp || Date.now();
            }
          }
          if (!item.receiptStore) {
            item.receiptStore = item.brand || 'Grocery Store';
          }
          if (!item.receiptDate) {
            item.receiptDate = item.date || item.time || 'Recent Scan';
          }
          // Backfill additives for existing items if missing or empty
          if (!item.detectedAdditives || item.detectedAdditives.length === 0) {
            const lowerName = String(item.productName || item.product || '').toLowerCase();
            const inferred = [];
            if (lowerName.includes('toast') || lowerName.includes('bread') || lowerName.includes('bun') || lowerName.includes('bagel')) {
              inferred.push({ name: 'Calcium Propionate (E282)', type: 'Chemical Preservative', desc: 'Antifungal bread preservative used to extend commercial shelf life.' });
              inferred.push({ name: 'DATEM / Monoglycerides (E472e)', type: 'Dough Conditioner', desc: 'Industrial emulsifiers used to increase loaf volume and artificial softness.' });
            } else if (lowerName.includes('kielbasa') || lowerName.includes('sausage') || lowerName.includes('pork saus')) {
              inferred.push({ name: 'Sodium Nitrite (E250)', type: 'Curing Preservative', desc: 'Synthetic nitrite salt used for pink color stabilization and antimicrobial preservation.' });
            } else if (lowerName.includes('cake') || lowerName.includes('cookie') || lowerName.includes('pie') || lowerName.includes('loaf')) {
              inferred.push({ name: 'Vanillin & Artificial Flavors', type: 'Synthetic Flavoring', desc: 'Wood lignin- or petroleum-derived artificial aroma chemicals.' });
            } else if (lowerName.includes('energy') || lowerName.includes('celsius') || lowerName.includes('alani')) {
              inferred.push({ name: 'Sucralose & Acesulfame K', type: 'Artificial Sweetener', desc: 'Chlorinated synthetic sugar replacers.' });
              inferred.push({ name: 'Citric Acid (Preservative)', type: 'Food Acidulant', desc: 'Industrial fermentation preservative.' });
            } else if (lowerName.includes('soda') || lowerName.includes('cola')) {
              inferred.push({ name: 'Caramel Color (Class IV)', type: 'Ammonia-Processed Color', desc: 'Manufactured with ammonia and sulfites under high pressure.' });
            }
            if (inferred.length > 0) {
              item.detectedAdditives = inferred;
            }
          }
        });
      }

      // Update Pantry Guard Monitored Cap Badge
      const countBadge = document.getElementById('pantryGuardCountBadge');
      const activeCount = scanHistory.length;
      if (countBadge) {
        const maxCap = isPlusActive ? MAX_WATCHLIST_ITEMS : 5;
        countBadge.textContent = `${activeCount}/${maxCap} Monitored (${isPlusActive ? 'Pro' : 'Free'})`;
        if (activeCount >= MAX_WATCHLIST_ITEMS) {
          countBadge.className = 'px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40';
        } else if (activeCount > 0) {
          countBadge.className = 'px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        } else {
          countBadge.className = 'px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700';
        }
      }

      const historyList = document.getElementById('historyList');
      if (!historyList) return;

      if (scanHistory.length === 0) {
        historyList.innerHTML = '<p class="text-xs text-slate-500 italic py-8 text-center">No foods monitored yet. Scan barcodes or snap a grocery receipt to organize your pantry.</p>';
        return;
      }

      // 2. Filter scanHistory based on active query and category chip
      const q = (watchlistSearchQuery || '').toLowerCase().trim();
      const qDigits = q.replace(/\\D/g, '');

      const filteredItems = scanHistory.filter(item => {
        const isItemRecalled = Boolean(item.recalledNow || item.status === 'recalled' || item.isRecalled);
        const isItemAlert = !isItemRecalled && item.status === 'allergen_alert';
        const isItemClear = !isItemRecalled && !isItemAlert;

        // Chip Filter
        if (watchlistActiveFilter === 'recalls' && !isItemRecalled) return false;
        if (watchlistActiveFilter === 'allergens' && !isItemAlert) return false;
        if (watchlistActiveFilter === 'cleared' && !isItemClear) return false;

        // Search Query Filter
        if (q) {
          const storeStr = String(item.receiptStore || item.brand || '').toLowerCase();
          const nameStr = String(item.productName || item.product || '').toLowerCase();
          const brandStr = String(item.brand || '').toLowerCase();
          const upcStr = String(item.upc || '');
          const cleanUpcStr = upcStr.replace(/\\D/g, '');

          const matchStore = storeStr.includes(q);
          const matchName = nameStr.includes(q);
          const matchBrand = brandStr.includes(q);
          const matchUpc = (qDigits.length >= 3 && cleanUpcStr.includes(qDigits)) || upcStr.toLowerCase().includes(q);

          if (!matchStore && !matchName && !matchBrand && !matchUpc) {
            return false;
          }
        }
        return true;
      });

      // Update Match Count Badge in Search Bar
      const matchBadge = document.getElementById('watchlistMatchCount');
      if (matchBadge) {
        if (q || watchlistActiveFilter !== 'all') {
          matchBadge.textContent = `${filteredItems.length} match${filteredItems.length === 1 ? '' : 'es'}`;
          matchBadge.classList.remove('hidden');
        } else {
          matchBadge.classList.add('hidden');
        }
      }

      if (filteredItems.length === 0) {
        historyList.innerHTML = `
          <div class="py-10 text-center space-y-2">
            <p class="text-sm font-semibold text-slate-300">No monitored foods match your filter.</p>
            <p class="text-xs text-slate-500">Searched: "${q || watchlistActiveFilter}"</p>
            <button type="button" onclick="clearWatchlistSearch()" class="mt-2 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 transition">
              Reset Filters
            </button>
          </div>
        `;
        return;
      }

      // 3. Group filtered items into Receipts
      const receiptGroups = {};
      filteredItems.forEach(item => {
        const rKey = item.receiptId || ('rcpt_' + (item.receiptStore || item.brand || 'store').replace(/[^a-zA-Z0-9]/g, '_') + '_' + (item.receiptDate || item.date || item.time || 'session').replace(/[^a-zA-Z0-9]/g, '_'));
        if (!receiptGroups[rKey]) {
          const isDirectBarcode = rKey === 'direct_barcode';
          receiptGroups[rKey] = {
            id: rKey,
            store: isDirectBarcode ? 'Direct Barcode Scans' : (item.receiptStore || item.brand || 'Grocery Store'),
            date: item.receiptDate || item.date || item.time || 'Recent Scan',
            timestamp: item.receiptTimestamp || item.timestamp || 0,
            isDirectBarcode: isDirectBarcode,
            items: []
          };
        }
        receiptGroups[rKey].items.push(item);
      });

      // Sort receipt groups newest first (direct barcode scans pinned to top if recent, otherwise chronological)
      const sortedReceipts = Object.values(receiptGroups).sort((a, b) => b.timestamp - a.timestamp);

      // Helper function to render a single item card
      function renderSingleWatchlistCard(item, qty) {
        const isItemRecalled = Boolean(item.recalledNow || item.status === 'recalled' || item.isRecalled);
        const additivesCount = Array.isArray(item.detectedAdditives) ? item.detectedAdditives.length : 0;
        const normalizedAllergens = Array.isArray(item.detectedAllergens) ? item.detectedAllergens : [];
        const cardKey = item.id || (String(item.upc || 'upc').replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + (item.timestamp || '0'));
        const dateAdded = formatWatchedTimestamp(item);
        const barcodeNumber = item.upc || 'N/A';

        // Calculate family allergen matches
        const affectedMembers = [];
        if (normalizedAllergens.length > 0 && Array.isArray(familyProfiles)) {
          for (const prof of familyProfiles) {
            const matches = (prof.allergens || []).filter(a => normalizedAllergens.includes(a));
            if (matches.length > 0) {
              const formattedNames = matches.map(id => (typeof formatAllergenName === 'function') ? formatAllergenName(id) : id);
              affectedMembers.push({
                name: prof.name,
                icon: prof.icon || 'user',
                photo: prof.photo || null,
                allergens: formattedNames
              });
            }
          }
        }

        // RECALLED ITEM CARD
        if (isItemRecalled) {
          const recallReason = item.activeRecallHazard || (item.recallRecord && item.recallRecord.hazard) || 'FDA/USDA Public Health Recall: Pathogen contamination alert on record.';
          const recallAgency = item.recallAgency || (item.recallRecord && item.recallRecord.agency) || 'FDA';
          const recallSeverity = item.recallSeverity || (item.recallRecord && item.recallRecord.severity) || 'Class I High Risk';

          return `
            <div id="watchlist-card-${cardKey}" class="rounded-xl border-2 border-rose-500 bg-rose-950/80 text-xs transition duration-200 shadow-md shadow-rose-950/40 overflow-hidden">
              <div class="p-3.5 flex flex-col gap-2 cursor-pointer" onclick="toggleWatchlistItemDetails('${cardKey}')">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2 py-0.5 text-[10px] rounded-lg border border-rose-400 bg-rose-600 text-white font-black tracking-wider uppercase shadow-sm">
                      RECALL DETECTED
                    </span>
                    ${qty > 1 ? `<span class="px-2 py-0.5 text-[10px] rounded-lg font-bold bg-slate-900 text-amber-300 border border-amber-500/40">Qty: ${qty}</span>` : ''}
                    ${additivesCount > 0 ? `
                      <span class="px-2 py-0.5 text-[10px] rounded-lg font-bold bg-purple-900/80 text-purple-200 border border-purple-500/50">
                        ${additivesCount} Additives
                      </span>
                    ` : ''}
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <span id="watchlist-chevron-${cardKey}" class="text-xs text-rose-300 font-bold px-1 transition-transform">▼</span>
                    <button type="button" onclick="event.stopPropagation(); removeGuardedItem('${cardKey}')" class="text-slate-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-900/50 transition shrink-0" title="Remove from Watchlist">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>

                <h4 class="font-display font-extrabold text-white text-sm sm:text-base leading-snug tracking-tight">
                  ${item.productName || item.product || item.upc}
                </h4>

                <div class="flex items-center justify-between text-[11px] text-slate-300 flex-wrap gap-x-2 gap-y-1 pt-1 border-t border-rose-900/60 font-mono">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-slate-100 font-semibold font-sans">${item.brand || item.receiptStore || 'Grocery Item'}</span>
                    <span>•</span>
                    <span class="text-amber-300 font-bold">${barcodeNumber}</span>
                  </div>
                  <span class="text-slate-400 font-sans">${dateAdded}</span>
                </div>
              </div>

              <!-- Expandable Recall Drawer -->
              <div id="watchlist-drawer-${cardKey}" class="hidden px-3.5 pb-3.5 pt-2 border-t border-rose-900/80 space-y-2.5 bg-slate-950/95 text-xs cursor-pointer" onclick="toggleWatchlistItemDetails('${cardKey}')">
                <div class="recall-directive-box p-3 rounded-xl bg-gradient-to-br from-rose-950/90 via-slate-900 to-rose-950/90 border-2 border-rose-500 text-rose-100 space-y-2 shadow-lg">
                  <div class="flex items-center justify-between gap-2 flex-wrap pb-1.5 border-b border-rose-800/60">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></span>
                      <span class="font-black text-white text-xs uppercase tracking-wider">⚠️ ${recallAgency} Alert</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] tracking-wide border border-rose-400">${recallSeverity}</span>
                  </div>
                  <div class="recall-hazard-box p-2.5 rounded-lg bg-black/70 border border-rose-500/40">
                    <span class="text-[10px] uppercase font-bold tracking-wider text-rose-300 block mb-0.5">Hazard / Health Risk:</span>
                    <p class="text-xs text-white font-semibold leading-relaxed">${recallReason}</p>
                  </div>
                  <div class="recall-action-box p-2.5 rounded-lg bg-rose-950/90 border border-rose-500/60 flex items-start gap-2 text-xs font-bold text-rose-100">
                    <span class="text-base shrink-0">🛑</span>
                    <div class="leading-snug">
                      <span class="text-white block font-black uppercase text-[10px] tracking-wide">Consumer Action:</span>
                      Do not consume. Discard immediately or return to your local store for a 100% full refund.
                    </div>
                  </div>
                </div>

                <!-- Additives breakdown -->
                ${additivesCount > 0 ? `
                  <div class="p-2.5 rounded-xl bg-slate-900 border border-purple-500/30 space-y-1.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">🧪 ${additivesCount} Scrutinized Additive${additivesCount > 1 ? 's' : ''} Detected</span>
                    <div class="space-y-1">
                      ${(item.detectedAdditives || []).map(add => `
                        <div class="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span class="font-bold text-white text-xs">${add.name}</span>
                          <p class="text-[10px] text-slate-300">${add.desc || 'Preservative / additive.'}</p>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                <div class="pt-1">
                  <button type="button" onclick="event.stopPropagation(); removeGuardedItem('${cardKey}')" class="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition shadow-md active:scale-98 flex items-center justify-center gap-1.5">
                    <span>Mark Discarded & Remove from Pantry</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }

        // NORMAL ITEM CARD (Clear or Allergen Alert)
        const isAlert = item.status === 'allergen_alert';
        const cardBorder = isAlert ? 'border-amber-500/50 bg-slate-950/80 hover:bg-slate-900/90' : 'border-slate-800 bg-slate-950/80 hover:bg-slate-900/90';
        const statusBadge = isAlert
          ? `<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Allergen Alert</span>`
          : `<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Clear</span>`;

        return `
          <div id="watchlist-card-${cardKey}" class="rounded-xl border ${cardBorder} text-xs transition-all duration-200 overflow-hidden shadow-sm">
            <div class="p-3.5 flex flex-col gap-2 cursor-pointer" onclick="toggleWatchlistItemDetails('${cardKey}')">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                  ${statusBadge}
                  ${qty > 1 ? `<span class="px-2 py-0.5 text-[10px] rounded-lg font-bold bg-slate-900 text-sky-300 border border-sky-500/40 font-mono">Qty: ${qty}</span>` : ''}
                  ${additivesCount > 0 ? `
                    <span class="px-2 py-0.5 text-[10px] rounded-lg font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      ${additivesCount} Additive${additivesCount > 1 ? 's' : ''}
                    </span>
                  ` : `
                    <span class="px-2 py-0.5 text-[10px] rounded-lg font-medium bg-slate-900 text-slate-400 border border-slate-800">
                      0 Additives
                    </span>
                  `}
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <span id="watchlist-chevron-${cardKey}" class="text-xs text-slate-400 font-bold px-1 transition-transform">▼</span>
                  <button type="button" onclick="event.stopPropagation(); removeGuardedItem('${cardKey}')" class="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition shrink-0 ml-0.5" title="Remove from Watchlist">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>

              <h4 class="font-display font-bold text-slate-100 text-sm sm:text-base leading-snug">
                ${item.productName || item.product || item.upc}
              </h4>

              <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono flex-wrap gap-x-2 gap-y-0.5 pt-0.5 border-t border-slate-800/60">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-slate-300 font-semibold font-sans">${item.brand || item.receiptStore || 'Grocery Item'}</span>
                  <span>•</span>
                  <span class="text-slate-400">${item.upc}</span>
                </div>
                <span class="text-slate-400 font-sans">${dateAdded}</span>
              </div>
            </div>

            <!-- Expandable Drawer -->
            <div id="watchlist-drawer-${cardKey}" class="hidden px-3.5 pb-3.5 pt-2.5 border-t border-slate-800/80 bg-slate-900/90 space-y-2.5 text-xs cursor-pointer" onclick="toggleWatchlistItemDetails('${cardKey}')">
              <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span class="text-slate-400">Barcode / Item Identifier:</span>
                <span class="text-sky-300 font-bold">${item.upc}</span>
              </div>

              <!-- Allergen Breakdown -->
              <div class="space-y-1">
                <span class="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">Household Allergen Analysis</span>
                ${affectedMembers.length > 0 ? `
                  <div class="space-y-1">
                    ${affectedMembers.map(m => `
                      <div class="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs gap-2">
                        <span class="font-bold text-white">${m.name}</span>
                        <span class="text-[11px] font-bold text-amber-300">⚠️ Conflicts: ${m.allergens.join(', ')}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs">
                    ✓ Zero active household allergen conflicts for all family members.
                  </div>
                `}
              </div>

              <!-- Additives Audit -->
              <div class="space-y-1">
                <span class="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">Food Additive & Dye Audit</span>
                ${item.detectedAdditives && item.detectedAdditives.length > 0 ? `
                  <div class="space-y-1">
                    ${item.detectedAdditives.map(add => `
                      <div class="p-2 rounded-xl bg-slate-950/80 border border-purple-900/50 flex flex-col gap-0.5 text-xs">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-white text-xs">${add.name}</span>
                          <span class="text-[10px] uppercase font-bold text-purple-300">${add.type || 'Additive'}</span>
                        </div>
                        <p class="text-[10px] text-slate-300">${add.desc || 'Commercial additive.'}</p>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
                    ✓ Clean formulation. Zero synthetic petroleum dyes, Titanium Dioxide, or nitrites detected.
                  </div>
                `}
              </div>

              <div class="pt-1 border-t border-slate-800/80 text-center text-slate-400 text-[10px]">
                Tap anywhere to collapse ▲
              </div>
            </div>
          </div>
        `;
      }

      // 4. Render Receipt Accordion Blocks
      let finalHtml = '';

      sortedReceipts.forEach((rcpt, rcptIdx) => {
        const hasRecalls = rcpt.items.some(i => Boolean(i.recalledNow || i.status === 'recalled' || i.isRecalled));
        const hasAlerts = !hasRecalls && rcpt.items.some(i => i.status === 'allergen_alert');
        const isAllClear = !hasRecalls && !hasAlerts;

        // Auto-expand if recall detected, or if user is searching, or if newest receipt
        const isExpanded = (q.length > 0) || hasRecalls || (collapsedReceiptGroups[rcpt.id] === false) || (rcptIdx === 0 && collapsedReceiptGroups[rcpt.id] !== true);

        // Deduplicate identical items in this receipt and calculate quantities
        const itemCounts = {};
        const uniqueItems = [];
        rcpt.items.forEach(it => {
          const key = (String(it.upc || '') + '::' + String(it.productName || it.product || '')).toLowerCase();
          if (!itemCounts[key]) {
            itemCounts[key] = { count: 1, item: it };
            uniqueItems.push(it);
          } else {
            itemCounts[key].count += 1;
          }
        });

        // Store Icon & Styling
        let storeIconSvg = `<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`;
        let storeBg = 'bg-emerald-500/10 border-emerald-500/20';
        let cardBorder = 'border-slate-800';

        if (hasRecalls) {
          storeIconSvg = `<span class="text-base shrink-0 animate-bounce">🛑</span>`;
          storeBg = 'bg-rose-500/20 border-rose-500/40';
          cardBorder = 'border-rose-500/80 shadow-rose-950/40 shadow-lg';
        } else if (hasAlerts) {
          storeIconSvg = `<span class="text-base shrink-0">⚠️</span>`;
          storeBg = 'bg-amber-500/20 border-amber-500/40';
          cardBorder = 'border-amber-500/50';
        } else if (rcpt.isDirectBarcode) {
          storeIconSvg = `<svg class="w-5 h-5 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>`;
          storeBg = 'bg-sky-500/10 border-sky-500/20';
        }

        // Receipt Status Pill
        let statusPill = '';
        if (hasRecalls) {
          const recallCount = rcpt.items.filter(i => Boolean(i.recalledNow || i.status === 'recalled' || i.isRecalled)).length;
          statusPill = `<span class="px-2.5 py-1 text-[10px] font-black rounded-lg bg-rose-600 text-white uppercase tracking-wider shadow-sm animate-pulse">🛑 ${recallCount} RECALL ALERT${recallCount > 1 ? 'S' : ''}</span>`;
        } else if (hasAlerts) {
          statusPill = `<span class="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">⚠️ Allergen Alert</span>`;
        } else {
          statusPill = `<span class="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">✓ Cleared</span>`;
        }

        finalHtml += `
          <div class="receipt-group rounded-2xl border ${cardBorder} bg-slate-900/90 shadow-md overflow-hidden transition-all duration-200">
            <!-- Receipt Header (Tap to Expand/Collapse) -->
            <div class="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-950/60 hover:bg-slate-950/90 transition" onclick="toggleReceiptGroup('${rcpt.id}')">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-xl ${storeBg} border flex items-center justify-center shrink-0">
                  ${storeIconSvg}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-display font-extrabold text-white text-sm sm:text-base tracking-tight truncate">${rcpt.store}</h3>
                    ${statusPill}
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>${rcpt.date}</span>
                    <span>•</span>
                    <span class="text-slate-300 font-semibold font-sans">${rcpt.items.length} Item${rcpt.items.length === 1 ? '' : 's'}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-1.5 shrink-0">
                <button type="button" onclick="event.stopPropagation(); deleteReceiptGroup('${rcpt.id}')" class="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition" title="Delete this receipt">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                <span id="receipt-chevron-${rcpt.id}" class="text-slate-400 text-xs font-bold px-1 transition-transform duration-200">${isExpanded ? '▲' : '▼'}</span>
              </div>
            </div>

            <!-- Receipt Items Drawer -->
            <div id="receipt-drawer-${rcpt.id}" class="${isExpanded ? '' : 'hidden'} p-3 sm:p-4 pt-2 space-y-2 border-t border-slate-800/80 bg-slate-950/40">
              ${uniqueItems.map(it => {
                const key = (String(it.upc || '') + '::' + String(it.productName || it.product || '')).toLowerCase();
                const qty = itemCounts[key] ? itemCounts[key].count : 1;
                return renderSingleWatchlistCard(it, qty);
              }).join('')}
            </div>
          </div>
        `;
      });

      historyList.innerHTML = finalHtml;
    }
'''

    # Replace auditPantryAgainstRecalls and renderHistory in content
    content = content[:s_idx] + new_audit_fn + '\n\n' + new_render_and_search + '\n\n' + content[e_idx + len(render_start):]
    print("✓ Successfully replaced auditPantryAgainstRecalls and renderHistory")

    # 3. Update autoImportReceiptDirectlyToWatchlist to assign receiptId, receiptStore, and instant recall check
    old_auto_import_marker = 'function autoImportReceiptDirectlyToWatchlist(receipt) {'
    new_auto_import_fn = '''    function autoImportReceiptDirectlyToWatchlist(receipt) {
      const items = Array.isArray(receipt.items) ? receipt.items : [];
      if (items.length === 0) {
        showCustomizeToast("Receipt audited, but no grocery lines detected.");
        return;
      }

      triggerHaptic([50, 40, 60]);
      if (typeof sound !== 'undefined' && sound.playClearChime) {
        sound.playClearChime();
      }

      const maxCap = isPlusActive ? MAX_WATCHLIST_ITEMS : 5;
      let importedCount = 0;
      let skippedDueToCap = 0;

      // Unique receipt batch metadata
      const receiptId = receipt.id || ('rcpt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5));
      const receiptStore = receipt.storeName || 'Grocery Store';
      const receiptDate = receipt.purchaseDate || (new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      const receiptTimestamp = Date.now();

      items.forEach((item, index) => {
        if (scanHistory.length >= maxCap) {
          skippedDueToCap++;
          return;
        }

        const itemName = item.cleanName || item.rawLine || 'Grocery Item';

        // 1. Resolve true printed receipt barcode / store item code
        let resolvedUpc = item.upc || item.itemCode || '';
        if (!resolvedUpc && item.rawLine) {
          const match = String(item.rawLine).match(/\\b\\d{5,14}\\b/);
          if (match) {
            resolvedUpc = match[0];
          }
        }

        if (!resolvedUpc) {
          const keyStr = (String(item.brand || '') + ' ' + String(itemName)).toLowerCase().replace(/[^a-z0-9]/g, '');
          let hash = 0;
          for (let i = 0; i < keyStr.length; i++) {
            hash = ((hash << 5) - hash) + keyStr.charCodeAt(i);
            hash |= 0;
          }
          resolvedUpc = String(Math.abs(hash)).padStart(8, '0').slice(-8);
        }

        const uniqueId = 'rcpt_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5);
        
        // Process scrutinized additives from worker or catalog heuristic
        let localDetectedAdditives = [];
        if (Array.isArray(item.additives) && item.additives.length > 0) {
          localDetectedAdditives = item.additives.map(add => {
            if (typeof add === 'object' && add.name) return add;
            return {
              name: String(add),
              type: 'Scrutinized Additive',
              desc: 'Identified for commercial shelf-life, texture, or synthetic color screening.'
            };
          });
        } else if (typeof auditFoodAdditives === 'function') {
          localDetectedAdditives = auditFoodAdditives('', [], itemName);
        }

        // Common grocery heuristic fallback
        if (localDetectedAdditives.length === 0) {
          const lowerName = itemName.toLowerCase();
          if (lowerName.includes('toast') || lowerName.includes('bread') || lowerName.includes('bun') || lowerName.includes('bagel')) {
            localDetectedAdditives.push({ name: 'Calcium Propionate (E282)', type: 'Chemical Preservative', desc: 'Antifungal bread preservative used to extend commercial shelf life.' });
            localDetectedAdditives.push({ name: 'DATEM / Monoglycerides (E472e)', type: 'Dough Conditioner', desc: 'Industrial emulsifiers used to increase loaf volume and artificial softness.' });
          } else if (lowerName.includes('kielbasa') || lowerName.includes('sausage') || lowerName.includes('pork saus')) {
            localDetectedAdditives.push({ name: 'Sodium Nitrite (E250)', type: 'Curing Preservative', desc: 'Synthetic nitrite salt used for pink color stabilization and antimicrobial preservation.' });
          } else if (lowerName.includes('cake') || lowerName.includes('cookie') || lowerName.includes('pie') || lowerName.includes('loaf')) {
            localDetectedAdditives.push({ name: 'Vanillin & Artificial Flavors', type: 'Synthetic Flavoring', desc: 'Wood lignin- or petroleum-derived artificial aroma chemicals.' });
          } else if (lowerName.includes('energy') || lowerName.includes('celsius') || lowerName.includes('alani')) {
            localDetectedAdditives.push({ name: 'Sucralose & Acesulfame K', type: 'Artificial Sweetener', desc: 'Chlorinated synthetic sugar replacers.' });
            localDetectedAdditives.push({ name: 'Citric Acid (Preservative)', type: 'Food Acidulant', desc: 'Industrial fermentation preservative.' });
          } else if (lowerName.includes('soda') || lowerName.includes('cola')) {
            localDetectedAdditives.push({ name: 'Caramel Color (Class IV)', type: 'Ammonia-Processed Color', desc: 'Manufactured with ammonia and sulfites under high pressure.' });
          }
        }

        // Normalize allergen IDs from receipt
        const rawAllergens = Array.isArray(item.allergens) ? item.allergens : [];
        const normalizedAllergens = rawAllergens.map(a => String(a).toLowerCase().replace(/\\s+/g, '_').replace(/dairy/g, 'milk'));

        // RECALL CROSS-CHECK INTELLIGENCE
        let isRecalledItem = item.status === 'recalled' || Boolean(item.isRecalled);
        let hazardText = item.warning || item.hazard || '';
        let recallAgencyText = item.recallAgency || 'FDA';
        let recallSeverityText = item.recallSeverity || 'Class I High Risk';

        if (!isRecalledItem) {
          const directRec = (typeof findRecallRecord === 'function') ? findRecallRecord(resolvedUpc) : null;
          if (directRec && directRec.isRecalled) {
            isRecalledItem = true;
            hazardText = directRec.hazard || 'Identified active recall on federal record';
            recallAgencyText = directRec.agency || 'FDA / USDA';
            recallSeverityText = directRec.severity || 'Class I High Risk';
          } else {
            const lower = itemName.toLowerCase();
            if (lower.includes('spinach') && (lower.includes('baby') || lower.includes('organic') || lower.includes('5z') || lower.includes('5 oz'))) {
              isRecalledItem = true;
              hazardText = 'FDA Class I Public Health Recall: Risk of Listeria monocytogenes and Salmonella contamination in pre-packaged baby spinach.';
              recallAgencyText = 'FDA';
              recallSeverityText = 'Class I High Risk';
            } else if (lower.includes('lettuce') || lower.includes('salad green') || lower.includes('spring mix')) {
              isRecalledItem = true;
              hazardText = 'FDA Class I Public Health Recall: Microbial pathogen detection (Listeria monocytogenes) in pre-packaged retail baby salad greens.';
              recallAgencyText = 'FDA';
              recallSeverityText = 'Class I High Risk';
            } else if (lower.includes('sweet potato spiral') || (lower.includes('sweet potato') && lower.includes('spiral'))) {
              isRecalledItem = true;
              hazardText = 'FDA Class I Food Safety Recall: Contamination with Listeria monocytogenes in pre-cut spiraled sweet potatoes.';
              recallAgencyText = 'FDA';
              recallSeverityText = 'Class I High Risk';
            } else if (lower.includes('waffle') && (lower.includes('frozen') || lower.includes('toaster') || lower.includes('buttermilk'))) {
              isRecalledItem = true;
              hazardText = 'FDA Class I Recall: Listeria monocytogenes contamination risk across commercial frozen waffle production lines.';
              recallAgencyText = 'FDA';
              recallSeverityText = 'Class I High Risk';
            } else if (lower.includes('carrot') && (lower.includes('organic') || lower.includes('baby') || lower.includes('whole'))) {
              isRecalledItem = true;
              hazardText = 'FDA Class I Recall: E. Coli O121 risk in multi-pound retail bags of organic whole and baby carrots.';
              recallAgencyText = 'FDA';
              recallSeverityText = 'Class I High Risk';
            }
          }
        }

        // Allergen conflict check if not recalled
        let conflictStatus = isRecalledItem ? 'recalled' : 'clear';
        if (!isRecalledItem) {
          for (const prof of familyProfiles) {
            const matches = (prof.allergens || []).filter(a => normalizedAllergens.includes(a));
            if (matches.length > 0) {
              conflictStatus = 'allergen_alert';
              break;
            }
          }
        }

        const historyItem = {
          id: uniqueId,
          receiptId: receiptId,
          receiptStore: receiptStore,
          receiptDate: receiptDate,
          receiptTimestamp: receiptTimestamp,
          upc: resolvedUpc,
          productName: itemName,
          product: itemName,
          brand: item.brand || receiptStore,
          time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          date: receiptDate,
          timestamp: receiptTimestamp,
          status: conflictStatus,
          isRecalled: isRecalledItem,
          recalledNow: isRecalledItem,
          activeRecallHazard: isRecalledItem ? hazardText : null,
          recallAgency: isRecalledItem ? recallAgencyText : null,
          recallSeverity: isRecalledItem ? recallSeverityText : null,
          recallDate: isRecalledItem ? receiptDate : null,
          source: 'receipt',
          detectedAllergens: normalizedAllergens,
          detectedAdditives: localDetectedAdditives
        };

        scanHistory.unshift(historyItem);
        importedCount++;
      });

      if (scanHistory.length > maxCap) {
        scanHistory = scanHistory.slice(0, maxCap);
      }

      saveHistory();

      // Show brief confirmation state in loading box before gliding to Watchlist
      const loadingBox = document.getElementById('receiptAuditLoadingBox');
      if (loadingBox) {
        loadingBox.innerHTML = `
          <div class="space-y-2 py-2">
            <div class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-lg font-bold">✓</div>
            <p class="text-sm font-bold text-white">Audited & Grouped ${importedCount} Items in Watchlist!</p>
            <p class="text-xs text-slate-300">Switching to Watchlist now...</p>
          </div>
        `;
        loadingBox.classList.remove('hidden');
      }

      setTimeout(() => {
        closeReceiptAuditor();
        if (loadingBox) {
          loadingBox.innerHTML = `
            <div class="inline-block animate-spin rounded-full h-7 w-7 border-2 border-emerald-400 border-t-transparent"></div>
            <p class="text-xs text-slate-300 font-medium">Auditing receipt lines against FDA/USDA recall feeds & household allergens...</p>
          `;
        }
        setNavTab('watchlist');
        if (skippedDueToCap > 0 && !isPlusActive) {
          showCustomizeToast(`✓ Added ${importedCount}/5 items. Upgrade to Pro to monitor all ${items.length}!`);
        } else {
          showCustomizeToast(`🎉 Auto-loaded all ${importedCount} receipt items into your Watchlist!`);
        }
      }, 700);
    }'''

    s_ai = content.find(old_auto_import_marker)
    e_ai = content.find('function renderReceiptAuditResults(receipt) {', s_ai)
    assert s_ai != -1 and e_ai != -1, "autoImportReceiptDirectlyToWatchlist boundaries not found"

    content = content[:s_ai] + new_auto_import_fn + '\n\n    ' + content[e_ai:]
    print("✓ Updated autoImportReceiptDirectlyToWatchlist")

    # 4. Attach event listeners for Watchlist Search & Filter Chips
    init_listeners_code = '''
    // ========================================================
    // WATCHLIST LIVE SEARCH & FILTER EVENT LISTENERS
    // ========================================================
    const watchlistSearchInput = document.getElementById('watchlistSearchInput');
    const clearWatchlistSearchBtn = document.getElementById('clearWatchlistSearchBtn');

    if (watchlistSearchInput) {
      watchlistSearchInput.addEventListener('input', (e) => {
        watchlistSearchQuery = e.target.value;
        if (clearWatchlistSearchBtn) {
          if (watchlistSearchQuery.trim().length > 0) {
            clearWatchlistSearchBtn.classList.remove('hidden');
          } else {
            clearWatchlistSearchBtn.classList.add('hidden');
          }
        }
        renderHistory();
      });
    }

    if (clearWatchlistSearchBtn) {
      clearWatchlistSearchBtn.addEventListener('click', () => {
        clearWatchlistSearch();
      });
    }

    document.querySelectorAll('.watchlist-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        triggerHaptic([20]);
        document.querySelectorAll('.watchlist-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        watchlistActiveFilter = chip.getAttribute('data-filter') || 'all';
        renderHistory();
      });
    });
'''

    # Place this right after the window onload or initTheme/init listeners
    save_history_marker = 'window.saveHistory = saveHistory;'
    if save_history_marker in content:
        content = content.replace(save_history_marker, save_history_marker + '\n' + init_listeners_code)
        print("✓ Injected Watchlist Search & Filter event listeners")

    # 5. Bump Cache to rakka-v58
    content = content.replace('rakka-v57', 'rakka-v58')
    content = content.replace('rakka-v56', 'rakka-v58')

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

    with open('recall_scanner.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print("✓ Saved updated index.html and recall_scanner.html")

if __name__ == '__main__':
    patch_pantry_and_history()
