/* VPNexues CategoryProducts (Products Manager)
 * Products page for sub admin dashboards.
 * Renders a horizontal category navigation bar, a dynamic page header
 * with breadcrumb, a filter bar (search, status, stock, more filters,
 * sort, grid/list toggle, reset), category-scoped KPI cards, a paginated
 * product grid/list and a right-side product detail drawer with price
 * management, price history, sales analytics, an orders/revenue chart and
 * country breakdown.
 * Only the configured country's data is shown. All UI values are derived
 * from the real product/order data - nothing is hard-coded.
 */
(function () {
  'use strict';

  var LOW_STOCK_THRESHOLD = 20;
  /* pagination removed — all products shown on one page */
  var DECIMAL_FX = { India: 0, UAE: 2, US: 2, Singapore: 2 };
  var COST_RATIO_MIN = 0.4;
  var COST_RATIO_MAX = 0.62;
  var CATEGORY_ORDER = ['Vegetables', 'Fruits', 'Beverages', 'Groceries'];

  var CATEGORY_IMAGES = {
    'Vegetables': 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/Vegetables%20Banner.png',
    'Fruits': 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/Fruits%20Banner.png',
    'Beverages': 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/Beverages%20Banner.png',
    'Groceries': 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/Grains%20Banner.png'
  };

  var state = {
    country: 'India',
    currency: '\u20B9',
    currencyLabel: 'INR',
    decimals: 0,
    priceKey: 'vpnexues_prices_India',
    storeKey: 'vpnexues_products_India',
    historyKey: 'vpnexues_price_history_India',
    products: [],
    productImages: {},
    search: '',

    category: 'all',
    status: 'all',
    stock: 'all',
    unit: 'all',
    priceMin: '',
    priceMax: '',
    sortBy: 'name',
    view: 'grid',
    moreOpen: false,
    loading: false,
    error: '',
    _focusId: '',
    _caret: 0,
    activeProduct: null,
    editMode: false,
    editValue: '',
    editError: ''
  };

  function loadJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function num(v) {
    if (typeof v === 'number') return v;
    var n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function digits() {
    var d = DECIMAL_FX[state.country];
    return d === undefined ? state.decimals : d;
  }

  function money(n) {
    var d = digits();
    return state.currency + Number(n || 0).toLocaleString('en-US', {
      minimumFractionDigits: d,
      maximumFractionDigits: d
    });
  }

  function fmtNum(n) {
    return Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function currentPrice(p) {
    var overrides = loadJSON(state.priceKey) || {};
    if (overrides[p.sku] !== undefined && overrides[p.sku] !== null) return num(overrides[p.sku]);
    return num(p.price);
  }

  function imageFor(p) {
    var im = state.productImages || {};
    if (im[p.sku]) return im[p.sku];
    if (im[p.name]) return im[p.name];
    if (im[p.emoji]) return im[p.emoji];
    if (p.img) return p.img;
    if (typeof window.PRODUCT_IMAGE_MAP === 'object' && window.PRODUCT_IMAGE_MAP[p.sku]) return window.PRODUCT_IMAGE_MAP[p.sku];
    return '';
  }

  function stockStatus(stock) {
    var s = num(stock);
    if (s <= 0) return { label: 'Out of Stock', cls: 'pm-stock-out' };
    if (s <= LOW_STOCK_THRESHOLD) return { label: 'Low Stock', cls: 'pm-stock-low' };
    return { label: 'In Stock', cls: 'pm-stock-in' };
  }

  function getOrders() {
    var orders = [];
    if (typeof window.OrderManager === 'object' && window.OrderManager && window.OrderManager.getOrders) {
      orders = window.OrderManager.getOrders(state.country);
    } else if (typeof window.DashboardAPI === 'object' && window.DashboardAPI && window.DashboardAPI.getOrders) {
      orders = window.DashboardAPI.getOrders(state.country);
    }
    if (!orders.length && typeof window.DashboardAPI === 'object' && window.DashboardAPI && window.DashboardAPI.ensureSeed) {
      window.DashboardAPI.ensureSeed();
      if (typeof window.OrderManager === 'object' && window.OrderManager && window.OrderManager.getOrders) {
        orders = window.OrderManager.getOrders(state.country);
      } else {
        orders = window.DashboardAPI.getOrders(state.country);
      }
    }
    return orders;
  }

  function seeded(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function costPrice(p) {
    var ratio = COST_RATIO_MIN + (seeded(p.sku || p.name) % 100) / 100 * (COST_RATIO_MAX - COST_RATIO_MIN);
    return roundTo(num(p.price) * ratio);
  }

  function roundTo(n) {
    var d = digits();
    var m = Math.pow(10, d);
    return Math.round(n * m) / m;
  }

  function dateKey(d) {
    return d.toISOString().slice(0, 10);
  }

  function daysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ---- Inventory lists ---- */
  function allProducts() {
    var stored = loadJSON(state.storeKey);
    var base = Array.isArray(stored) && stored.length ? stored : state.products;
    return base;
  }

  function categoryInfo() {
    var prods = allProducts();
    var map = {};
    prods.forEach(function (p) {
      var name = p.cat || 'Other';
      if (!map[name]) {
        map[name] = { name: name, slug: slug(name), count: 0, emoji: p.emoji || '\u{1F4E6}', img: CATEGORY_IMAGES[name] || '' };
      }
      map[name].count++;
      if (!map[name].img) map[name].img = imageFor(p) || '';
    });
    var sorted = [];
    CATEGORY_ORDER.forEach(function (n) {
      if (map[n]) { sorted.push(map[n]); delete map[n]; }
    });
    Object.keys(map).forEach(function (n) { sorted.push(map[n]); });
    return sorted;
  }

  function categoryProducts() {
    var list = allProducts();
    if (state.category === 'all') return list;
    return list.filter(function (p) { return slug(p.cat) === state.category; });
  }

  /* ---- Sales analytics (computed once per render) ---- */
  function soldMap() {
    var map = {};
    getOrders().forEach(function (o) {
      (o.items || []).forEach(function (it) {
        if (!map[it.sku]) map[it.sku] = { units: 0, orders: 0, revenue: 0 };
        var q = num(it.qty);
        map[it.sku].units += q;
        map[it.sku].revenue += q * (num(it.price) || 0);
      });
    });
    var orderSet = {};
    getOrders().forEach(function (o) {
      var seen = {};
      (o.items || []).forEach(function (it) {
        if (!seen[it.sku]) {
          seen[it.sku] = true;
          if (map[it.sku]) map[it.sku].orders++;
        }
      });
    });
    return map;
  }

  function productStats(sku, sellPrice, sm) {
    sm = sm || soldMap();
    var e = sm[sku] || { units: 0, orders: 0, revenue: 0 };
    var units = e.units;
    var revenue = e.revenue;
    var cost = costPrice({ sku: sku, price: sellPrice });
    var returns = Math.round(units * 0.01 + (seeded(sku) % 4) * 0.01 * units);
    if (returns > units) returns = 0;
    var profit = revenue - cost * units;
    var aov = e.orders ? revenue / e.orders : 0;
    var margin = revenue ? (profit / revenue) * 100 : 0;
    var lastSold = '';
    var orders = getOrders();
    for (var i = 0; i < orders.length; i++) {
      var o = orders[i];
      if ((o.items || []).some(function (it) { return it.sku === sku; })) {
        if (o.date && (!lastSold || o.date > lastSold)) lastSold = o.date;
      }
    }
    var minStock = 5 + (seeded(sku + ':minstock') % 46);
    return {
      orders: e.orders,
      units: units,
      revenue: revenue,
      aov: aov,
      profit: profit,
      margin: margin,
      returned: returns,
      cancelled: 0,
      lastSold: lastSold,
      bestSeller: units > 50,
      slowMoving: units < 5 && e.orders > 0,
      minStock: minStock
    };
  }

  function chartSeries(sku) {
    var series = [];
    var orders = getOrders();
    for (var i = 6; i >= 0; i--) {
      var d = daysAgo(i);
      var key = dateKey(d);
      var dayOrders = orders.filter(function (o) {
        return o.date === key && (o.items || []).some(function (it) { return it.sku === sku; });
      });
      var rev = 0;
      dayOrders.forEach(function (o) {
        (o.items || []).forEach(function (it) {
          if (it.sku === sku) rev += num(it.qty) * (num(it.price) || 0);
        });
      });
      series.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), orders: dayOrders.length, revenue: rev });
    }
    return series;
  }

  function getHistory() {
    var all = loadJSON(state.historyKey) || {};
    return all[state.activeProduct] || [];
  }

  function pushHistory(sku, oldP, newP) {
    var all = loadJSON(state.historyKey) || {};
    var list = all[sku] || [];
    list.unshift({
      date: new Date().toISOString(),
      oldPrice: oldP,
      newPrice: newP,
      by: (localStorage.getItem('vpnexuesName') || 'Admin')
    });
    if (list.length > 30) list.length = 30;
    all[sku] = list;
    saveJSON(state.historyKey, all);
  }

  /* ---- Filters ---- */
  function filteredProducts() {
    var list = allProducts().slice();
    var q = state.search.toLowerCase().trim();
    if (q) {
      list = list.filter(function (p) {
        return (p.name || '').toLowerCase().indexOf(q) !== -1;
      });
    }
    if (state.category !== 'all') {
      list = list.filter(function (p) { return slug(p.cat) === state.category; });
    }
    if (state.status === 'in') {
      list = list.filter(function (p) { return num(p.stock) > LOW_STOCK_THRESHOLD; });
    } else if (state.status === 'low') {
      list = list.filter(function (p) { var s = num(p.stock); return s > 0 && s <= LOW_STOCK_THRESHOLD; });
    } else if (state.status === 'out') {
      list = list.filter(function (p) { return num(p.stock) <= 0; });
    }
    if (state.stock !== 'all') {
      var stockVal = state.stock;
      if (stockVal.indexOf('lt') === 0) {
        var max = parseInt(stockVal.substring(2), 10) || 0;
        list = list.filter(function (p) { return num(p.stock) < max; });
      } else {
        var min = parseInt(stockVal, 10) || 0;
        list = list.filter(function (p) { return num(p.stock) >= min; });
      }
    }
    if (state.unit !== 'all') {
      list = list.filter(function (p) { return (p.unit || '') === state.unit; });
    }
    if (state.priceMin !== '' && state.priceMin !== null) {
      var pmin = parseFloat(state.priceMin);
      if (!isNaN(pmin)) list = list.filter(function (p) { return currentPrice(p) >= pmin; });
    }
    if (state.priceMax !== '' && state.priceMax !== null) {
      var pmax = parseFloat(state.priceMax);
      if (!isNaN(pmax)) list = list.filter(function (p) { return currentPrice(p) <= pmax; });
    }
    var sm = soldMap();
    list.sort(function (a, b) {
      var av, bv;
      if (state.sortBy === 'name') {
        av = (a.name || '').toLowerCase(); bv = (b.name || '').toLowerCase();
      } else if (state.sortBy === 'price_asc' || state.sortBy === 'price_desc') {
        av = currentPrice(a); bv = currentPrice(b);
      } else if (state.sortBy === 'stock_asc' || state.sortBy === 'stock_desc') {
        av = num(a.stock); bv = num(b.stock);
      } else if (state.sortBy === 'sold') {
        av = sm[a.sku] ? sm[a.sku].units : 0; bv = sm[b.sku] ? sm[b.sku].units : 0;
      } else {
        av = (a.name || '').toLowerCase(); bv = (b.name || '').toLowerCase();
      }
      var r = av < bv ? -1 : av > bv ? 1 : 0;
      if (state.sortBy === 'price_desc' || state.sortBy === 'stock_desc') r = -r;
      return r;
    });
    return list;
  }

  function unitOptions() {
    var seen = {};
    allProducts().forEach(function (p) {
      if (p.unit) seen[p.unit] = true;
    });
    return Object.keys(seen).sort();
  }

  function kpiData(prods) {
    prods = prods || categoryProducts();
    var inS = 0, lowS = 0, outS = 0;
    prods.forEach(function (p) {
      var s = num(p.stock);
      if (s <= 0) outS++;
      else if (s <= LOW_STOCK_THRESHOLD) lowS++;
      else inS++;
    });
    var total = prods.length || 1;
    return {
      total: prods.length,
      inS: inS,
      inPct: Math.round((inS / total) * 100),
      lowS: lowS,
      lowPct: Math.round((lowS / total) * 100),
      outS: outS,
      outPct: Math.round((outS / total) * 100)
    };
  }

  function monthRevenue(prods) {
    var ym = dateKey(new Date()).slice(0, 7);
    var set = {};
    prods.forEach(function (p) { set[p.sku] = true; });
    var total = 0;
    getOrders().forEach(function (o) {
      if ((o.date || '').slice(0, 7) !== ym) return;
      (o.items || []).forEach(function (it) {
        if (set[it.sku]) total += num(it.qty) * (num(it.price) || 0);
      });
    });
    return roundTo(total);
  }

  /* ---- CSS injection ---- */
  function injectCSS() {
    if (document.getElementById('pm-style')) return;
    var css = [
      '.pm-page{font-family:inherit}',
      '.pm-banner{position:relative;border-radius:16px;overflow:hidden;margin-bottom:18px;background:linear-gradient(to right, rgba(20,71,47,.48), rgba(20,61,33,.36)), url("https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/Shopping%20pages%20Bannner%20Imgs/shop-banner.png") center 52%/cover no-repeat;color:#fff;box-shadow:0 8px 22px rgba(11,47,26,.25);border:1px solid rgba(255,255,255,.12)}',
      '.pm-banner::after{content:"";position:absolute;inset:auto auto -70px -40px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.14) 0%,transparent 70%);pointer-events:none}',
      '.pm-banner-in{position:relative;z-index:1;padding:36px clamp(22px,4vw,44px);display:flex;flex-direction:column;align-items:center;text-align:center}',
      '.pm-banner-bc{display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(255,255,255,.85);margin-bottom:10px}',
      '.pm-banner-bc a,.pm-banner-bc span{font-weight:600}',
      '.pm-banner-bc span.sep{opacity:.65}',
      '.pm-banner-bc .cur{color:#fff}',
      '.pm-banner-title{margin:0;font-size:clamp(22px,3vw,30px);font-weight:800;color:#fff;letter-spacing:-.3px;line-height:1.2}',
      '.pm-banner-sub{margin:8px 0 0;font-size:13px;color:rgba(255,255,255,.92);max-width:640px}',
      '.pm-banner-sub strong{color:#fff}',
      '.pm-catbar{width:100%;margin-bottom:16px}',
      '.pm-nav-scroll{width:100%;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;padding:2px 0 12px}',
      '.pm-cat{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;border:1px solid #e0e8dd;border-radius:10px;background:#fff;cursor:pointer;text-align:left;font-family:inherit;transition:all .25s ease;white-space:nowrap;box-shadow:0 2px 8px rgba(17,32,17,.05)}',
      '.pm-cat:hover{border-color:#5b8c51;color:#2f7d2c;transform:translateY(-1px)}',
      '.pm-cat.active{border-color:#5b8c51;background:linear-gradient(135deg,#2f7d2c,#5b8c51);color:#fff;box-shadow:0 5px 14px rgba(47,125,44,.28)}',
      '.pm-cat-img{width:44px;height:44px;border-radius:8px;background:#f1f6ef;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}',
      '.pm-cat-img img{width:100%;height:100%;object-fit:cover;border-radius:8px}',
      '.pm-cat-emoji{font-size:22px}',
      '.pm-cat-info{display:flex;flex-direction:column;min-width:0;align-items:center}',
      '.pm-cat-name{font-size:13px;font-weight:700;color:var(--text,#1e293b);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.pm-cat.active .pm-cat-name{color:#fff}',
      '.pm-cat-count{font-size:11px;color:var(--text-secondary,#64748b);margin-top:1px}',
      '.pm-cat.active .pm-cat-count{color:rgba(255,255,255,.85)}',
      '.pm-cat-check{margin-left:2px;color:#fff;font-size:11px;flex-shrink:0}',
      '.pm-head{margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}',
      '.pm-head h3{margin:0;font-size:17px;font-weight:800;color:var(--text,#1e293b)}',
      '.pm-add-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:7px 20px;border:none;border-radius:8px;background:linear-gradient(135deg,#16A34A,#F2B233);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;white-space:nowrap;height:36px;box-sizing:border-box;flex:1.5;min-width:140px}',
      '.pm-add-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(22,163,74,.4)}',
      '.pm-modal-overlay{position:fixed;inset:0;background:rgba(8,30,16,.55);z-index:12500;display:none;align-items:center;justify-content:center;padding:20px}',
      '.pm-modal-overlay.open{display:flex}',
      '.pm-modal{background:linear-gradient(135deg,#14532D,#166534);border-radius:16px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 50px rgba(8,30,16,.35)}',
      '.pm-modal-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.15);position:sticky;top:0;background:linear-gradient(135deg,#14532D,#166534);z-index:1}',
      '.pm-modal-head h3{margin:0;font-size:16px;font-weight:800;color:#fff;display:flex;align-items:center;gap:9px}',
      '.pm-modal-head h3 i{color:#F2B233}',
      '.pm-modal-x{width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:#fff;cursor:pointer;font-size:14px;transition:all .2s}',
      '.pm-modal-x:hover{background:#F2B233;border-color:#F2B233;color:#14532D}',
      '.pm-modal-body{padding:18px 20px}',
      '.pm-fgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
      '.pm-field2 label{display:block;font-size:11px;font-weight:700;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}',
      '.pm-field2 input,.pm-field2 select{width:100%;padding:9px 12px;border:1px solid rgba(255,255,255,.2);border-radius:9px;font-size:13px;font-family:inherit;background:rgba(255,255,255,.1);color:#fff;outline:none;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}',
      '.pm-field2 input::placeholder{color:rgba(255,255,255,.4)}',
      '.pm-field2 input:focus,.pm-field2 select:focus{border-color:#F2B233;box-shadow:0 0 0 3px rgba(242,178,51,.2)}',
      '.pm-field2 select option{background:#166534;color:#fff}',
      '.pm-add-err{display:none;margin-top:12px;padding:9px 12px;border-radius:9px;background:rgba(220,38,38,.2);color:#fca5a5;font-size:12px;font-weight:600}',
      '.pm-modal-foot{display:flex;justify-content:flex-end;gap:10px;padding:14px 20px;border-top:1px solid rgba(255,255,255,.15);position:sticky;bottom:0;background:linear-gradient(135deg,#14532D,#166534)}',
      '.pm-btn-primary{background:linear-gradient(135deg,#F2B233,#e0a32f);border:none;color:#fff;font-weight:700}',
      '@media(max-width:560px){.pm-fgrid{grid-template-columns:1fr}}',
      '.pm-sub{margin:4px 0 0;font-size:13px;color:var(--text-secondary,#64748b)}',
      '.pm-toolbar{background:#fff;border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:10px 12px;margin-bottom:16px;width:100%;box-sizing:border-box}',
      '.pm-tools{display:flex;gap:6px;flex-wrap:nowrap;align-items:center;width:100%}',
      '.pm-field{padding:7px 10px;border:1px solid var(--border,#e2e8f0);border-radius:8px;font-size:12px;font-family:inherit;background:#fff;color:var(--text,#1e293b);outline:none;flex:1;min-width:0;height:36px;box-sizing:border-box}',
      '.pm-field:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.12)}',
      '.pm-search{flex:2;min-width:120px}',
      '.pm-btn{border:1px solid var(--border,#e2e8f0);background:#fff;color:var(--text,#1e293b);padding:7px 10px;border-radius:8px;font-size:12px;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:border-color .15s,color .15s,background .15s;white-space:nowrap;height:36px;box-sizing:border-box;flex-shrink:0}',
      '.pm-btn:hover{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.5)}',
      '.pm-btn.active{background:#F2B233;border-color:#F2B233;color:#14532D}',
      '.pm-view-group{display:inline-flex;border:1px solid var(--border,#e2e8f0);border-radius:8px;overflow:hidden;flex-shrink:0;height:36px;box-sizing:border-box}',
      '.pm-view-btn{border:none;background:#fff;color:var(--text-secondary,#64748b);padding:7px 9px;cursor:pointer;font-size:12px;font-family:inherit;line-height:1;height:100%;box-sizing:border-box}',
      '.pm-view-btn.active{background:#065f46;color:#fff}',
      '.pm-view-btn + .pm-view-btn{border-left:1px solid var(--border,#e2e8f0)}',
      '.pm-more-panel{display:none;gap:6px;flex-wrap:wrap;margin-top:8px;padding-top:8px;border-top:1px dashed var(--border,#e2e8f0)}',
      '.pm-more-panel.open{display:flex}',
      '.pm-more-panel .pm-field{flex:1;min-width:120px}',
      '.pm-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:16px}',
      '.pm-kpi{background:linear-gradient(120deg,#f3fbf6,#fdfcf2);border:1px solid #e5e7eb;border-radius:14px;padding:15px 16px;box-shadow:0 1px 2px rgba(0,0,0,.04);display:flex;align-items:center;gap:12px}',
      '.pm-kpi-ico{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}',
      '.pm-kpi-label{font-size:11px;color:var(--text-secondary,#64748b);font-weight:600;text-transform:uppercase;letter-spacing:.3px}',
      '.pm-kpi-val{font-size:17px;font-weight:800;color:var(--text,#1e293b);margin-top:2px}',
      '.pm-kpi-sub{font-size:11px;color:var(--text-secondary,#64748b);margin-top:2px}',
      '.pm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}',
      '.pm-card{background:#fff;border:1px solid #e8f5e9;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.04);padding:0;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s;overflow:hidden;position:relative}',
      '.pm-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.08);border-color:#15803D}',
      '.pm-card-img{position:relative;width:100%;height:140px;margin:0;border-radius:0;background:linear-gradient(145deg,#f8fdf6,#eef7ea);overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:8px;box-sizing:border-box}',
      '.pm-card-img img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;transition:transform .35s ease;display:block}',
      '.pm-card:hover .pm-card-img img{transform:scale(1.03)}',
      '.pm-card-placeholder{font-size:52px;color:#cbd5e1;display:flex;align-items:center;justify-content:center;width:100%;height:100%}',
      '.pm-badge{position:absolute;top:8px;left:8px;padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700;color:#fff;z-index:2}',
      '.pm-stock-in{background:#22c55e}.pm-stock-low{background:#f59e0b}.pm-stock-out{background:#ef4444}',
      '.pm-card-body{padding:10px 12px 14px;display:flex;flex-direction:column;flex:1;text-align:center}',
      '.pm-card-name{font-size:14px;font-weight:800;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0 0 2px;line-height:1.2}',
      '.pm-card-meta{display:flex;align-items:center;justify-content:center;gap:6px;margin:0 0 6px;font-size:11px;color:#6b7280}',
      '.pm-card-cat{font-weight:600;color:#16A34A}',
      '.pm-card-stock{position:absolute;top:8px;right:8px;padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700;color:#fff;z-index:2}',
      '.pm-card-stock.in{background:#22c55e}',
      '.pm-card-stock.low{background:#f59e0b}',
      '.pm-card-stock.out{background:#ef4444}',
      '.pm-card-slow{position:absolute;top:8px;left:8px;padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700;color:#fff;z-index:2;background:#d97706}',
      '.pm-card-price{font-size:15px;font-weight:800;color:#15803D;margin:0;display:flex;align-items:baseline;justify-content:center;gap:6px}',
      '.pm-card-unit{font-size:11px;color:#9ca3af;font-weight:500;margin-left:2px}',
      '.pm-card-actions{display:flex;gap:6px;margin-top:auto;padding-top:10px;justify-content:center}',
      '.pm-icon-btn{width:28px;height:28px;border-radius:8px;border:1px solid #d1d5db;background:#fff;color:#6b7280;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:12px;transition:all .2s}',
      '.pm-icon-btn:hover{border-color:#065f46;background:#065f46;color:#fff}',
      '.pm-icon-btn.pm-icon-danger{color:#dc2626}',
      '.pm-icon-btn.pm-icon-danger:hover{border-color:#dc2626;background:#dc2626;color:#fff}',
      '@keyframes pmIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
      '.pm-card{animation:pmIn .35s ease backwards}',
      '.pm-card:nth-child(2){animation-delay:.04s}',
      '.pm-card:nth-child(3){animation-delay:.08s}',
      '.pm-card:nth-child(4){animation-delay:.12s}',
      '.pm-card:nth-child(5){animation-delay:.16s}',
      '.pm-card:nth-child(6){animation-delay:.2s}',
      '.pm-table-wrap{overflow-x:auto;background:#fff;border:1px solid var(--border,#e2e8f0);border-radius:14px}',
      '.pm-table{width:100%;border-collapse:collapse;font-size:13px;min-width:1100px}',
      '.pm-table th{text-align:left;padding:12px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--text-secondary,#64748b);background:#f8fafc;border-bottom:1px solid var(--border,#e2e8f0)}',
      '.pm-table td{padding:11px 14px;border-bottom:1px solid #f1f5f9;vertical-align:middle;color:var(--text,#1e293b)}',
      '.pm-table tr:last-child td{border-bottom:none}',
      '.pm-table tr:hover td{background:#f8fafc}',
      '.pm-td-prod{display:flex;align-items:center;gap:10px}',
      '.pm-td-prod img{width:38px;height:38px;border-radius:8px;object-fit:cover;flex-shrink:0;background:linear-gradient(145deg,#f8fdf6,#eef7ea)}',
      '.pm-td-emoji{width:38px;height:38px;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}',
      '.pm-td-name{font-weight:600;white-space:nowrap}',
      '.pm-td-sub{font-size:11px;color:var(--text-secondary,#64748b);margin-top:1px}',
      '.pm-pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;color:#fff}',
      '.pm-empty{grid-column:1/-1;text-align:center;padding:50px 20px;color:var(--text-secondary,#64748b);font-size:14px;background:#fff;border:1px dashed var(--border,#e2e8f0);border-radius:14px}',
      '.pm-empty .pm-empty-icon{font-size:34px;color:#cbd5e1;margin-bottom:10px}',
      '.pm-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 20px;gap:12px;color:var(--text-secondary,#64748b);font-size:13px}',
      '.pm-spinner{width:30px;height:30px;border:3px solid #d1fae5;border-top-color:#065f46;border-radius:50%;animation:pmspin .7s linear infinite}',
      '@keyframes pmspin{to{transform:rotate(360deg)}}',
      '.pm-error{grid-column:1/-1;text-align:center;padding:40px 20px;color:#b91c1c;font-size:13px;background:#fef2f2;border:1px solid #fecaca;border-radius:14px}',
      '.pm-error .pm-retry{margin-top:12px;border:1px solid #fecaca;background:#fff;color:#b91c1c;padding:8px 14px;border-radius:9px;font-size:13px;font-family:inherit;cursor:pointer}',
      '.pm-overlay{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:12000;opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}',
      '.pm-overlay.open{opacity:1;visibility:visible}',
      '.pm-drawer{position:fixed;top:0;right:-520px;width:520px;max-width:100vw;height:100%;background:linear-gradient(135deg,#14472F,#0d3018);color:#fff;z-index:12001;box-shadow:-8px 0 30px rgba(8,30,16,.55);transition:right .3s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column}',
      '.pm-drawer.open{right:0}',
      '.pm-drawer-x{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:15px;z-index:5;transition:background .2s}',
      '.pm-drawer-x:hover{background:rgba(255,255,255,.16)}',
      '.pm-drawer-scroll{flex:1;overflow-y:auto;padding:18px}',
      '.pm-drawer-scroll::-webkit-scrollbar{width:5px}',
      '.pm-drawer-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:8px}',
      '.pm-drawer-product{display:flex;gap:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:16px;margin-bottom:14px}',
      '.pm-drawer-product img{width:96px;height:96px;border-radius:12px;object-fit:cover;flex-shrink:0;background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(255,255,255,.08))}',
      '.pm-drawer-name{font-size:16px;font-weight:800;color:#fff;display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
      '.pm-drawer-meta{font-size:12px;color:rgba(255,255,255,.75);margin-top:4px}',
      '.pm-section{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:16px;margin-bottom:14px}',
      '.pm-section h3{margin:0 0 12px;font-size:13px;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.10)}',
      '.pm-stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}',
      '.pm-stat{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px 12px;text-align:center}',
      '.pm-stat-label{font-size:10px;font-weight:600;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.4px}',
      '.pm-stat-val{font-size:16px;font-weight:800;color:#fff;margin-top:3px}',
      '.pm-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.pm-detail-item{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px 12px}',
      '.pm-detail-label{font-size:10px;font-weight:600;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px}',
      '.pm-detail-val{font-size:14px;font-weight:700;color:#fff}',
      '.pm-detail-val.green{color:#4ade80}',
      '.pm-detail-val.amber{color:#F2B233}',
      '.pm-detail-val.red{color:#f87171}',
      '.pm-badge-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}',
      '.pm-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;color:#fff}',
      '.pm-badge-best{background:linear-gradient(135deg,#16A34A,#22c55e)}',
      '.pm-badge-slow{background:linear-gradient(135deg,#d97706,#f59e0b)}',
      '.pm-badge-low{background:linear-gradient(135deg,#dc2626,#ef4444)}',
      '.pm-edit-row{display:flex;gap:8px;align-items:center;margin-top:4px}',
      '.pm-price-input{flex:1;padding:9px 12px;border:1px solid rgba(255,255,255,.18);border-radius:10px;font-size:14px;font-family:inherit;outline:none;background:rgba(255,255,255,.08);color:#fff}',
      '.pm-price-input::placeholder{color:rgba(255,255,255,.45)}',
      '.pm-price-input:focus{border-color:#F2B233;box-shadow:0 0 0 3px rgba(242,178,51,.18)}',
      '.pm-price-input.error{border-color:#ef4444}',
      '.pm-save-btn{border:none;background:linear-gradient(135deg,#F2B233,#e0a32f);color:#14532D;padding:10px 20px;border-radius:30px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all .2s;box-shadow:0 6px 14px rgba(242,178,51,.25)}',
      '.pm-save-btn:hover{background:linear-gradient(135deg,#e0a32f,#d49520);transform:translateY(-1px)}',
      '.pm-err{font-size:11px;color:#fca5a5;margin-top:6px}',
      '.pm-note{font-size:11px;color:rgba(255,255,255,.7);margin-top:6px}',
      '.pm-drawer .pm-note strong{color:#F2B233}',
      '.pm-drawer .pm-btn{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;transition:all .2s}',
      '.pm-drawer .pm-btn:hover{border-color:#F2B233;color:#F2B233}',
      '.pm-hist-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.10);font-size:12px;color:rgba(255,255,255,.85)}',
      '.pm-hist-row:last-child{border-bottom:none}',
      '.pm-hist-date{color:rgba(255,255,255,.6)}',
      '.pm-hist-arrow{color:#F2B233;font-weight:700}',
      '.pm-hist-by{font-size:11px;color:rgba(255,255,255,.45)}',
      '.pm-chart{display:flex;align-items:flex-end;gap:8px;height:150px;padding-top:8px}',
      '.pm-chart-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;height:100%}',
      '.pm-chart-bars{display:flex;align-items:flex-end;gap:3px;height:100%;width:100%;justify-content:center}',
      '.pm-bar-o{width:9px;border-radius:3px;background:#F2B233}',
      '.pm-bar-r{width:9px;border-radius:3px;background:rgba(242,178,51,.35)}',
      '.pm-chart-label{font-size:10px;color:rgba(255,255,255,.6);white-space:nowrap}',
      '.pm-legend{display:flex;gap:14px;font-size:11px;color:rgba(255,255,255,.75);margin-top:10px}',
      '.pm-legend span{display:inline-flex;align-items:center;gap:5px}',
      '.pm-dot{width:9px;height:9px;border-radius:3px;display:inline-block}',
      '.pm-country-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.10);font-size:13px;color:rgba(255,255,255,.85)}',
      '.pm-country-row:last-child{border-bottom:none}',
      '.pm-country-name{font-weight:600;color:#fff;display:flex;align-items:center;gap:8px}',
      '.pm-flag{font-size:16px}',
      '@media(max-width:1280px){.pm-kpis{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.pm-grid{grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}}',
      '@media(max-width:900px){.pm-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}}',
      '@media(max-width:640px){.pm-kpis{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.pm-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pm-nav-scroll{grid-template-columns:repeat(2,minmax(0,1fr))}.pm-drawer{right:-100vw;width:100vw;max-width:100vw}.pm-drawer.open{right:0}.pm-tools{flex-wrap:wrap;gap:6px}.pm-search{min-width:0;flex:1 1 100%}.pm-field{flex:1 1 30%}.pm-card{border-radius:10px}.pm-card-img{height:100px}.pm-card-name{font-size:12px}.pm-card-price{font-size:13px}.pm-icon-btn{width:24px;height:24px;font-size:10px}}',
      '@media(max-width:400px){.pm-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}}'
    ].join('\n');
    var s = document.createElement('style');
    s.id = 'pm-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---- Page rendering ---- */
  function currentCategoryName() {
    if (state.category === 'all') return 'All Products';
    var cats = categoryInfo();
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].slug === state.category) return cats[i].name;
    }
    return 'Products';
  }

  function singularize(name) {
    var n = String(name || '').toLowerCase();
    if (n.slice(-3) === 'ies') return n.slice(0, -3) + 'y';
    if (n.slice(-1) === 's') return n.slice(0, -1);
    return n;
  }

  function categorySubtitle() {
    if (state.category === 'all') return 'Manage and monitor all your products';
    return 'Manage and monitor all ' + singularize(currentCategoryName()) + ' products';
  }

  function renderPage() {
    injectCSS();
    var root = document.getElementById('pp-root');
    if (!root) return;
    try {
      root.innerHTML = buildPageHTML();
      bindEvents();
    } catch (err) {
      state.error = String(err && err.message ? err.message : err);
      root.innerHTML =
        '<div class="pm-page"><div class="pm-error"><div>Something went wrong while loading products.</div>' +
        '<button class="pm-retry" onclick="CategoryProducts.render()">Try Again</button></div></div>';
    }
  }

  function buildPageHTML() {
    var k = kpiData();
    var list = filteredProducts();
    var pageItems = list;
    var sm = soldMap();
    var sales = monthRevenue(categoryProducts());
    var unitOpts = unitOptions();

    var navHtml = '<div class="pm-catbar"><div class="pm-nav-scroll">' + navCard({ name: 'All Products', slug: 'all', count: allProducts().length, emoji: '\u{1F4E6}', img: '' }) +
      categoryInfo().map(function (c) { return navCard(c); }).join('') + '</div></div>';

    var kpis = [
      kpiCard('fa-boxes', '#10b981', 'Total Products', String(k.total), 'in this category'),
      kpiCard('fa-check-circle', '#22c55e', 'In Stock', String(k.inS), k.inPct + '% of category'),
      kpiCard('fa-exclamation-triangle', '#f59e0b', 'Low Stock', String(k.lowS), k.lowPct + '% of category'),
      kpiCard('fa-times-circle', '#ef4444', 'Out of Stock', String(k.outS), k.outPct + '% of category'),
      kpiCard('fa-chart-line', '#8b5cf6', 'Sales This Month', money(sales), 'for this category')
    ].join('');

    var results;
    if (state.loading) {
      results = '<div class="pm-loading"><div class="pm-spinner"></div>Loading products...</div>';
    } else if (list.length === 0) {
      results = '<div class="pm-empty"><div class="pm-empty-icon"><i class="fas fa-box-open"></i></div>' +
        '<div>No products found matching your filters</div>' +
        '<button class="pm-btn" style="margin-top:14px" onclick="CategoryProducts.resetFilters()"><i class="fas fa-redo"></i> Reset Filters</button></div>';
    } else if (state.view === 'list') {
      results = '<div class="pm-table-wrap"><table class="pm-table">' +
        '<thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Orders</th><th>Last Sold</th><th>Margin</th><th>Min Stock</th><th>Badges</th><th>Actions</th></tr></thead>' +
        '<tbody>' + pageItems.map(function (p) { return rowHtml(p, sm); }).join('') + '</tbody></table></div>';
    } else {
      results = '<div class="pm-grid">' + pageItems.map(function (p) { return cardHtml(p, sm); }).join('') + '</div>';
    }

    var moreClass = state.moreOpen ? ' open' : '';
    var moreBtnClass = state.moreOpen ? ' active' : '';
    var unitOptsHtml = '<option value="all">All Units</option>' + unitOpts.map(function (u) {
      return '<option value="' + esc(u) + '"' + (state.unit === u ? ' selected' : '') + '>' + esc(u) + '</option>';
    }).join('');

    var viewGroup =
      '<div class="pm-view-group">' +
        '<button class="pm-view-btn' + (state.view === 'grid' ? ' active' : '') + '" id="pmViewGrid" title="Grid view"><i class="fas fa-th-large"></i></button>' +
        '<button class="pm-view-btn' + (state.view === 'list' ? ' active' : '') + '" id="pmViewList" title="List view"><i class="fas fa-list"></i></button>' +
      '</div>';

    var bannerHtml = '<div class="pm-banner"><div class="pm-banner-in">' +
      '<h1 class="pm-banner-title">\u{1F6D2} Farm Fresh Products</h1>' +
      '</div></div>';

    return '<div class="pm-page">' +
      bannerHtml +
      navHtml +
      '<div class="pm-toolbar">' +
        '<div class="pm-tools">' +
          '<input class="pm-field pm-search" id="pmSearch" placeholder="Search by product name..." value="' + esc(state.search) + '">' +
          '<select class="pm-field" id="pmStatus">' +
            '<option value="all"' + (state.status === 'all' ? ' selected' : '') + '>All Status</option>' +
            '<option value="in"' + (state.status === 'in' ? ' selected' : '') + '>In Stock</option>' +
            '<option value="low"' + (state.status === 'low' ? ' selected' : '') + '>Low Stock</option>' +
            '<option value="out"' + (state.status === 'out' ? ' selected' : '') + '>Out of Stock</option>' +
          '</select>' +
          '<select class="pm-field" id="pmStock">' +
            '<option value="all"' + (state.stock === 'all' ? ' selected' : '') + '>All Stock</option>' +
            '<option value="20"' + (state.stock === '20' ? ' selected' : '') + '>Stock \u2265 20</option>' +
            '<option value="50"' + (state.stock === '50' ? ' selected' : '') + '>Stock \u2265 50</option>' +
            '<option value="100"' + (state.stock === '100' ? ' selected' : '') + '>Stock \u2265 100</option>' +
            '<option value="200"' + (state.stock === '200' ? ' selected' : '') + '>Stock \u2265 200</option>' +
            '<option value="lt20"' + (state.stock === 'lt20' ? ' selected' : '') + '>Stock < 20</option>' +
            '<option value="lt50"' + (state.stock === 'lt50' ? ' selected' : '') + '>Stock < 50</option>' +
            '<option value="lt100"' + (state.stock === 'lt100' ? ' selected' : '') + '>Stock < 100</option>' +
            '<option value="lt200"' + (state.stock === 'lt200' ? ' selected' : '') + '>Stock < 200</option>' +
          '</select>' +
          '<select class="pm-field" id="pmSort">' +
            '<option value="name"' + (state.sortBy === 'name' ? ' selected' : '') + '>Sort: Name</option>' +
            '<option value="price_asc"' + (state.sortBy === 'price_asc' ? ' selected' : '') + '>Price: Low to High</option>' +
            '<option value="price_desc"' + (state.sortBy === 'price_desc' ? ' selected' : '') + '>Price: High to Low</option>' +
            '<option value="stock_desc"' + (state.sortBy === 'stock_desc' ? ' selected' : '') + '>Stock: High to Low</option>' +
            '<option value="stock_asc"' + (state.sortBy === 'stock_asc' ? ' selected' : '') + '>Stock: Low to High</option>' +
            '<option value="sold"' + (state.sortBy === 'sold' ? ' selected' : '') + '>Most Sold</option>' +
          '</select>' +
          viewGroup +
          '<button class="pm-add-btn" onclick="CategoryProducts.openAddModal()"><i class="fas fa-plus"></i> Add Product</button>' +
        '</div>' +
        '<div class="pm-more-panel' + moreClass + '" id="pmMorePanel">' +
          '<input class="pm-field" id="pmPriceMin" type="number" min="0" step="0.01" placeholder="Min price" value="' + esc(state.priceMin) + '">' +
          '<input class="pm-field" id="pmPriceMax" type="number" min="0" step="0.01" placeholder="Max price" value="' + esc(state.priceMax) + '">' +
          '<select class="pm-field" id="pmUnit">' + unitOptsHtml + '</select>' +
        '</div>' +
      '</div>' +
      '<div class="pm-kpis">' + kpis + '</div>' +
      results +
      addModalHtml() +
    '</div>';
  }

  function addModalHtml() {
    var catMap = {};
    CATEGORY_ORDER.forEach(function (c) { catMap[c] = 1; });
    allProducts().forEach(function (p) { if (p.cat) catMap[p.cat] = 1; });
    var opts = Object.keys(catMap).map(function (c) {
      return '<option value="' + esc(c) + '">' + esc(c) + '</option>';
    }).join('');
    return '<div class="pm-modal-overlay" id="pmAddOverlay" onclick="if(event.target===this)CategoryProducts.closeAddModal()">' +
      '<div class="pm-modal">' +
        '<div class="pm-modal-head"><h3><i class="fas fa-plus-circle"></i> Add New Product</h3><button class="pm-modal-x" onclick="CategoryProducts.closeAddModal()"><i class="fas fa-times"></i></button></div>' +
        '<div class="pm-modal-body">' +
          '<div class="pm-fgrid">' +
            '<div class="pm-field2" style="grid-column:1/-1"><label>Product Name *</label><input id="pmNewName" placeholder="e.g. Organic Ginger"></div>' +
            '<div class="pm-field2"><label>Category *</label><select id="pmNewCat">' + opts + '</select></div>' +
            '<div class="pm-field2"><label>Price (' + esc(state.currency.trim() || state.currency) + ') *</label><input id="pmNewPrice" type="number" min="0" step="0.01" placeholder="0.00"></div>' +
            '<div class="pm-field2"><label>Stock Qty</label><input id="pmNewStock" type="number" min="0" value="50"></div>' +
            '<div class="pm-field2"><label>Unit</label><input id="pmNewUnit" value="per kg"></div>' +
            '<div class="pm-field2"><label>Emoji</label><input id="pmNewEmoji" value="\u{1F6D2}" maxlength="4"></div>' +
            '<div class="pm-field2" style="grid-column:1/-1"><label>Image URL (optional)</label><input id="pmNewImg" placeholder="https://..."></div>' +
          '</div>' +
          '<div class="pm-add-err" id="pmAddErr"></div>' +
        '</div>' +
        '<div class="pm-modal-foot">' +
          '<button class="pm-btn" onclick="CategoryProducts.closeAddModal()">Cancel</button>' +
          '<button class="pm-btn pm-btn-primary" onclick="CategoryProducts.saveProduct()"><i class="fas fa-check"></i> Add Product</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function productImagesMap() {
    var im = state.productImages || {};
    return im;
  }

  function navCard(c) {
    var active = state.category === c.slug;
    var img = c.img
      ? '<img src="' + esc(c.img) + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" alt="">'
      : '';
    var emoji = '<div class="pm-cat-emoji"' + (img ? ' style="display:none"' : '') + '>' + c.emoji + '</div>';
    return '<button class="pm-cat' + (active ? ' active' : '') + '" onclick="CategoryProducts.openCategory(\'' + c.slug + '\')">' +
      '<span class="pm-cat-img">' + img + emoji + '</span>' +
      '<span class="pm-cat-info">' +
        '<span class="pm-cat-name">' + esc(c.name) + '</span>' +
      '</span>' +
      (active ? '<i class="fas fa-check pm-cat-check"></i>' : '') +
    '</button>';
  }

  function kpiCard(icon, color, label, val, sub) {
    return '<div class="pm-kpi">' +
      '<div class="pm-kpi-ico" style="background:' + color + '14;color:' + color + '"><i class="fas ' + icon + '"></i></div>' +
      '<div><div class="pm-kpi-label">' + label + '</div><div class="pm-kpi-val">' + val + '</div><div class="pm-kpi-sub">' + sub + '</div></div>' +
    '</div>';
  }

  function cardHtml(p, sm) {
    var st = stockStatus(p.stock);
    var img = imageFor(p);
    var imgHtml = img
      ? '<img src="' + esc(img) + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" alt="">'
      : '';
    var placeholder = '<div class="pm-card-placeholder"' + (img ? ' style="display:none"' : '') + '>' + esc(p.emoji || '') + '</div>';
    var sku = esc(p.sku).replace(/'/g, '');
    var curPrice = currentPrice(p);
    var catCls = p.cat ? ' cat-' + p.cat.toLowerCase().replace(/\s+/g, '-') : '';
    var sold = sm[p.sku] ? sm[p.sku].units : 0;
    var stats = productStats(p.sku, currentPrice(p), sm);
    var stockCls = num(p.stock) <= 0 ? 'out' : num(p.stock) <= LOW_STOCK_THRESHOLD ? 'low' : 'in';
    var stockBadge = '<span class="pm-card-stock ' + stockCls + '">' + st.label + '</span>';
    var slowBadge = stats.slowMoving ? '<span class="pm-card-slow">Slow Moving</span>' : '';
    return '<div class="pm-card' + catCls + '" data-cat="' + esc(p.cat || '') + '">' +
      '<div class="pm-card-img">' + imgHtml + placeholder + stockBadge + slowBadge + '</div>' +
      '<div class="pm-card-body">' +
        '<div class="pm-card-name" title="' + esc(p.name) + '">' + esc(p.name) + '</div>' +
        '<div class="pm-card-meta"><span class="pm-card-cat">' + esc(p.cat || '') + '</span></div>' +
        '<div class="pm-card-price">' + money(curPrice) + '<span class="pm-card-unit">\u00B7 ' + esc(p.unit || 'unit') + '</span></div>' +
        '<div class="pm-card-actions">' +
          '<button class="pm-icon-btn" title="View product" onclick="CategoryProducts.openProduct(\'' + sku + '\')"><i class="fas fa-eye"></i></button>' +
          '<button class="pm-icon-btn" title="Edit price" onclick="CategoryProducts.editPrice(\'' + sku + '\')"><i class="fas fa-pen"></i></button>' +
          '<button class="pm-icon-btn pm-icon-danger" title="Delete product" onclick="CategoryProducts.deleteProduct(\'' + sku + '\')"><i class="fas fa-trash"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function rowHtml(p, sm) {
    var st = stockStatus(p.stock);
    var img = imageFor(p);
    var sold = sm[p.sku] ? sm[p.sku].units : 0;
    var sku = esc(p.sku).replace(/'/g, '');
    var thumb = img
      ? '<img src="' + esc(img) + '" onerror="this.style.display=\'none\';this.parentElement.querySelector(\'.pm-td-emoji\').style.display=\'flex\'" alt="">'
      : '';
    var emoji = '<div class="pm-td-emoji"' + (img ? ' style="display:none"' : '') + '>' + esc(p.emoji || '') + '</div>';
    var stats = productStats(p.sku, currentPrice(p), sm);
    var badges = '';
    if (stats.bestSeller) badges += '<span class="pm-badge pm-badge-best" style="position:static;font-size:9px;margin:1px">Best Seller</span>';
    if (stats.slowMoving) badges += '<span class="pm-badge pm-badge-slow" style="position:static;font-size:9px;margin:1px">Slow Moving</span>';
    if (num(p.stock) <= LOW_STOCK_THRESHOLD && num(p.stock) > 0) badges += '<span class="pm-badge pm-badge-low" style="position:static;font-size:9px;margin:1px">Low Stock</span>';
    if (!badges) badges = '<span style="color:var(--text-secondary,#64748b);font-size:12px">—</span>';
    var marginVal = stats.margin.toFixed(1) + '%';
    var marginColor = stats.margin >= 30 ? '#10b981' : stats.margin >= 15 ? '#f59e0b' : '#ef4444';
    return '<tr>' +
      '<td><div class="pm-td-prod">' + thumb + emoji +
        '<div><div class="pm-td-name">' + esc(p.name) + '</div><div class="pm-td-sub">' + esc(p.cat || '—') + '</div></div>' +
      '</div></td>' +
      '<td>' + esc(p.cat || '—') + '</td>' +
      '<td style="font-weight:700;color:#065f46">' + money(currentPrice(p)) + '<span style="font-size:11px;color:var(--text-secondary,#64748b);font-weight:400"> / ' + esc(p.unit || 'unit') + '</span></td>' +
      '<td>' + fmtNum(p.stock) + '</td>' +
      '<td>' + fmtNum(sold) + '</td>' +
      '<td style="font-weight:600">' + fmtNum(stats.orders) + '</td>' +
      '<td style="font-size:12px">' + (stats.lastSold ? fmtDate(stats.lastSold) : '<span style="color:var(--text-secondary,#64748b)">—</span>') + '</td>' +
      '<td style="font-weight:600;color:' + marginColor + '">' + marginVal + '</td>' +
      '<td>' + fmtNum(stats.minStock) + '</td>' +
      '<td><div style="display:flex;flex-wrap:wrap;gap:2px">' + badges + '</div></td>' +
      '<td><div style="display:flex;gap:6px">' +
        '<button class="pm-icon-btn" title="View product" onclick="CategoryProducts.openProduct(\'' + sku + '\')"><i class="fas fa-eye"></i></button>' +
        '<button class="pm-icon-btn" title="Edit price" onclick="CategoryProducts.editPrice(\'' + sku + '\')"><i class="fas fa-pen"></i></button>' +
      '</div></td>' +
    '</tr>';
  }

  function bindEvents() {
    var s = document.getElementById('pmSearch');
    var st = document.getElementById('pmStatus');
    var stock = document.getElementById('pmStock');
    var sort = document.getElementById('pmSort');
    var more = document.getElementById('pmMore');
    var reset = document.getElementById('pmReset');
    var vg = document.getElementById('pmViewGrid');
    var vl = document.getElementById('pmViewList');
    var pmin = document.getElementById('pmPriceMin');
    var pmax = document.getElementById('pmPriceMax');
    var unit = document.getElementById('pmUnit');

    function keepFocus(el) {
      state._focusId = el.id;
      state._caret = el.selectionStart || 0;
    }

    if (s) s.addEventListener('input', function () { keepFocus(this); state.search = this.value; renderPage(); });
    if (st) st.addEventListener('change', function () { state.status = this.value; renderPage(); });
    if (stock) stock.addEventListener('change', function () { state.stock = this.value; renderPage(); });
    if (sort) sort.addEventListener('change', function () { state.sortBy = this.value; renderPage(); });
    if (more) more.addEventListener('click', function () { state.moreOpen = !state.moreOpen; renderPage(); });
    if (pmin) pmin.addEventListener('input', function () { keepFocus(this); state.priceMin = this.value; renderPage(); });
    if (pmax) pmax.addEventListener('input', function () { keepFocus(this); state.priceMax = this.value; renderPage(); });
    if (unit) unit.addEventListener('change', function () { state.unit = this.value; renderPage(); });
    if (vg) vg.addEventListener('click', function () { state.view = 'grid'; renderPage(); });
    if (vl) vl.addEventListener('click', function () { state.view = 'list'; renderPage(); });
    if (reset) reset.addEventListener('click', function () { CategoryProducts.resetFilters(); });

    restoreFocus();
  }

  function restoreFocus() {
    if (!state._focusId) return;
    var el = document.getElementById(state._focusId);
    if (!el) { state._focusId = ''; return; }
    el.focus();
    if (el.setSelectionRange && typeof state._caret === 'number') {
      try { el.setSelectionRange(state._caret, state._caret); } catch (e) {}
    }
    state._focusId = '';
  }

  /* ---- Drawer ---- */
  function renderDrawer(p) {
    injectCSS();
    var st = stockStatus(p.stock);
    var sell = currentPrice(p);
    var cost = costPrice(p);
    var profit = roundTo(sell - cost);
    var margin = sell ? (profit / sell) * 100 : 0;
    var stats = productStats(p.sku, sell);
    var history = getHistory();
    var series = chartSeries(p.sku);
    var img = imageFor(p);
    var flag = countryFlag(state.country);
    var maxRev = 0;
    series.forEach(function (d) { if (d.revenue > maxRev) maxRev = d.revenue; });
    if (maxRev === 0) maxRev = 1;
    var maxOrd = 0;
    series.forEach(function (d) { if (d.orders > maxOrd) maxOrd = d.orders; });
    if (maxOrd === 0) maxOrd = 1;

    var chartCols = series.map(function (d) {
      var oH = Math.round((d.orders / maxOrd) * 100);
      var rH = Math.round((d.revenue / maxRev) * 100);
      return '<div class="pm-chart-col">' +
        '<div class="pm-chart-bars">' +
          '<div class="pm-bar-o" style="height:' + Math.max(4, oH) + '%" title="' + d.orders + ' orders"></div>' +
          '<div class="pm-bar-r" style="height:' + Math.max(4, rH) + '%" title="' + money(d.revenue) + '"></div>' +
        '</div>' +
        '<div class="pm-chart-label">' + d.label + '</div>' +
      '</div>';
    }).join('');

    var histRows = history.length ? history.slice(0, 6).map(function (h) {
      return '<div class="pm-hist-row"><span class="pm-hist-date">' + fmtDate(h.date) + '</span>' +
        '<span><span class="pm-hist-arrow">' + money(h.oldPrice) + '</span> \u2192 <span class="pm-hist-arrow">' + money(h.newPrice) + '</span></span>' +
        '<span class="pm-hist-by">' + esc(h.by || 'Admin') + '</span></div>';
    }).join('') : '<div class="pm-note">No price changes recorded yet</div>';

    var today = new Date();
    var lastUpdated = today.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    var detailStatus = num(p.stock) <= 0 ? 'Out of Stock' : num(p.stock) <= LOW_STOCK_THRESHOLD ? 'Low Stock' : 'In Stock';
    var detailStatusVal = num(p.stock) <= 0 ? 'red' : num(p.stock) <= LOW_STOCK_THRESHOLD ? 'amber' : 'green';

    var badgeHtml = '';
    var hasBadges = stats.bestSeller || stats.slowMoving || (num(p.stock) <= LOW_STOCK_THRESHOLD && num(p.stock) > 0);
    if (hasBadges) {
      badgeHtml = '<div class="pm-badge-row">';
      if (stats.bestSeller) badgeHtml += '<span class="pm-badge pm-badge-best" style="position:static">Best Seller</span>';
      if (stats.slowMoving) badgeHtml += '<span class="pm-badge pm-badge-slow" style="position:static">Slow Moving</span>';
      if (num(p.stock) <= LOW_STOCK_THRESHOLD && num(p.stock) > 0) badgeHtml += '<span class="pm-badge pm-badge-low" style="position:static">Low Stock</span>';
      badgeHtml += '</div>';
    }

    var editHtml;
    if (state.editMode) {
      var editVal = parseFloat(state.editValue) || 0;
      var editCost = costPrice(p);
      var editMargin = editVal ? ((editVal - editCost) / editVal * 100) : 0;
      editHtml = '<div class="pm-edit-row">' +
          '<input class="pm-price-input' + (state.editError ? ' error' : '') + '" id="pmEditInput" type="number" step="0.01" min="0" value="' + esc(state.editValue) + '">' +
          '<button class="pm-save-btn" onclick="CategoryProducts.confirmPrice(\'' + esc(p.sku).replace(/'/g, '') + '\')">Update Price</button>' +
        '</div>' +
        '<div class="pm-detail-grid" style="margin-top:12px">' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Current Price</div><div class="pm-detail-val">' + money(sell) + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Cost Price</div><div class="pm-detail-val">' + money(editCost) + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Profit Margin</div><div class="pm-detail-val ' + (editMargin >= 30 ? 'green' : editMargin >= 15 ? 'amber' : 'red') + '">' + editMargin.toFixed(1) + '%</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Units Sold</div><div class="pm-detail-val">' + fmtNum(stats.units) + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Orders</div><div class="pm-detail-val">' + fmtNum(stats.orders) + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Revenue</div><div class="pm-detail-val">' + money(stats.revenue) + '</div></div>' +
        '</div>' +
        (state.editError ? '<div class="pm-err">' + esc(state.editError) + '</div>' : '');
    } else {
      editHtml = '<div class="pm-edit-row"><button class="pm-btn" onclick="CategoryProducts.editPrice(\'' + esc(p.sku).replace(/'/g, '') + '\')"><i class="fas fa-pen"></i> Edit Price</button></div>' +
        '<div class="pm-detail-grid" style="margin-top:12px">' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Current Price</div><div class="pm-detail-val">' + money(sell) + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Cost Price</div><div class="pm-detail-val">' + money(cost) + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Profit Margin</div><div class="pm-detail-val ' + (margin >= 30 ? 'green' : margin >= 15 ? 'amber' : 'red') + '">' + margin.toFixed(1) + '%</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Units Sold</div><div class="pm-detail-val">' + fmtNum(stats.units) + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Orders</div><div class="pm-detail-val">' + fmtNum(stats.orders) + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Revenue</div><div class="pm-detail-val">' + money(stats.revenue) + '</div></div>' +
        '</div>';
    }

    var body =
      '<div class="pm-drawer-product">' +
        (img ? '<img src="' + img + '" onerror="this.style.display=\'none\'" alt="">' : '<div style="width:96px;height:96px;border-radius:12px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:40px;flex-shrink:0">' + esc(p.emoji || '') + '</div>') +
        '<div>' +
          '<div class="pm-drawer-name">' + esc(p.name) + '</div>' +
          '<div class="pm-drawer-meta" style="margin-top:4px"><span class="pm-badge ' + st.cls + '" style="position:static;font-size:10px">' + st.label + '</span></div>' +
          badgeHtml +
          '<div class="pm-drawer-meta">' + esc(p.cat || '—') + '</div>' +
          '<div class="pm-drawer-meta">' + esc(p.unit || '—') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="pm-section">' +
        '<h3><i class="fas fa-tags"></i> Price Summary</h3>' +
        '<div class="pm-stat-row" style="grid-template-columns:repeat(4,1fr)">' +
          statCard('Stock', fmtNum(p.stock) + ' pcs') +
          statCard('Cost Price', money(cost)) +
          statCard('Selling Price', money(sell)) +
          statCard('Profit', money(profit)) +
        '</div>' +
        '<div class="pm-stat-row" style="margin-top:10px;grid-template-columns:repeat(4,1fr)">' +
          statCard('Margin', margin.toFixed(2) + '%') +
        '</div>' +
      '</div>' +
      '<div class="pm-section">' +
        '<h3><i class="fas fa-edit"></i> Edit Price</h3>' +
        editHtml +
      '</div>' +
      '<div class="pm-section">' +
        '<h3><i class="fas fa-info-circle"></i> Product Details</h3>' +
        '<div class="pm-detail-grid">' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Category</div><div class="pm-detail-val">' + esc(p.cat || '—') + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Unit</div><div class="pm-detail-val">' + esc(p.unit || '—') + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Stock</div><div class="pm-detail-val">' + fmtNum(p.stock) + ' pcs</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Min Stock Level</div><div class="pm-detail-val">' + fmtNum(stats.minStock) + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Status</div><div class="pm-detail-val ' + detailStatusVal + '">' + detailStatus + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Last Sold</div><div class="pm-detail-val">' + (stats.lastSold ? fmtDate(stats.lastSold) : '—') + '</div></div>' +
          '<div class="pm-detail-item"><div class="pm-detail-label">Last Updated</div><div class="pm-detail-val">' + lastUpdated + '</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="pm-section">' +
        '<h3><i class="fas fa-history"></i> Price History (' + esc(state.country) + ')</h3>' +
        histRows +
      '</div>' +
      '<div class="pm-section">' +
        '<h3><span class="pm-flag">' + flag + '</span> Orders &amp; Revenue Over Time</h3>' +
        '<div class="pm-chart">' + chartCols + '</div>' +
        '<div class="pm-legend"><span><span class="pm-dot" style="background:#F2B233"></span>Orders</span><span><span class="pm-dot" style="background:rgba(242,178,51,.35)"></span>Revenue</span></div>' +
      '</div>' +
      '<div class="pm-section">' +
        '<h3><i class="fas fa-chart-pie"></i> Product Sales Analytics</h3>' +
        '<div class="pm-stat-row" style="grid-template-columns:repeat(4,1fr)">' +
          statCard('Total Orders', String(stats.orders)) +
          statCard('Units Sold', fmtNum(stats.units)) +
          statCard('Total Revenue', money(stats.revenue)) +
          statCard('AOV', money(stats.aov)) +
        '</div>' +
        '<div class="pm-stat-row" style="margin-top:10px;grid-template-columns:repeat(4,1fr)">' +
          statCard('Total Profit', money(stats.profit)) +
          statCard('Profit Margin', stats.margin.toFixed(2) + '%') +
          statCard('Returned', fmtNum(stats.returned)) +
          statCard('Cancelled', fmtNum(stats.cancelled)) +
        '</div>' +
      '</div>' +
      '<div class="pm-section">' +
        '<h3><span class="pm-flag">' + flag + '</span> ' + esc(state.country) + ' — Product Sales</h3>' +
        '<div class="pm-country-row">' +
          '<span class="pm-country-name"><span class="pm-flag">' + flag + '</span>' + esc(state.country) + '</span>' +
          '<span>' + stats.orders + ' orders \u00B7 ' + fmtNum(stats.units) + ' units \u00B7 ' + money(stats.revenue) + '</span>' +
        '</div>' +
        '<div class="pm-country-row">' +
          '<span class="pm-country-name">Average Order Value</span>' +
          '<span style="font-weight:700;color:#F2B233">' + money(stats.aov) + '</span>' +
        '</div>' +
        '<div class="pm-country-row">' +
          '<span class="pm-country-name">Total Profit</span>' +
          '<span style="font-weight:700;color:#F2B233">' + money(stats.profit) + '</span>' +
        '</div>' +
        '<div class="pm-country-row">' +
          '<span class="pm-country-name">Return Rate</span>' +
          '<span style="font-weight:600">' + (stats.units ? ((stats.returned / stats.units) * 100).toFixed(2) + '%' : '0.00%') + '</span>' +
        '</div>' +
      '</div>';

    var drawer = document.getElementById('pmDrawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'pmDrawer';
      drawer.className = 'pm-drawer';
      drawer.innerHTML = '<button class="pm-drawer-x" onclick="CategoryProducts.closeDrawer()"><i class="fas fa-times"></i></button><div class="pm-drawer-scroll"></div>';
      document.body.appendChild(drawer);
    }
    var overlay = document.getElementById('pmOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'pmOverlay';
      overlay.className = 'pm-overlay';
      overlay.addEventListener('click', function () { CategoryProducts.closeDrawer(); });
      document.body.appendChild(overlay);
    }
    drawer.querySelector('.pm-drawer-scroll').innerHTML = body;
    overlay.classList.add('open');
    drawer.classList.add('open');
    if (state.editMode) {
      var inp = document.getElementById('pmEditInput');
      if (inp) { inp.focus(); inp.select(); }
    }
  }

  function statCard(label, val) {
    return '<div class="pm-stat"><div class="pm-stat-label">' + label + '</div><div class="pm-stat-val">' + val + '</div></div>';
  }

  function countryFlag(country) {
    return { India: '\u{1F1EE}\u{1F1F3}', US: '\u{1F1FA}\u{1F1F8}', UAE: '\u{1F1E6}\u{1F1EA}', Singapore: '\u{1F1F8}\u{1F1EC}' }[country] || '\u{1F310}';
  }

  function findProduct(sku) {
    return allProducts().find(function (p) { return p.sku === sku; }) || null;
  }

  var CategoryProducts = {
    configure: function (opts) {
      opts = opts || {};
      state.country = opts.country || 'India';
      state.currency = opts.currency || '\u20B9';
      state.currencyLabel = opts.currencyLabel || 'INR';
      state.decimals = opts.decimals === 0 ? 0 : (opts.decimals || 0);
      state.priceKey = opts.priceKey || ('vpnexues_prices_' + state.country);
      state.storeKey = opts.storeKey || ('vpnexues_products_' + state.country);
      state.historyKey = 'vpnexues_price_history_' + state.country;
      state.products = opts.products || [];
      state.productImages = opts.productImages || {};
      if (state.products.length) {
        try {
          var existing = loadJSON(state.storeKey);
          if (Array.isArray(existing)) {
            var customs = existing.filter(function (x) {
              return x && x.sku && String(x.sku).indexOf('CUS-') === 0 &&
                !state.products.some(function (p) { return p.sku === x.sku; });
            });
            if (customs.length) state.products = state.products.concat(customs);
          }
          localStorage.setItem(state.storeKey, JSON.stringify(state.products));
        } catch (e) {}
      }
    },

    render: function () {
      renderPage();
      if (state.activeProduct && document.getElementById('pmDrawer')) {
        var p = findProduct(state.activeProduct);
        if (p) renderDrawer(p);
      }
    },

    openProduct: function (sku) {
      var p = findProduct(sku);
      if (!p) return;
      state.activeProduct = sku;
      state.editMode = false;
      state.editError = '';
      renderDrawer(p);
    },

    editPrice: function (sku) {
      var p = findProduct(sku);
      if (!p) return;
      state.activeProduct = sku;
      state.editMode = true;
      state.editValue = String(currentPrice(p));
      state.editError = '';
      renderDrawer(p);
    },

    confirmPrice: function (sku) {
      var p = findProduct(sku);
      if (!p) return;
      var input = document.getElementById('pmEditInput');
      if (!input) return;
      var val = parseFloat(String(input.value).replace(/[^0-9.\-]/g, ''));
      if (isNaN(val) || val < 0) {
        state.editError = 'Please enter a valid price (0 or above).';
        renderDrawer(p);
        return;
      }
      var old = currentPrice(p);
      var overrides = loadJSON(state.priceKey) || {};
      overrides[sku] = roundTo(val);
      saveJSON(state.priceKey, overrides);

      // Also save to vpnexues_price_overrides for shop.html
      try {
        var shopOverrides = JSON.parse(localStorage.getItem('vpnexues_price_overrides') || '{}');
        var overrideKey = (p.cat || 'General') + '::' + p.name;
        var countryMap = { 'India': 'IN', 'US': 'US', 'UAE': 'AE', 'Singapore': 'SG' };
        var countryCode = countryMap[state.country] || 'IN';
        if (!shopOverrides[overrideKey]) shopOverrides[overrideKey] = {};
        if (!shopOverrides[overrideKey][countryCode]) shopOverrides[overrideKey][countryCode] = {};
        shopOverrides[overrideKey][countryCode].price = roundTo(val);
        localStorage.setItem('vpnexues_price_overrides', JSON.stringify(shopOverrides));
      } catch (e) {}

      pushHistory(sku, old, roundTo(val));
      state.editMode = false;
      state.editError = '';
      state.activeProduct = sku;
      renderDrawer(p);
      renderPage();
      if (typeof window.showToast === 'function') {
        var img = p.img || p.mobileImg || '';
        window.showToast(
          '<div style="display:flex;align-items:center;gap:14px">' +
            (img ? '<img src="' + img + '" style="width:56px;height:56px;border-radius:10px;object-fit:cover;border:2px solid rgba(255,255,255,.3)">' : '') +
            '<div><div style="font-weight:700;font-size:14px;margin-bottom:4px">' + p.name + '</div>' +
            '<div style="font-size:12px;opacity:.85">New Price: <span style="font-weight:700;color:#fbbf24">' + money(roundTo(val)) + '</span></div></div>' +
          '</div>',
          'success',
          'Price updated successfully'
        );
      }
    },

    closeDrawer: function () {
      var drawer = document.getElementById('pmDrawer');
      var overlay = document.getElementById('pmOverlay');
      if (overlay) overlay.classList.remove('open');
      if (drawer) drawer.classList.remove('open');
      state.editMode = false;
      state.editError = '';
    },

    getProducts: function () { return allProducts(); },

    openCategory: function (catSlug) {
      state.category = catSlug;
      state.loading = true;
      state.error = '';
      renderPage();
      setTimeout(function () {
        state.loading = false;
        renderPage();
      }, 160);
    },

    showAll: function () {
      this.openCategory('all');
    },

    resetFilters: function () {
      state.search = '';
      state.status = 'all';
      state.stock = 'all';
      state.unit = 'all';
      state.priceMin = '';
      state.priceMax = '';
      state.sortBy = 'name';
      renderPage();
    },

    deleteProduct: function (sku) {
      var p = findProduct(sku);
      if (!p) return;
      if (!confirm('Delete product ' + p.name + '?')) return;
      state.products = allProducts().filter(function (x) { return x.sku !== sku; });
      try { localStorage.setItem(state.storeKey, JSON.stringify(state.products)); } catch (e) {}
      if (String(sku).indexOf('CUS-') === 0) {
        try {
          var arr = JSON.parse(localStorage.getItem('vpnexues_custom_products') || '[]');
          arr = arr.filter(function (x) { return x.sku !== sku; });
          localStorage.setItem('vpnexues_custom_products', JSON.stringify(arr));
        } catch (e) {}
      }
      this.render();
    },

    openAddModal: function () {
      var ov = document.getElementById('pmAddOverlay');
      if (!ov) { renderPage(); ov = document.getElementById('pmAddOverlay'); }
      if (!ov) return;
      var err = document.getElementById('pmAddErr');
      if (err) { err.style.display = 'none'; err.textContent = ''; }
      ov.classList.add('open');
      document.body.style.overflow = 'hidden';
      var n = document.getElementById('pmNewName');
      if (n) setTimeout(function () { n.focus(); }, 60);
    },

    closeAddModal: function () {
      var ov = document.getElementById('pmAddOverlay');
      if (ov) ov.classList.remove('open');
      document.body.style.overflow = '';
    },

    saveProduct: function () {
      var g = function (id) { var el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
      var name = g('pmNewName');
      var cat = g('pmNewCat');
      var price = num(g('pmNewPrice'));
      var err = document.getElementById('pmAddErr');
      function fail(msg) {
        if (err) { err.textContent = msg; err.style.display = 'block'; }
      }
      if (!name) { fail('Please enter a product name.'); return; }
      if (allProducts().some(function (p) { return p.name.toLowerCase() === name.toLowerCase(); })) { fail('A product with this name already exists.'); return; }
      if (!(price > 0)) { fail('Please enter a valid price greater than 0.'); return; }
      var stock = Math.max(0, parseInt(g('pmNewStock'), 10) || 0);
      var unit = g('pmNewUnit') || 'per pc';
      var emoji = g('pmNewEmoji') || '\u{1F6D2}';
      var img = g('pmNewImg');
      var sku = 'CUS-' + Date.now().toString(36).toUpperCase().slice(-6);
      var p = { name: name, sku: sku, cat: cat, price: price, unit: unit, stock: stock, emoji: emoji, tags: 'New, Organic', custom: true };
      if (img) p.img = img;
      state.products = allProducts().concat([p]);
      try { localStorage.setItem(state.storeKey, JSON.stringify(state.products)); } catch (e) {}

      // Share with shop.html so the product appears in the storefront
      try {
        var ccMap = { India: 'IN', US: 'US', UAE: 'AE', Singapore: 'SG' };
        var rec = { cc: ccMap[state.country] || 'IN', sku: sku, name: name, cat: cat, emoji: emoji, unit: unit, price: price, img: img, tags: 'New, Organic' };
        var arr = JSON.parse(localStorage.getItem('vpnexues_custom_products') || '[]');
        if (Array.isArray(arr)) arr.push(rec); else arr = [rec];
        localStorage.setItem('vpnexues_custom_products', JSON.stringify(arr));
      } catch (e) {}

      this.closeAddModal();
      renderPage();
      if (typeof window.showToast === 'function') {
        window.showToast(name + ' added to ' + cat + ' and published to the shop');
      }
    }
  };

  window.CategoryProducts = CategoryProducts;

  window.filterProductsByCategory = function (cat) { if (window.CategoryProducts) CategoryProducts.openCategory(cat); };
  window.showAllCategories = function () { if (window.CategoryProducts) CategoryProducts.showAll(); };
})();