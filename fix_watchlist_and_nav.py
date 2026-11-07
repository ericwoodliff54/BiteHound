import re

def fix_watchlist_and_nav():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    print("Original length:", len(content))

    # 1. Overhaul setNavTab to ensure strict mutual exclusion and robust panel toggling
    old_set_nav_marker = 'function setNavTab(activeTab) {'
    s_nav = content.find(old_set_nav_marker)
    e_nav = content.find('// Attach Tab Event Listeners', s_nav)
    assert s_nav != -1 and e_nav != -1, "setNavTab markers not found"

    new_set_nav_tab = '''function setNavTab(activeTab) {
      triggerHaptic([30]);

      const isBarcodes = (activeTab === 'barcodes' || activeTab === 'scanner');
      const isReceipts = (activeTab === 'receipts' || activeTab === 'manual');
      const isWatchlist = (activeTab === 'watchlist' || activeTab === 'history');
      const isAllergens = (activeTab === 'allergens');
      const isBulletins = (activeTab === 'bulletins');
      const isCustomize = (activeTab === 'customize' || activeTab === 'settings');

      // Auto-stop camera when leaving Barcodes tab to save battery and prevent background streaming
      if (!isBarcodes && typeof isCameraRunning !== 'undefined' && isCameraRunning) {
        if (typeof stopCamera === 'function') {
          stopCamera();
        }
      }

      const activeClass = "nav-tab active-tab py-2.5 px-1 min-h-[62px] rounded-2xl text-[11px] sm:text-xs font-bold flex flex-col items-center justify-center gap-1 transition bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-amber-400/40 active:scale-95 relative after:content-[''] after:w-1.5 after:h-1.5 after:rounded-full after:bg-amber-300 after:absolute after:bottom-1";
      const inactiveClass = "nav-tab py-2.5 px-1 min-h-[62px] rounded-2xl text-[11px] sm:text-xs font-bold text-slate-400 hover:text-white flex flex-col items-center justify-center gap-1 transition active:scale-95 relative";

      const tabScanner = document.getElementById('tabScanner');
      const tabReceipts = document.getElementById('tabReceipts') || document.getElementById('tabManual');
      const tabManual = document.getElementById('tabManual');
      const tabAllergens = document.getElementById('tabAllergens');
      const tabWatchlist = document.getElementById('tabWatchlist');
      const tabBulletins = document.getElementById('tabBulletins');
      const headerSettingsBtn = document.getElementById('headerSettingsBtn');

      if (tabScanner) tabScanner.className = isBarcodes ? activeClass : inactiveClass;
      if (tabReceipts) tabReceipts.className = isReceipts ? activeClass : inactiveClass;
      if (tabManual && tabManual !== tabReceipts) tabManual.className = isReceipts ? activeClass : inactiveClass;
      if (tabAllergens) tabAllergens.className = isAllergens ? activeClass : inactiveClass;
      if (tabWatchlist) tabWatchlist.className = isWatchlist ? activeClass : inactiveClass;
      if (tabBulletins) tabBulletins.className = isBulletins ? activeClass : inactiveClass;

      // Highlight header settings gear when settings is active
      if (headerSettingsBtn) {
        if (isCustomize) {
          headerSettingsBtn.className = "w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center justify-center transition shadow-sm active:scale-95 cursor-pointer";
        } else {
          headerSettingsBtn.className = "w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition active:scale-95 shadow-sm cursor-pointer";
        }
      }

      // Panel Elements
      const allergensPanel = document.getElementById('allergensPanel');
      const historyPanel = document.getElementById('historyPanel');
      const bulletinsPanel = document.getElementById('bulletinsPanel');
      const customizePanel = document.getElementById('customizePanel');
      const scannerPanelEl = document.getElementById('scannerPanel');
      const receiptsPanelEl = document.getElementById('receiptsPanel');
      const manualPanelEl = document.getElementById('manualPanel');

      // STRICT MUTUAL EXCLUSION: Toggle all main tab panels BEFORE running any render routines
      if (allergensPanel) allergensPanel.classList.toggle('hidden', !isAllergens);
      if (bulletinsPanel) bulletinsPanel.classList.toggle('hidden', !isBulletins);
      if (customizePanel) customizePanel.classList.toggle('hidden', !isCustomize);
      if (scannerPanelEl) scannerPanelEl.classList.toggle('hidden', !isBarcodes);
      if (receiptsPanelEl) receiptsPanelEl.classList.toggle('hidden', !isReceipts);
      if (manualPanelEl && manualPanelEl !== receiptsPanelEl) manualPanelEl.classList.add('hidden');

      if (scannerResultContainer) {
        if (isBarcodes && scannerResultContainer.innerHTML.trim() !== '') {
          scannerResultContainer.classList.remove('hidden');
        } else {
          scannerResultContainer.classList.add('hidden');
        }
      }
      if (manualResultContainer) manualResultContainer.classList.add('hidden');

      // Watchlist Panel
      if (historyPanel) {
        historyPanel.classList.toggle('hidden', !isWatchlist);
        if (isWatchlist && typeof renderHistory === 'function') {
          try {
            renderHistory();
          } catch (renderErr) {
            console.error("renderHistory execution error:", renderErr);
          }
        }
      }
    }
'''

    content = content[:s_nav] + new_set_nav_tab + '\n    ' + content[e_nav:]
    print("✓ Replaced setNavTab with strictly exclusive panel toggles")

    # 2. Add formatWatchedTimestamp and toggleWatchlistItemDetails definitions right before renderHistory
    render_hist_marker = 'function renderHistory() {'
    rh_pos = content.find(render_hist_marker)
    assert rh_pos != -1, "renderHistory not found"

    helper_functions = '''    // Safe Timestamp Formatter for Watched Items
    function formatWatchedTimestamp(item) {
      if (!item) return 'Recent';
      if (item.date) return item.date;
      if (item.time) return item.time;
      if (item.timestamp) {
        try {
          return new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date(item.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        } catch (_) {}
      }
      return 'Recent';
    }
    window.formatWatchedTimestamp = formatWatchedTimestamp;

    // Toggle Expand/Collapse for individual item accordion drawer
    function toggleWatchlistItemDetails(cardKey) {
      triggerHaptic([20]);
      const drawer = document.getElementById(`watchlist-drawer-${cardKey}`);
      const chevron = document.getElementById(`watchlist-chevron-${cardKey}`);
      if (drawer) {
        const isHidden = drawer.classList.contains('hidden');
        drawer.classList.toggle('hidden', !isHidden);
        if (chevron) {
          chevron.textContent = isHidden ? '▲' : '▼';
        }
      }
    }
    window.toggleWatchlistItemDetails = toggleWatchlistItemDetails;

'''

    content = content[:rh_pos] + helper_functions + content[rh_pos:]
    print("✓ Injected formatWatchedTimestamp and toggleWatchlistItemDetails")

    # 3. Bump cache version to rakka-v59
    content = content.replace('rakka-v58', 'rakka-v59')

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

    with open('recall_scanner.html', 'w', encoding='utf-8') as f:
        f.write(content)

    # Also update sw.js
    with open('sw.js', 'r', encoding='utf-8') as f:
        sw = f.read()
    sw = sw.replace('rakka-v58', 'rakka-v59')
    with open('sw.js', 'w', encoding='utf-8') as f:
        f.write(sw)

    print("✓ Updated sw.js and html cache versions to rakka-v59")

if __name__ == '__main__':
    fix_watchlist_and_nav()
