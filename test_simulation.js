// Headless simulation test for Rakka Recall Detection, Receipt Grouping, and Search
const fs = require('fs');

// Create mock browser DOM environment
global.window = global;
global.location = { search: '?vip=family&exp=2026-11-15', href: 'https://ericwoodliff54.github.io/rakka/?vip=family' };
global.window.location = global.location;
global.addEventListener = () => {};
global.window.addEventListener = () => {};
global.matchMedia = () => ({ matches: false, addEventListener: () => {} });
global.window.matchMedia = global.matchMedia;
global.document = {
  documentElement: { classList: { add: () => {}, remove: () => {} } },
  addEventListener: () => {},
  querySelector: () => null,
  getElementById: (id) => {
    return {
      id,
      options: [{ text: 'All States (Nationwide)', value: 'ALL' }],
      selectedIndex: 0,
      value: '',
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {},
        contains: () => false
      },
      addEventListener: () => {},
      querySelectorAll: () => [],
      innerHTML: '',
      textContent: '',
      setAttribute: () => {},
      getAttribute: () => null
    };
  },
  querySelectorAll: () => []
};
global.localStorage = {
  _store: { 'rakka_pro_unlocked': 'true' },
  getItem: (k) => global.localStorage._store[k] || null,
  setItem: (k, v) => { global.localStorage._store[k] = String(v); },
  removeItem: (k) => { delete global.localStorage._store[k]; }
};
global.navigator = { onLine: true };
global.triggerHaptic = () => {};
global.setTimeout = (fn, ms) => {};
global.showCustomizeToast = (msg) => console.log('TOAST:', msg);
global.sound = { playClearChime: () => {} };
global.isPlusActive = true;
global.MAX_WATCHLIST_ITEMS = 500;
global.familyProfiles = [
  { id: 'dad', name: 'Dad', allergens: ['peanut', 'tree_nut'] },
  { id: 'kid', name: 'Kid', allergens: ['dairy'] }
];
global.getActiveProfile = () => global.familyProfiles[0];
// global.formatWatchedTimestamp removed
global.SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

// Load extracted script and expose getters
let scriptContent = fs.readFileSync('extracted_script.js', 'utf-8');
scriptContent += '\nglobal.getScanHistory = () => scanHistory;\nglobal.setScanHistory = (h) => { scanHistory = h; };';
eval(scriptContent);

console.log('--- TEST 1: RECALL_DATABASE & NATIONAL_BULLETINS VERIFICATION ---');
const spinachRec = findRecallRecord('00994824552');
console.log('Spinach recall record found:', spinachRec ? spinachRec.product : 'NONE', '| isRecalled:', spinachRec?.isRecalled);
if (!spinachRec || !spinachRec.isRecalled) throw new Error('Spinach recall not found in RECALL_DATABASE');

const greensRec = findRecallRecord('03260190035');
console.log('Greens recall record found:', greensRec ? greensRec.product : 'NONE', '| isRecalled:', greensRec?.isRecalled);
if (!greensRec || !greensRec.isRecalled) throw new Error('Greens recall not found in RECALL_DATABASE');

const spiralsRec = findRecallRecord('022079200222');
console.log('Spirals recall record found:', spiralsRec ? spiralsRec.product : 'NONE', '| isRecalled:', spiralsRec?.isRecalled);
if (!spiralsRec || !spiralsRec.isRecalled) throw new Error('Spirals recall not found in RECALL_DATABASE');

console.log('\n--- TEST 2: SIMULATING WHOLE FOODS RECEIPT AUTO-IMPORT ---');
const wfReceipt = {
  id: 'rcpt_wf_10412',
  storeName: 'Whole Foods Market',
  purchaseDate: 'Nov 6, 2026 • 6:14 AM',
  totalFoodItems: 5,
  items: [
    {
      rawLine: '1 365 ORG ALMOND MILK 00994824316',
      cleanName: '365 Organic Almond Milk',
      brand: '365 by Whole Foods Market',
      itemCode: '00994824316',
      upc: '00994824316',
      status: 'clear',
      allergens: ['tree_nuts']
    },
    {
      rawLine: '1 365 BABY SPINACH 5Z 00994824552',
      cleanName: '365 Organic Baby Spinach (5 oz)',
      brand: '365 by Whole Foods Market',
      itemCode: '00994824552',
      upc: '00994824552',
      status: 'clear', // Worker might send clear, Rakka intelligence MUST catch recall!
      allergens: []
    },
    {
      rawLine: '1 BRADS KALE ORIG 2OZ 08131040216',
      cleanName: 'Brad\'s Plant Based Organic Raw Crunchy Kale Original (2 oz)',
      brand: 'Brad\'s Plant Based',
      itemCode: '08131040216',
      upc: '08131040216',
      status: 'clear',
      allergens: []
    },
    {
      rawLine: '1 KITE HILL CHIVE DIP 08566240040',
      cleanName: 'Kite Hill Dairy-Free Almond Milk Chive Dip',
      brand: 'Kite Hill',
      itemCode: '08566240040',
      upc: '08566240040',
      status: 'clear',
      allergens: ['tree_nuts']
    },
    {
      rawLine: '1 ORGANIC AVOCADOS 4P 00994824701',
      cleanName: 'Organic Avocados 4 Pack',
      brand: '365 by Whole Foods Market',
      itemCode: '00994824701',
      upc: '00994824701',
      status: 'clear',
      allergens: []
    }
  ]
};

autoImportReceiptDirectlyToWatchlist(wfReceipt);
const historyWF = global.getScanHistory();
console.log('Imported Whole Foods. Total items in scanHistory:', historyWF.length);

const spinachItem = historyWF.find(i => i.upc === '00994824552');
console.log('Spinach item status:', spinachItem.status, '| isRecalled:', spinachItem.isRecalled, '| Hazard:', spinachItem.activeRecallHazard?.slice(0, 50) + '...');
if (!spinachItem.isRecalled || spinachItem.status !== 'recalled') {
  throw new Error('Spinach was NOT flagged as recalled!');
}

console.log('\n--- TEST 3: SIMULATING MEIJER RECEIPT AUTO-IMPORT WITH DUPLICATES ---');
const meijerReceipt = {
  id: 'rcpt_meijer_552',
  storeName: 'Meijer',
  purchaseDate: 'Nov 6, 2026 • 5:52 AM',
  totalFoodItems: 4,
  items: [
    {
      rawLine: 'SWEET POTATO SPIRALS 022079200222',
      cleanName: 'Sweet Potato Spirals',
      brand: 'Meijer',
      itemCode: '022079200222',
      upc: '022079200222',
      status: 'clear',
      allergens: []
    },
    {
      rawLine: 'BABY LETTUCE SALAD GREENS 03260190035',
      cleanName: 'Baby Lettuce Salad Greens',
      brand: 'Meijer',
      itemCode: '03260190035',
      upc: '03260190035',
      status: 'clear',
      allergens: []
    },
    {
      rawLine: 'BABY LETTUCE SALAD GREENS 03260190035',
      cleanName: 'Baby Lettuce Salad Greens',
      brand: 'Meijer',
      itemCode: '03260190035',
      upc: '03260190035',
      status: 'clear',
      allergens: []
    },
    {
      rawLine: 'SINGLE SERVE COFFEE PODS 070882003196',
      cleanName: 'Single Serve Coffee Pods',
      brand: 'Meijer',
      itemCode: '070882003196',
      upc: '070882003196',
      status: 'clear',
      allergens: []
    }
  ]
};

autoImportReceiptDirectlyToWatchlist(meijerReceipt);
const historyMeijer = global.getScanHistory();
console.log('Imported Meijer. Total items in scanHistory:', historyMeijer.length);

const greensItem = historyMeijer.find(i => i.upc === '03260190035');
console.log('Meijer Greens status:', greensItem.status, '| isRecalled:', greensItem.isRecalled);
if (!greensItem.isRecalled || greensItem.status !== 'recalled') {
  throw new Error('Meijer Greens was NOT flagged as recalled!');
}

const spiralsItem = historyMeijer.find(i => i.upc === '022079200222');
console.log('Meijer Spirals status:', spiralsItem.status, '| isRecalled:', spiralsItem.isRecalled);
if (!spiralsItem.isRecalled || spiralsItem.status !== 'recalled') {
  throw new Error('Meijer Spirals was NOT flagged as recalled!');
}

console.log('\n--- TEST 4: AUDIT PANTRY AGAINST RECALLS (ENSURE IMMUNITY) ---');
auditPantryAgainstRecalls();

// Verify that spinach, greens, and spirals are STILL recalled after auditPantryAgainstRecalls
const historyAudit = global.getScanHistory();
const spinachAfter = historyAudit.find(i => i.upc === '00994824552');
const greensAfter = historyAudit.find(i => i.upc === '03260190035');
const spiralsAfter = historyAudit.find(i => i.upc === '022079200222');

if (!spinachAfter.recalledNow || spinachAfter.status !== 'recalled') throw new Error('Spinach was wiped out by audit!');
if (!greensAfter.recalledNow || greensAfter.status !== 'recalled') throw new Error('Greens was wiped out by audit!');
if (!spiralsAfter.recalledNow || spiralsAfter.status !== 'recalled') throw new Error('Spirals was wiped out by audit!');
console.log('✓ All 3 recalled items maintained 100% recall status and immunity through auditPantryAgainstRecalls!');

console.log('\n--- TEST 5: RENDERING WATCHLIST ORGANIZED BY RECEIPT ---');
let renderedHtml = '';
global.document.getElementById = (id) => {
  return {
    id,
    options: [{ text: 'All States (Nationwide)', value: 'ALL' }],
    selectedIndex: 0,
    classList: { add: () => {}, remove: () => {} },
    set innerHTML(val) { renderedHtml = val; },
    get innerHTML() { return renderedHtml; }
  };
};

renderHistory();
console.log('Rendered HTML length:', renderedHtml.length);
if (!renderedHtml.includes('Whole Foods Market')) throw new Error('Whole Foods Market receipt group not found');
if (!renderedHtml.includes('Meijer')) throw new Error('Meijer receipt group not found');
if (!renderedHtml.includes('>Recall</span>') && !renderedHtml.includes('Recall')) throw new Error('Recall badge not found on receipt');
if (!renderedHtml.includes('Qty: 2')) throw new Error('Duplicate item Qty: 2 not found');

console.log('✓ Receipts correctly grouped, duplicate items summarized with Qty: 2, and Recall badges visible!');

console.log('\n--- TEST 6: SEARCH & FILTER IN WATCHLIST ---');
// Search for Whole Foods
window.setWatchlistSearch('Whole Foods');
if (!renderedHtml.includes('Whole Foods Market') || renderedHtml.includes('Meijer')) {
  throw new Error('Search by store "Whole Foods" failed');
}
console.log('✓ Search by grocery store ("Whole Foods") matched only Whole Foods receipt');

// Search for Kale
window.setWatchlistSearch('Kale');
if (!renderedHtml.includes('Crunchy Kale') || renderedHtml.includes('Coffee Pods')) {
  throw new Error('Search by food item "Kale" failed');
}
console.log('✓ Search by food item ("Kale") matched Brad\'s Kale');

// Search by Barcode
window.setWatchlistSearch('08131040216');
if (!renderedHtml.includes('08131040216') || renderedHtml.includes('Coffee Pods')) {
  throw new Error('Search by barcode "08131040216" failed');
}
console.log('✓ Search by barcode ("08131040216") matched Brad\'s Kale');

// Filter by Recalls only
window.setWatchlistSearch('');
window.setWatchlistFilter('recalls');
if (!renderedHtml.includes('365 Organic Baby Spinach') || renderedHtml.includes('Coffee Pods')) {
  throw new Error('Filter by "recalls" failed');
}
console.log('✓ Filter by "recalls" showed only recalled items');

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED!');



console.log('--- TEST 7: VERIFY SIMPLE RED RECALL PILL, TOP SORTING, DISTINCT RECEIPT & ALDI 746502 ---');
window.setWatchlistFilter('all');
window.setWatchlistSearch('');
renderHistory();

const spinachIndex = renderedHtml.indexOf('365 Organic Baby Spinach (5 oz)');
const avocadosIndex = renderedHtml.indexOf('Organic Avocados 4 Pack');
console.log('Spinach index in Whole Foods:', spinachIndex, '| Avocados index:', avocadosIndex);
if (spinachIndex === -1 || avocadosIndex === -1 || spinachIndex > avocadosIndex) {
  throw new Error('Spinach was NOT sorted to the top of Whole Foods receipt!');
}
console.log('✓ Recalled item (Spinach) is sorted to the VERY TOP of the receipt items!');

// Verify simple red Recall pill
if (!renderedHtml.includes('>Recall</span>') || !renderedHtml.includes('bg-rose-500/20 text-rose-300 border border-rose-500/40')) {
  throw new Error('Recalled product card missing simple red Recall pill');
}
console.log('✓ Recalled product card has simple, clean red Recall pill!');

// Verify receipt header has 1 Recall pill and RECEIPT tag
if (!renderedHtml.includes('1 Recall') || !renderedHtml.includes('RECEIPT')) {
  throw new Error('Receipt header missing 1 Recall or RECEIPT tag');
}
console.log('✓ Receipt header has distinct RECEIPT tag and clean 1 Recall pill!');

// Verify zero flashing or bouncing animations
if (renderedHtml.includes('animate-bounce') || renderedHtml.includes('animate-pulse')) {
  throw new Error('Rendered HTML unexpectedly contains animate-bounce or animate-pulse!');
}
console.log('✓ Zero animate-bounce and zero animate-pulse in rendered HTML!');

// Test Aldi 746502 immunity
console.log('--- TEST 8: ALDI 746502 RECALL IMMUNITY ---');
const curHist = global.getScanHistory();
curHist.push({
  id: 'item_aldi_alfredo',
  productName: 'Park Street Deli Chicken Alfredo & Meatball Marinara',
  product: 'Park Street Deli Chicken Alfredo & Meatball Marinara',
  brand: "Mama Cozzi's / Park Street Deli",
  receiptStore: 'ALDI',
  upc: '746502',
  status: 'recalled',
  isRecalled: true,
  recalledNow: true,
  activeRecallHazard: 'False USDA alert'
});
global.setScanHistory(curHist);

auditPantryAgainstRecalls();

const aldiCheck = global.getScanHistory().find(i => i.id === 'item_aldi_alfredo');
console.log('Aldi 746502 status after audit:', aldiCheck.status, '| isRecalled:', aldiCheck.isRecalled);
if (aldiCheck.isRecalled || aldiCheck.status === 'recalled') {
  throw new Error('Aldi 746502 was falsely flagged as recalled!');
}
console.log('✓ Aldi 746502 is 100% immune and cleared of false recall!');

console.log('🎉 ALL RAKKA TESTS PASSED WITH 100% SUCCESS!');
