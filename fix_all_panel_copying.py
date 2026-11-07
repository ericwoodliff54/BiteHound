import re

def fix_all_panel_copying():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    print("Original index.html length:", len(content))

    # 1. Add .hidden, [hidden] { display: none !important; } in <style>
    style_marker = '<style>'
    hidden_css = '''
    .hidden, [hidden] {
      display: none !important;
    }
'''
    if '.hidden, [hidden]' not in content:
        content = content.replace(style_marker, style_marker + hidden_css)
        print("✓ Injected .hidden, [hidden] { display: none !important; } into CSS")

    # 2. Fix the unclosed div at line 2802 (Offline Cache & FDA Wire Sync)
    # The div opens at: <!-- OFFLINE CACHE & APP UPDATES -->\n      <div class="pt-3 border-t border-slate-800 space-y-2">
    # And should close right before: <!-- Legal & Safety Disclaimers -->
    unclosed_target = '''            <span id="settingsSyncBtnText">Check for FDA Updates Now</span>
          </button>
        </div>



      <!-- Legal & Safety Disclaimers -->'''

    fixed_target = '''            <span id="settingsSyncBtnText">Check for FDA Updates Now</span>
          </button>
        </div>
      </div>

      <!-- Legal & Safety Disclaimers -->'''

    if unclosed_target in content:
        content = content.replace(unclosed_target, fixed_target)
        print("✓ Closed unclosed <div> for Offline Cache & FDA Wire Sync")
    else:
        # Regex replacement if whitespace differs
        pattern = re.compile(r'(<span id="settingsSyncBtnText">Check for FDA Updates Now</span>\s*</button>\s*</div>)(\s*<!-- Legal & Safety Disclaimers -->)')
        if pattern.search(content):
            content = pattern.sub(r'\1\n      </div>\n\n      \2', content)
            print("✓ Regex closed unclosed <div> for Offline Cache & FDA Wire Sync")
        else:
            print("Warning: unclosed div target pattern not found directly!")

    # 3. Overhaul setNavTab with rock-solid panel visibility enforcement:
    # Uses .style.display = 'none' / '', .classList.add/remove('hidden'), and set/removeAttribute('hidden')
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
      const scannerPanelEl = document.getElementById('scannerPanel');
      const receiptsPanelEl = document.getElementById('receiptsPanel');
      const manualPanelEl = document.getElementById('manualPanel');
      const allergensPanel = document.getElementById('allergensPanel');
      const historyPanel = document.getElementById('historyPanel');
      const bulletinsPanel = document.getElementById('bulletinsPanel');
      const customizePanel = document.getElementById('customizePanel');

      const panelList = [
        { el: scannerPanelEl, active: isBarcodes },
        { el: receiptsPanelEl, active: isReceipts },
        { el: manualPanelEl, active: false },
        { el: allergensPanel, active: isAllergens },
        { el: historyPanel, active: isWatchlist },
        { el: bulletinsPanel, active: isBulletins },
        { el: customizePanel, active: isCustomize }
      ];

      // Triple-Lock Mutual Exclusion: CSS class + inline style + HTML5 hidden attribute
      panelList.forEach(p => {
        if (p.el) {
          if (p.active) {
            p.el.classList.remove('hidden');
            p.el.style.display = '';
            p.el.removeAttribute('hidden');
          } else {
            p.el.classList.add('hidden');
            p.el.style.display = 'none';
            p.el.setAttribute('hidden', '');
          }
        }
      });

      if (scannerResultContainer) {
        if (isBarcodes && scannerResultContainer.innerHTML.trim() !== '') {
          scannerResultContainer.classList.remove('hidden');
          scannerResultContainer.style.display = '';
        } else {
          scannerResultContainer.classList.add('hidden');
          scannerResultContainer.style.display = 'none';
        }
      }
      if (manualResultContainer) {
        manualResultContainer.classList.add('hidden');
        manualResultContainer.style.display = 'none';
      }

      // Execute render routines strictly for the active tab
      if (isWatchlist && typeof renderHistory === 'function') {
        try {
          renderHistory();
        } catch (e) {
          console.error("renderHistory error:", e);
        }
      } else if (isAllergens && typeof renderAllergensTab === 'function') {
        try {
          renderAllergensTab();
        } catch (e) {
          console.error("renderAllergensTab error:", e);
        }
      } else if (isBulletins && typeof renderBulletins === 'function') {
        try {
          renderBulletins();
        } catch (e) {
          console.error("renderBulletins error:", e);
        }
      } else if (isCustomize && typeof renderCustomizeTab === 'function') {
        try {
          renderCustomizeTab();
        } catch (e) {
          console.error("renderCustomizeTab error:", e);
        }
      }
    }'''

    s_nav = content.find('function setNavTab(activeTab) {')
    e_nav = content.find('// Attach Tab Event Listeners', s_nav)
    assert s_nav != -1 and e_nav != -1, "setNavTab markers not found"

    content = content[:s_nav] + new_set_nav_tab + '\n\n    ' + content[e_nav:]
    print("✓ Updated setNavTab with Triple-Lock Mutual Exclusion")

    # 4. Bump Cache to rakka-v60
    content = content.replace('rakka-v59', 'rakka-v60')

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

    with open('recall_scanner.html', 'w', encoding='utf-8') as f:
        f.write(content)

    with open('sw.js', 'r', encoding='utf-8') as f:
        sw = f.read()
    sw = sw.replace('rakka-v59', 'rakka-v60')
    with open('sw.js', 'w', encoding='utf-8') as f:
        f.write(sw)

    print("✓ Updated sw.js and html cache versions to rakka-v60")

if __name__ == '__main__':
    fix_all_panel_copying()
