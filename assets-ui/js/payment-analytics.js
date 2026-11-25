/* VPNexues PaymentAnalytics (Payments & Analytics manager)
 * Payments page for sub admin dashboards.
 * Renders country-specific KPIs, a Payment Revenue Overview chart with
 * Daily/Weekly/Monthly/Yearly views, a Payments by Method donut chart,
 * payment insights, a filterable/paginated transactions table and a
 * payment detail drawer with verification + order timeline + actions.
 * Only the configured country's data is shown.
 */
(function () {
  'use strict';

  var PAGE_SIZE = 8;

  var state = {
    country: 'India',
    currency: '\u20B9',
    currencyLabel: 'INR',
    decimals: 0,
    transactions: [],
    orders: [],
    search: '',
    status: 'all',
    method: 'all',
    period: 'all',
    amount: 'all',
    page: 1,
    activeTx: null,
    amountRange: [0, Infinity],
    knownMethods: []
  };

  var COUNTRY_METHODS = {
    India: ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Card', 'Netbanking', 'COD'],
    US: ['Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Bank Transfer', 'COD'],
    UAE: ['Card', 'Apple Pay', 'Google Pay', 'Bank Transfer', 'COD'],
    Singapore: ['PayNow', 'Card', 'GrabPay', 'Google Pay', 'Apple Pay', 'Bank Transfer']
  };

  var COUNTRY_CURRENCY = {
    India: { currency: '\u20B9', currencyLabel: 'INR', decimals: 0 },
    US: { currency: '$', currencyLabel: 'USD', decimals: 2 },
    UAE: { currency: 'AED ', currencyLabel: 'AED', decimals: 2 },
    Singapore: { currency: 'S$', currencyLabel: 'SGD', decimals: 2 }
  };

  var COUNTRY_FLAGS = {
    India: '\u{1F1EE}\u{1F1F3}',
    US: '\u{1F1FA}\u{1F1F8}',
    UAE: '\u{1F1E6}\u{1F1EA}',
    Singapore: '\u{1F1F8}\u{1F1EC}'
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

  function digits() {
    return state.decimals === 0 ? 0 : (state.decimals || 0);
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

  function fmtMoneyShort(n) {
    var v = Number(n || 0);
    if (v >= 1000000) return state.currency + (v / 1000000).toFixed(2) + 'M';
    if (v >= 1000) return state.currency + (v / 1000).toFixed(1) + 'K';
    return money(v);
  }

  function fmtDateTime(iso) {
    if (!iso) return 'â€”';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function daysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  }

  function dateKey(d) {
    return d.toISOString().slice(0, 10);
  }

  function seeded(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  /* ---- data loading ---- */
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

  function customers() {
    var c = [];
    if (typeof window.OrderManager === 'object' && window.OrderManager && window.OrderManager.getCustomers) {
      c = window.OrderManager.getCustomers(state.country);
    }
    if (!c.length && typeof window.DashboardAPI === 'object' && window.DashboardAPI && window.DashboardAPI.getCustomers) {
      c = window.DashboardAPI.getCustomers(state.country);
    }
    return c;
  }

  function ensureTransactions() {
    if (state.transactions.length) return;
    var stored = loadJSON('vpnexues_payments_' + state.country);
    if (Array.isArray(stored) && stored.length) {
      state.transactions = stored;
      return;
    }
    buildTransactions();
    try { localStorage.setItem('vpnexues_payments_' + state.country, JSON.stringify(state.transactions)); } catch (e) {}
  }

  function methodsForCountry() {
    return COUNTRY_METHODS[state.country] || ['Card', 'UPI', 'COD', 'Bank Transfer'];
  }

  function verificationFor(status) {
    if (status === 'refunded') return 'N/A';
    var r = seeded(status + '|' + state.country);
    if (r % 10 < 6) return 'Verified';
    if (r % 10 < 9) return 'Under Review';
    return 'Failed';
  }

  function platformFor(method) {
    var map = {
      'UPI': 'NPCI',
      'Google Pay': 'Google Pay',
      'PhonePe': 'PhonePe',
      'Paytm': 'Paytm',
      'BHIM': 'NPCI',
      'Card': 'Card Network',
      'PayPal': 'PayPal',
      'Apple Pay': 'Apple Pay',
      'GrabPay': 'GrabPay',
      'PayNow': 'FAST / PayNow',
      'Netbanking': 'Bank Gateway',
      'Bank Transfer': 'Bank Gateway',
      'COD': 'Cash on Delivery'
    };
    return map[method] || 'Gateway';
  }

  function refFor(tx, i) {
    var m = tx.method.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    var cc = { 'US': 'US', 'UAE': 'AE', 'India': 'IN', 'Singapore': 'SG' }[state.country] || 'TX';
    return (state.country === 'India' ? 'TXN' : 'PAY') + cc + m + String(1000000 + seeded(tx.orderId || '') % 8999999) + 'R' + (i % 10);
  }

  function buildTransactions() {
    var orders = getOrders().slice().reverse();
    var custs = customers();
    var list = [];
    var methods = methodsForCountry();
    var statuses = ['successful', 'successful', 'successful', 'successful', 'successful', 'pending', 'failed', 'successful', 'refunded', 'pending'];

    orders.forEach(function (o, idx) {
      var total = 0;
      (o.items || []).forEach(function (it) {
        total += num(it.qty) * num(it.price);
      });
      total = Math.round(total * 100) / 100;
      var method = methods[seeded(o.id || String(idx)) % methods.length];
      var status = statuses[seeded((o.id || '') + method) % statuses.length];
      var dateIso = o.date ? new Date(o.date + 'T' + (String(9 + (seeded(o.id || '') % 9)).padStart(2, '0')) + ':' + String(seeded(o.id || '') % 60).padStart(2, '0') + ':00').toISOString() : new Date().toISOString();
      var customer = custs[idx % Math.max(custs.length, 1)] || { name: 'Guest Customer', phone: 'â€”', email: 'â€”', address: 'â€”' };
      var amount = total + (method === 'COD' ? 0 : Math.round((seeded(o.id || '') % 30) * 100) / 100);
      var txnId = 'TXN-' + String(100000 + idx + 1);
      var countryFromId = state.country;
      var currMap = { India: 'INR', US: 'USD', UAE: 'AED', Singapore: 'SGD' };
      var currLabel = currMap[countryFromId] || 'INR';
      var isRefunded = status === 'refunded';
      var isVerified = verificationFor(status) === 'Verified';
      var payTime = String(9 + (seeded(o.id || '') % 9)).padStart(2, '0') + ':' + String(seeded(o.id || '') % 60).padStart(2, '0') + ':' + String(seeded((o.id || '') + 's') % 60).padStart(2, '0');
      list.push({
        id: txnId,
        orderId: o.id,
        customer: customer.name || 'Guest Customer',
        phone: customer.phone || 'â€”',
        email: customer.email || 'â€”',
        address: customer.address || 'â€”',
        method: method,
        platform: platformFor(method),
        amount: Math.round(amount * 100) / 100,
        date: dateIso,
        status: status,
        verification: verificationFor(status),
        items: o.items || [],
        currency: currLabel,
        transactionRef: 'REF-' + txnId.replace('TXN-', ''),
        paymentDate: dateIso,
        paymentTime: payTime,
        refundStatus: isRefunded ? 'Refunded' : 'None',
        refundAmount: isRefunded ? Math.round(amount * 100) / 100 : 0,
        verifiedBy: isVerified ? 'Admin' : null,
        verificationDate: isVerified ? dateIso : null,
        country: countryFromId
      });
    });
    state.transactions = list;
  }

  /* ---- KPIs ---- */
  function kpiData() {
    var list = state.transactions;
    var totalRev = 0;
    var successful = 0;
    var pending = 0;
    var failed = 0;
    var refundedAmt = 0;
    var refundCount = 0;
    list.forEach(function (t) {
      if (t.status === 'successful') { totalRev += t.amount; successful++; }
      else if (t.status === 'pending') pending++;
      else if (t.status === 'failed') failed++;
      else if (t.status === 'refunded') { refundedAmt += t.amount; refundCount++; }
    });
    var attempted = successful + failed;
    return {
      totalRevenue: totalRev,
      totalPayments: list.length,
      successful: successful,
      pending: pending,
      failed: failed,
      refundedAmt: refundedAmt,
      refundCount: refundCount,
      successRate: attempted ? (successful / attempted) * 100 : 0
    };
  }

  /* ---- Revenue overview chart ---- */
  function revenueSeries(period) {
    var list = state.transactions.filter(function (t) { return t.status === 'successful' || t.status === 'refunded'; });
    var map = {};
    list.forEach(function (t) {
      var d = new Date(t.date);
      if (isNaN(d.getTime())) return;
      var key;
      var label;
      if (period === 'yearly') {
        key = String(d.getFullYear());
        label = String(d.getFullYear());
      } else if (period === 'monthly') {
        key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        label = d.toLocaleDateString('en-US', { month: 'short' });
      } else if (period === 'weekly') {
        var one = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        var day = (one.getDay() + 6) % 7;
        one.setDate(one.getDate() - day);
        key = dateKey(one);
        label = 'Wk ' + one.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        key = dateKey(d);
        label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      }
      if (!map[key]) map[key] = { label: label, revenue: 0, count: 0 };
      map[key].revenue += t.status === 'successful' ? t.amount : -t.amount;
      map[key].count++;
    });
    var keys = Object.keys(map);
    if (!keys.length) {
      for (var i = 6; i >= 0; i--) {
        var dd = daysAgo(i);
        keys.push(dateKey(dd));
        map[dateKey(dd)] = { label: dd.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }), revenue: 0, count: 0 };
      }
    }
    keys.sort();
    return keys.slice(-8).map(function (k) { return map[k]; });
  }

  function methodTotals() {
    var map = {};
    state.transactions.forEach(function (t) {
      if (!map[t.method]) map[t.method] = { count: 0, revenue: 0 };
      map[t.method].count++;
      if (t.status === 'successful') map[t.method].revenue += t.amount;
      if (t.status === 'refunded') map[t.method].revenue -= t.amount;
    });
    return map;
  }

  /* ---- Insights ---- */
  function insights() {
    var k = kpiData();
    var totalAmt = 0;
    state.transactions.forEach(function (t) { totalAmt += t.amount; });
    var avgTx = state.transactions.length ? totalAmt / state.transactions.length : 0;
    var bestMethod = null;
    var bestRev = -1;
    var methods = methodTotals();
    Object.keys(methods).forEach(function (m) {
      if (methods[m].revenue > bestRev) { bestRev = methods[m].revenue; bestMethod = m; }
    });
    var dayRev = {};
    state.transactions.forEach(function (t) {
      if (t.status !== 'successful') return;
      var d = new Date(t.date);
      var key = d.toLocaleDateString('en-US', { weekday: 'long' });
      dayRev[key] = (dayRev[key] || 0) + t.amount;
    });
    var bestDay = null;
    var bestDayRev = -1;
    Object.keys(dayRev).forEach(function (d) {
      if (dayRev[d] > bestDayRev) { bestDayRev = dayRev[d]; bestDay = d; }
    });
    return {
      bestMethod: bestMethod || 'â€”',
      bestDay: bestDay || 'â€”',
      avgTx: avgTx,
      successRate: k.successRate,
      refundRate: k.totalPayments ? (k.refundCount / k.totalPayments) * 100 : 0,
      failedRate: k.totalPayments ? (k.failed / k.totalPayments) * 100 : 0
    };
  }

  /* ---- filtering + pagination ---- */
  function filteredTransactions() {
    var list = state.transactions.slice();
    var q = state.search.toLowerCase().trim();
    if (q) {
      list = list.filter(function (t) {
        return t.id.toLowerCase().indexOf(q) !== -1 ||
          String(t.orderId || '').toLowerCase().indexOf(q) !== -1 ||
          (t.customer || '').toLowerCase().indexOf(q) !== -1;
      });
    }
    if (state.status !== 'all') list = list.filter(function (t) { return t.status === state.status; });
    if (state.method !== 'all') list = list.filter(function (t) { return t.method === state.method; });
    if (state.period !== 'all') {
      var now = new Date();
      list = list.filter(function (t) {
        var d = new Date(t.date);
        if (isNaN(d.getTime())) return false;
        if (state.period === 'today') return d.toDateString() === now.toDateString();
        if (state.period === 'week') return (now - d) <= 7 * 24 * 3600 * 1000;
        if (state.period === 'month') return (now - d) <= 30 * 24 * 3600 * 1000;
        if (state.period === 'year') return d.getFullYear() === now.getFullYear();
        return true;
      });
    }
    if (state.amount !== 'all') {
      var r = state.amountRange;
      list = list.filter(function (t) { return t.amount >= r[0] && t.amount <= r[1]; });
    }
    return list;
  }

  function totalPages() {
    var count = filteredTransactions().length;
    return Math.max(1, Math.ceil(count / PAGE_SIZE));
  }

  function pageItems() {
    var list = filteredTransactions();
    var pages = totalPages();
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }

  /* ---- CSS ---- */
  function injectCSS() {
    if (document.getElementById('pa-style')) return;
    var css = [
      '.pa-page{font-family:inherit}',
      '.pa-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:18px}',
      '.pa-head h1{margin:0;font-size:22px;font-weight:800;color:var(--text,#1e293b)}',
      '.pa-head p{margin:4px 0 0;font-size:13px;color:var(--text-secondary,#64748b)}',
      '.pa-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:14px}',
      '.pa-kpi{background:linear-gradient(120deg,#f3fbf6,#fdfcf2);border:1px solid #e5e7eb;border-radius:14px;padding:16px 18px;box-shadow:0 1px 2px rgba(0,0,0,.04);display:flex;align-items:center;gap:14px}',
      '.pa-kpi-ico{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}',
      '.pa-kpi-label{font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.3px}',
      '.pa-kpi-val{font-size:19px;font-weight:800;color:#1e293b;margin-top:2px}',
      '.pa-kpi-sub{font-size:12px;font-weight:600;color:#16A34A;margin-top:2px}',
      '.pa-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;margin-bottom:14px}',
      '.pa-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.04);transition:transform .2s,box-shadow .2s,border-color .2s}',
      '.pa-card:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(20,83,45,.12)}',
      '@keyframes paIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
      '.pa-card,.pa-kpi{animation:paIn .35s ease backwards}',
      '.pa-card h3{margin:0 0 12px;font-size:13px;font-weight:700;color:var(--text,#1e293b);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}',
      '.pa-seg{display:inline-flex;background:#f1f5f9;border-radius:9px;padding:3px;gap:2px}',
      '.pa-seg button{border:none;background:transparent;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;color:var(--text-secondary,#64748b);cursor:pointer;font-family:inherit}',
      '.pa-seg button.on{background:#065f46;color:#fff}',
      '.pa-chart{display:flex;align-items:flex-end;gap:8px;height:180px;padding-top:8px}',
      '.pa-chart-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;height:100%;min-width:0}',
      '.pa-chart-bars{display:flex;align-items:flex-end;justify-content:center;width:100%;height:100%}',
      '.pa-bar{width:46%;max-width:30px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#10b981,#065f46);min-height:4px}',
      '.pa-chart-label{font-size:10px;color:var(--text-secondary,#64748b);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}',
      '.pa-val-tip{font-size:11px;color:#065f46;font-weight:700}',
      '.pa-donut-wrap{display:flex;align-items:center;gap:18px;flex-wrap:wrap}',
      '.pa-donut{width:150px;height:150px;border-radius:50%;position:relative;flex-shrink:0}',
      '.pa-donut-inner{position:absolute;inset:24px;background:#fff;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center}',
      '.pa-donut-total{font-size:18px;font-weight:800;color:var(--text,#1e293b)}',
      '.pa-donut-sub{font-size:10px;color:var(--text-secondary,#64748b)}',
      '.pa-legend{display:flex;flex-direction:column;gap:7px;font-size:12px;min-width:130px;flex:1}',
      '.pa-leg{display:flex;align-items:center;gap:8px;justify-content:space-between}',
      '.pa-leg-l{display:flex;align-items:center;gap:7px}',
      '.pa-leg-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}',
      '.pa-leg-pct{color:var(--text-secondary,#64748b);font-size:11px}',
      '.pa-insights{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}',
      '.pa-ins{background:linear-gradient(120deg,#f3fbf6,#fdfcf2);border:1px solid #e5e7eb;border-radius:10px;padding:12px 13px}',
      '.pa-ins-label{font-size:10px;font-weight:600;color:var(--text-secondary,#64748b);text-transform:uppercase;letter-spacing:.4px}',
      '.pa-ins-val{font-size:15px;font-weight:800;color:var(--text,#1e293b);margin-top:4px}',
      '.pa-tools{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}',
      '.pa-field{padding:9px 12px;border:1px solid var(--border,#e2e8f0);border-radius:10px;font-size:13px;font-family:inherit;background:#fff;color:var(--text,#1e293b);outline:none}',
      '.pa-field:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.12)}',
      '.pa-search{flex:1;min-width:200px}',
      '.pa-btn{border:1px solid var(--border,#e2e8f0);background:#fff;color:var(--text,#1e293b);padding:9px 14px;border-radius:10px;font-size:13px;font-family:inherit;cursor:pointer}',
      '.pa-btn:hover{border-color:#10b981;color:#065f46}',
      '.pa-table-wrap{background:#fff;border:1px solid var(--border,#e2e8f0);border-radius:14px;overflow:hidden}',
      '.pa-table-scroll{overflow-x:auto}',
      '.pa-table{width:100%;border-collapse:collapse;min-width:860px;font-size:13px}',
      '.pa-table th{background:#166534;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:.5px;padding:12px 14px;text-align:left;font-weight:700;border-bottom:none;white-space:nowrap}',
      '.pa-table td{padding:13px 14px;border-bottom:1px solid #e8f5e9;color:var(--text,#1e293b);vertical-align:middle;background:#f0fdf4}',
      '.pa-table tr:last-child td{border-bottom:none}',
      '.pa-table tr:hover td{background:#dcfce7}',
      '.pa-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:20px;font-size:11px;font-weight:700;text-transform:capitalize}',
      '.pa-pill-s{background:#dcfce7;color:#15803d}.pa-pill-p{background:#fef9c3;color:#a16207}.pa-pill-f{background:#fee2e2;color:#b91c1c}.pa-pill-r{background:#f1f5f9;color:#475569}',
      '.pa-v{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600}',
      '.pa-v-ok{color:#15803d}.pa-v-rev{color:#a16207}.pa-v-fail{color:#b91c1c}.pa-v-na{color:#94a3b8}',
      '.pa-view-btn{border:none;background:#065f46;color:#fff;padding:6px 13px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap}',
      '.pa-view-btn:hover{background:#054f3b}',
      '.pa-footer{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-top:1px solid var(--border,#e2e8f0);flex-wrap:wrap;gap:10px}',
      '.pa-count{font-size:12px;color:var(--text-secondary,#64748b)}',
      '.pa-pager{display:flex;gap:6px;align-items:center}',
      '.pa-page-btn{min-width:32px;height:32px;padding:0 9px;border:1px solid var(--border,#e2e8f0);background:#fff;border-radius:8px;font-size:12px;font-weight:600;color:var(--text,#1e293b);cursor:pointer;font-family:inherit}',
      '.pa-page-btn.on{background:#065f46;color:#fff;border-color:#065f46}',
      '.pa-page-btn:disabled{opacity:.4;cursor:not-allowed}',
      '.pa-overlay{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:12000;opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}',
      '.pa-overlay.open{opacity:1;visibility:visible}',
      '.pa-drawer{position:fixed;top:0;right:-520px;width:520px;max-width:100vw;height:100%;background:linear-gradient(135deg,#14472F,#0d3018);color:#fff;z-index:12001;box-shadow:-8px 0 30px rgba(8,30,16,.55);transition:right .3s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column}',
      '.pa-drawer.open{right:0}',
      '.pa-drawer-x{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:15px;z-index:5;transition:background .2s}',
      '.pa-drawer-x:hover{background:rgba(255,255,255,.16)}',
      '.pa-drawer-scroll{flex:1;overflow-y:auto;padding:18px}',
      '.pa-drawer-scroll::-webkit-scrollbar{width:5px}',
      '.pa-drawer-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:8px}',
      '.pa-drawer-head{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:16px;margin-bottom:14px}',
      '.pa-drawer-title{font-size:16px;font-weight:800;color:#fff}',
      '.pa-drawer-sub{font-size:12px;color:rgba(255,255,255,.65);margin-top:3px}',
      '.pa-section{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:16px;margin-bottom:14px}',
      '.pa-section h3{margin:0 0 12px;font-size:13px;font-weight:700;color:#F2B233;display:flex;align-items:center;gap:8px}',
      '.pa-info{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:13px;gap:12px}',
      '.pa-info:last-child{border-bottom:none}',
      '.pa-info-l{color:rgba(255,255,255,.8)}',
      '.pa-info-r{font-weight:600;color:#fff;text-align:right}',
      '.pa-tl{position:relative;padding-left:22px;margin-left:6px}',
      '.pa-tl-item{position:relative;padding:0 0 18px 0}',
      '.pa-tl-item:last-child{padding-bottom:0}',
      '.pa-tl-item::before{content:"";position:absolute;left:-22px;top:4px;width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.25);border:2px solid #14472F;box-shadow:0 0 0 2px rgba(255,255,255,.20)}',
      '.pa-tl-item.done::before{background:#10b981;box-shadow:0 0 0 2px #10b981}',
      '.pa-tl-item.cur::before{background:#F2B233;box-shadow:0 0 0 2px #F2B233}',
      '.pa-tl-item.fail::before{background:#ef4444;box-shadow:0 0 0 2px #ef4444}',
      '.pa-tl-label{font-size:13px;font-weight:600;color:#fff}',
      '.pa-tl-time{font-size:11px;color:rgba(255,255,255,.6);margin-top:2px}',
      '.pa-actions{display:flex;gap:8px;flex-wrap:wrap;padding:0 18px 18px}',
      '.pa-act{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;padding:9px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all .2s}',
      '.pa-act:hover{border-color:#F2B233;color:#F2B233}',
      '.pa-act-primary{border:none;background:#F2B233;color:#14472F}',
      '.pa-act-primary:hover{background:#e0a820;color:#14472F}',
      '.pa-act-danger{border-color:rgba(239,68,68,.5);color:#fca5a5}',
      '.pa-act-danger:hover{background:rgba(239,68,68,.15);border-color:#ef4444;color:#fecaca}',
      '.pa-empty{text-align:center;padding:50px 20px;color:var(--text-secondary,#64748b);font-size:13px}',
      '.pa-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
      '.pa-detail-item{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:8px 10px}',
      '.pa-detail-label{font-size:10px;font-weight:600;color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.3px}',
      '.pa-detail-val{font-size:13px;font-weight:600;color:#fff;margin-top:2px}',
      '.pa-timeline{position:relative;padding-left:20px}',
      '.pa-timeline-item{position:relative;padding:8px 0 8px 16px;font-size:12px;color:#64748b}',
      '.pa-timeline-item::before{content:"";position:absolute;left:-4px;top:12px;width:8px;height:8px;border-radius:50%;background:#e2e8f0;border:2px solid #fff}',
      '.pa-timeline-item.active::before{background:#22c55e}',
      '.pa-timeline-item.done::before{background:#065f46}',
      '@media(max-width:1100px){.pa-kpis{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}.pa-row{grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}.pa-insights{grid-template-columns:repeat(auto-fit,minmax(130px,1fr))}}',
      '@media(max-width:640px){.pa-kpis{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}.pa-insights{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}.pa-drawer{right:-100vw;width:100vw;max-width:100vw}.pa-drawer.open{right:0}.pa-search{min-width:0}}'
    ].join('\n');
    var s = document.createElement('style');
    s.id = 'pa-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---- page rendering ---- */
  function renderPage() {
    injectCSS();
    var root = document.getElementById('paRoot');
    if (!root) return;
    ensureTransactions();
    var k = kpiData();
    var methods = methodTotals();
    var ins = insights();
    var per = state.period === 'all' ? 'daily' : state.period;
    var series = revenueSeries(per);
    var list = filteredTransactions();
    var pages = totalPages();
    var items = pageItems();

    var seg = function (v, label) {
      return '<button class="' + (state.period === v ? 'on' : '') + '" data-period="' + v + '">' + label + '</button>';
    };

    var maxRev = 0;
    series.forEach(function (d) { if (d.revenue > maxRev) maxRev = d.revenue; });
    if (maxRev <= 0) maxRev = 1;
    var chartCols = series.map(function (d) {
      var h = Math.max(4, Math.round((d.revenue / maxRev) * 100));
      return '<div class="pa-chart-col">' +
        '<div class="pa-val-tip">' + fmtMoneyShort(d.revenue) + '</div>' +
        '<div class="pa-chart-bars"><div class="pa-bar" style="height:' + h + '%" title="' + d.revenue + '"></div></div>' +
        '<div class="pa-chart-label">' + d.label + '</div>' +
      '</div>';
    }).join('');

    var donut = donutHtml(methods);
    var insHtml = [
      ['Best Method', ins.bestMethod, 'fa-trophy'],
      ['Highest Revenue Day', ins.bestDay, 'fa-calendar-day'],
      ['Avg Transaction', money(ins.avgTx), 'fa-wallet'],
      ['Success Rate', ins.successRate.toFixed(1) + '%', 'fa-check-circle'],
      ['Refund Rate', ins.refundRate.toFixed(1) + '%', 'fa-undo'],
      ['Failed Rate', ins.failedRate.toFixed(1) + '%', 'fa-times-circle']
    ].map(function (i) {
      return '<div class="pa-ins"><div class="pa-ins-label">' + i[1] + '</div>' +
        '<div class="pa-ins-val" style="font-size:12px">' + i[0] + '</div>' +
        '<div class="pa-ins-val" style="color:#065f46;margin-top:2px">' + i[2] + '</div></div>';
    }).join('');
    insHtml = '<div class="pa-insights">' + ['Best Method', 'Highest Revenue Day', 'Avg Transaction Value', 'Payment Success Rate', 'Refund Rate', 'Failed Rate'].map(function (label, idx) {
      var val = [ins.bestMethod, ins.bestDay, money(ins.avgTx), ins.successRate.toFixed(1) + '%', ins.refundRate.toFixed(1) + '%', ins.failedRate.toFixed(1) + '%'][idx];
      var ico = ['fa-trophy', 'fa-calendar-day', 'fa-wallet', 'fa-check-circle', 'fa-undo', 'fa-times-circle'][idx];
      return '<div class="pa-ins"><div class="pa-ins-label">' + label + '</div><div class="pa-ins-val"><i class="fas ' + ico + '" style="color:#065f46;font-size:13px;margin-right:6px"></i>' + val + '</div></div>';
    }).join('') + '</div>';

    var methodOpts = '<option value="all">All Methods</option>' + state.knownMethods.map(function (m) {
      return '<option value="' + esc(m) + '"' + (state.method === m ? ' selected' : '') + '>' + esc(m) + '</option>';
    }).join('');

    var statusOpts = ['all', 'successful', 'pending', 'failed', 'refunded'].map(function (s) {
      var lbl = s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1);
      return '<option value="' + s + '"' + (state.status === s ? ' selected' : '') + '>' + lbl + '</option>';
    }).join('');

    var periodOpts = ['all', 'today', 'week', 'month', 'year'].map(function (p) {
      var lbl = { all: 'Any Time', today: 'Today', week: 'Last 7 Days', month: 'Last 30 Days', year: 'This Year' }[p];
      return '<option value="' + p + '"' + (state.period === p ? ' selected' : '') + '>' + lbl + '</option>';
    }).join('');

    var amtOpts = ['all', 'lt500', '500to2000', '2000to5000', 'gt5000'].map(function (a) {
      var lbl = { all: 'Any Amount', lt500: '< ' + state.currency + '500', '500to2000': state.currency + '500 - ' + state.currency + '2,000', '2000to5000': state.currency + '2,000 - ' + state.currency + '5,000', gt5000: '> ' + state.currency + '5,000' }[a];
      return '<option value="' + a + '"' + (state.amount === a ? ' selected' : '') + '>' + lbl + '</option>';
    }).join('');

    var rows = items.map(rowHtml).join('');
    if (!items.length) rows = '<tr><td colspan="8"><div class="pa-empty">No transactions found matching your filters</div></td></tr>';

    var pageBtns = [];
    for (var p = 1; p <= pages; p++) {
      pageBtns.push('<button class="pa-page-btn' + (p === state.page ? ' on' : '') + '" data-page="' + p + '">' + p + '</button>');
    }

    root.innerHTML =
      '<div class="pa-page">' +
        '<div class="pa-kpis">' +
          kpi('fa-wallet', '#065f46', 'Total Revenue', money(k.totalRevenue), 'successful payments') +
          kpi('fa-credit-card', '#10b981', 'Total Payments', fmtNum(k.totalPayments), 'all transactions') +
          kpi('fa-check-circle', '#22c55e', 'Successful', fmtNum(k.successful), k.successRate.toFixed(1) + '% success rate') +
          kpi('fa-hourglass-half', '#f59e0b', 'Pending', fmtNum(k.pending), 'awaiting confirmation') +
        '</div>' +
        '<div class="pa-kpis">' +
          kpi('fa-times-circle', '#ef4444', 'Failed', fmtNum(k.failed), 'declined transactions') +
          kpi('fa-undo', '#8b5cf6', 'Refunded Amount', money(k.refundedAmt), fmtNum(k.refundCount) + ' refunds issued') +
          kpi('fa-percent', '#0891b2', 'Success Rate', k.successRate.toFixed(1) + '%', 'successful vs attempted') +
          kpi('fa-exclamation-triangle', '#f59e0b', 'Pending Amount', money(pendingAmount()), 'in pending payments') +
        '</div>' +
        '<div class="pa-row">' +
          '<div class="pa-card">' +
            '<h3><span><span style="margin-right:6px">' + (COUNTRY_FLAGS[state.country] || '') + '</span>Payment Revenue Overview</span>' +
              '<span class="pa-seg">' + seg('daily', 'Daily') + seg('weekly', 'Weekly') + seg('monthly', 'Monthly') + seg('yearly', 'Yearly') + '</span></h3>' +
            '<div class="pa-chart">' + chartCols + '</div>' +
          '</div>' +
          '<div class="pa-card">' +
            '<h3><span>Payments by Method</span><span style="font-size:12px;color:var(--text-secondary,#64748b);font-weight:500">' + state.country + '</span></h3>' +
            '<div class="pa-donut-wrap">' + donut + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="pa-card" style="margin-bottom:14px">' +
          '<h3>Payment Insights</h3>' +
          insHtml +
        '</div>' +
        '<div class="pa-card" style="padding:0;overflow:hidden">' +
          '<div style="padding:16px 16px 0">' +
            '<h3 style="margin:0 0 12px">Transactions</h3>' +
            '<div class="pa-tools">' +
              '<input class="pa-field pa-search" id="paSearch" placeholder="Search by txn ID, order ID or customer..." value="' + esc(state.search) + '">' +
              '<select class="pa-field" id="paStatus">' + statusOpts + '</select>' +
              '<select class="pa-field" id="paMethod">' + methodOpts + '</select>' +
              '<select class="pa-field" id="paPeriod">' + periodOpts + '</select>' +
              '<select class="pa-field" id="paAmount">' + amtOpts + '</select>' +
              '<button class="pa-btn" id="paReset"><i class="fas fa-redo"></i> Reset</button>' +
            '</div>' +
          '</div>' +
          '<div class="pa-table-scroll">' +
            '<table class="pa-table">' +
              '<thead><tr>' +
                '<th>Transaction ID</th><th>Order ID</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th>' +
              '</tr></thead>' +
              '<tbody>' + rows + '</tbody>' +
            '</table>' +
          '</div>' +
          '<div class="pa-footer">' +
            '<span class="pa-count">Showing ' + items.length + ' of ' + list.length + ' transactions</span>' +
            '<div class="pa-pager">' +
              '<button class="pa-page-btn" data-page="prev" ' + (state.page <= 1 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i></button>' +
              pageBtns.join('') +
              '<button class="pa-page-btn" data-page="next" ' + (state.page >= pages ? 'disabled' : '') + '><i class="fas fa-chevron-right"></i></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    wireEvents();
  }

  function pendingAmount() {
    var total = 0;
    state.transactions.forEach(function (t) { if (t.status === 'pending') total += t.amount; });
    return total;
  }

  function kpi(icon, color, label, val, sub) {
    return '<div class="pa-kpi">' +
      '<div class="pa-kpi-ico" style="background:' + color + '14;color:' + color + '"><i class="fas ' + icon + '"></i></div>' +
      '<div><div class="pa-kpi-label">' + label + '</div><div class="pa-kpi-val">' + val + '</div><div class="pa-kpi-sub">' + sub + '</div></div>' +
    '</div>';
  }

  function donutHtml(methods) {
    var keys = Object.keys(methods);
    var totalCount = state.transactions.length || 1;
    var colors = ['#065f46', '#10b981', '#34d399', '#a7f3d0', '#f59e0b', '#8b5cf6', '#0891b2', '#ef4444'];
    var acc = 0;
    var conic = keys.map(function (m, i) {
      var pct = (methods[m].count / totalCount) * 100;
      var from = acc;
      acc += pct;
      return colors[i % colors.length] + ' ' + from + '% ' + acc + '%';
    }).join(', ');
    if (!keys.length) conic = '#e2e8f0 0 100%';
    var legend = keys.map(function (m, i) {
      var pct = (methods[m].count / totalCount) * 100;
      return '<div class="pa-leg"><span class="pa-leg-l"><span class="pa-leg-dot" style="background:' + colors[i % colors.length] + '"></span>' + esc(m) + '</span><span class="pa-leg-pct">' + fmtNum(methods[m].count) + ' \u00B7 ' + pct.toFixed(1) + '%</span></div>';
    }).join('');
    return '<div class="pa-donut" style="background:conic-gradient(' + conic + ')">' +
      '<div class="pa-donut-inner"><div class="pa-donut-total">' + fmtNum(state.transactions.length) + '</div><div class="pa-donut-sub">payments</div></div>' +
    '</div><div class="pa-legend">' + legend + '</div>';
  }

  function pill(status) {
    var cls = { successful: 'pa-pill-s', pending: 'pa-pill-p', failed: 'pa-pill-f', refunded: 'pa-pill-r' }[status] || 'pa-pill-r';
    return '<span class="pa-pill ' + cls + '">' + status + '</span>';
  }

  function verificationHtml(v) {
    var map = { 'Verified': ['fa-check-circle', 'pa-v-ok'], 'Under Review': ['fa-clock', 'pa-v-rev'], 'Failed': ['fa-times-circle', 'pa-v-fail'], 'N/A': ['fa-minus', 'pa-v-na'] };
    var m = map[v] || map['N/A'];
    return '<span class="pa-v ' + m[1] + '"><i class="fas ' + m[0] + '"></i>' + v + '</span>';
  }

  function rowHtml(t) {
    var methodIcon = 'fa-credit-card';
    if (t.method === 'UPI' || t.method === 'BHIM' || t.method === 'PayNow') methodIcon = 'fa-mobile-alt';
    if (t.method === 'COD') methodIcon = 'fa-money-bill-wave';
    if (t.method === 'PayPal' || t.method === 'Google Pay' || t.method === 'Apple Pay' || t.method === 'GrabPay' || t.method === 'PhonePe' || t.method === 'Paytm') methodIcon = 'fa-mobile-alt';
    if (t.method === 'Bank Transfer' || t.method === 'Netbanking') methodIcon = 'fa-university';
    var currSym = { INR: '\u20B9', USD: '$', AED: 'AED ', SGD: 'S$' }[t.currency] || '';
    return '<tr>' +
      '<td style="font-weight:700;color:#065f46">' + esc(t.id) + '</td>' +
      '<td>' + esc(t.orderId) + '</td>' +
      '<td>' + esc(t.customer) + '</td>' +
      '<td style="font-weight:700">' + currSym + Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: t.currency === 'INR' ? 0 : 2, maximumFractionDigits: t.currency === 'INR' ? 0 : 2 }) + '</td>' +
      '<td><i class="fas ' + methodIcon + '" style="color:#64748b;margin-right:6px"></i>' + esc(t.method) + '</td>' +
      '<td>' + pill(t.status) + '</td>' +
      '<td style="white-space:nowrap">' + fmtDateTime(t.date) + '</td>' +
      '<td><button class="pa-view-btn" onclick="PaymentAnalytics.openPayment(\'' + esc(t.id).replace(/'/g, '') + '\')">View</button></td>' +
    '</tr>';
  }

  function wireEvents() {
    var s = document.getElementById('paSearch');
    var st = document.getElementById('paStatus');
    var m = document.getElementById('paMethod');
    var pe = document.getElementById('paPeriod');
    var am = document.getElementById('paAmount');
    var rs = document.getElementById('paReset');
    if (s) s.addEventListener('input', function () { var pos = this.selectionStart; state.search = this.value; state.page = 1; renderPage(); var ns = document.getElementById('paSearch'); if (ns) { ns.focus(); ns.setSelectionRange(pos, pos); } });
    if (st) st.addEventListener('change', function () { state.status = this.value; state.page = 1; renderPage(); });
    if (m) m.addEventListener('change', function () { state.method = this.value; state.page = 1; renderPage(); });
    if (pe) pe.addEventListener('change', function () { state.period = this.value; state.page = 1; renderPage(); });
    if (am) am.addEventListener('change', function () {
      state.amount = this.value;
      state.amountRange = amountRange(this.value);
      state.page = 1;
      renderPage();
    });
    if (rs) rs.addEventListener('click', function () {
      state.search = ''; state.status = 'all'; state.method = 'all'; state.period = 'all'; state.amount = 'all';
      state.amountRange = [0, Infinity]; state.page = 1; renderPage();
    });
    var segs = document.querySelectorAll('#paRoot .pa-seg button[data-period]');
    for (var i = 0; i < segs.length; i++) {
      segs[i].addEventListener('click', function () {
        state.period = this.getAttribute('data-period');
        renderPage();
      });
    }
    var pageBtns = document.querySelectorAll('#paRoot .pa-page-btn');
    for (var j = 0; j < pageBtns.length; j++) {
      pageBtns[j].addEventListener('click', function () {
        var v = this.getAttribute('data-page');
        if (v === 'prev') { if (state.page > 1) state.page--; }
        else if (v === 'next') { if (state.page < totalPages()) state.page++; }
        else state.page = parseInt(v, 10);
        renderPage();
      });
    }
  }

  function amountRange(v) {
    var c = state.currency;
    var base = { lt500: [0, 500], '500to2000': [500, 2000], '2000to5000': [2000, 5000], gt5000: [5000, Infinity] }[v];
    return base || [0, Infinity];
  }

  /* ---- drawer ---- */
  function openDrawer(id) {
    var t = null;
    state.transactions.forEach(function (x) { if (x.id === id) t = x; });
    if (!t) return;
    state.activeTx = id;
    renderDrawer(t);
  }

  function timelineFor(t) {
    var isFailed = t.status === 'failed';
    var isRefunded = t.status === 'refunded';
    var successIdx = t.status === 'successful' || isRefunded ? 6 : (t.status === 'pending' ? 4 : 3);
    var steps = [
      { label: 'Order Created', time: t.date },
      { label: 'Payment Initiated', time: t.date },
      { label: 'Payment Processing', time: t.date },
      { label: 'Payment Successful', time: t.date },
      { label: 'Payment Verified', time: t.date },
      { label: 'Order Confirmed', time: t.date },
      { label: 'Order Delivered', time: t.date }
    ];
    return steps.map(function (s, idx) {
      var cls = 'pa-tl-item';
      if (isFailed) cls += idx < 3 ? ' done' : (idx === 3 ? ' fail' : '');
      else if (isRefunded) cls += idx <= successIdx ? ' done' : (idx === 5 ? ' cur' : '');
      else if (idx < successIdx) cls += ' done';
      else if (idx === successIdx) cls += ' cur';
      return '<div class="' + cls + '"><div class="pa-tl-label">' + s.label + '</div><div class="pa-tl-time">' + fmtDateTime(t.date) + '</div></div>';
    }).join('');
  }

  function renderDrawer(t) {
    injectCSS();
    var refunded = t.status === 'refunded';
    var verified = t.verification === 'Verified';
    var riskLevel = 'Low';
    if (t.status === 'failed') riskLevel = 'High';
    else if (t.amount > 5000) riskLevel = 'Medium';
    var currSym = { INR: '\u20B9', USD: '$', AED: 'AED ', SGD: 'S$' }[t.currency] || '';
    var body =
      '<div class="pa-drawer-head">' +
        '<div class="pa-drawer-title">' + esc(t.id) + '</div>' +
        '<div class="pa-drawer-sub">Order ' + esc(t.orderId) + ' \u00B7 ' + fmtDateTime(t.date) + '</div>' +
        '<div style="margin-top:10px">' + pill(t.status) + ' \u00A0 ' + verificationHtml(t.verification) + '</div>' +
      '</div>' +

      '<div class="pa-section">' +
        '<h3><i class="fas fa-receipt"></i> Transaction Details</h3>' +
        '<div class="pa-detail-grid">' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Transaction ID</div><div class="pa-detail-val">' + esc(t.id) + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Order ID</div><div class="pa-detail-val">' + esc(t.orderId) + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Transaction Ref</div><div class="pa-detail-val">' + esc(t.transactionRef || '') + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Payment Date</div><div class="pa-detail-val">' + fmtDateTime(t.paymentDate || t.date) + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Payment Time</div><div class="pa-detail-val">' + esc(t.paymentTime || '') + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Amount</div><div class="pa-detail-val">' + currSym + Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: t.currency === 'INR' ? 0 : 2, maximumFractionDigits: t.currency === 'INR' ? 0 : 2 }) + ' ' + esc(t.currency || '') + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Payment Method</div><div class="pa-detail-val">' + esc(t.method) + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Platform / Gateway</div><div class="pa-detail-val">' + esc(t.platform) + '</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="pa-section">' +
        '<h3><i class="fas fa-shield-alt"></i> Verification</h3>' +
        '<div class="pa-detail-grid">' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Verification Status</div><div class="pa-detail-val">' + verificationHtml(t.verification) + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Verified By</div><div class="pa-detail-val">' + esc(t.verifiedBy || 'â€”') + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Verification Date</div><div class="pa-detail-val">' + fmtDateTime(t.verificationDate) + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Risk Level</div><div class="pa-detail-val" style="color:' + (riskLevel === 'High' ? '#b91c1c' : riskLevel === 'Medium' ? '#a16207' : '#15803d') + '">' + riskLevel + '</div></div>' +
        '</div>' +
      '</div>' +

      (refunded ? '<div class="pa-section">' +
        '<h3><i class="fas fa-undo"></i> Refund Information</h3>' +
        '<div class="pa-detail-grid">' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Refund Status</div><div class="pa-detail-val" style="color:#b91c1c">' + esc(t.refundStatus || 'None') + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Refund Amount</div><div class="pa-detail-val">' + currSym + Number(t.refundAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Refund Date</div><div class="pa-detail-val">' + fmtDateTime(t.date) + '</div></div>' +
        '</div>' +
      '</div>' : '') +

      '<div class="pa-section">' +
        '<h3><i class="fas fa-user"></i> Customer Details</h3>' +
        '<div class="pa-detail-grid">' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Customer Name</div><div class="pa-detail-val">' + esc(t.customer) + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Phone</div><div class="pa-detail-val">' + esc(t.phone) + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Email</div><div class="pa-detail-val">' + esc(t.email) + '</div></div>' +
          '<div class="pa-detail-item"><div class="pa-detail-label">Address</div><div class="pa-detail-val">' + esc(t.address) + '</div></div>' +
        '</div>' +
      '</div>' +

      '<div class="pa-section">' +
        '<h3><i class="fas fa-history"></i> Order Timeline</h3>' +
        '<div class="pa-tl">' + timelineFor(t) + '</div>' +
      '</div>';

    var drawer = document.getElementById('paDrawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'paDrawer';
      drawer.className = 'pa-drawer';
      drawer.innerHTML = '<button class="pa-drawer-x" onclick="PaymentAnalytics.closePayment()"><i class="fas fa-times"></i></button><div class="pa-drawer-scroll"></div><div class="pa-actions"></div>';
      document.body.appendChild(drawer);
    }
    var overlay = document.getElementById('paOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'paOverlay';
      overlay.className = 'pa-overlay';
      overlay.addEventListener('click', function () { PaymentAnalytics.closePayment(); });
      document.body.appendChild(overlay);
    }
    drawer.querySelector('.pa-drawer-scroll').innerHTML = body;

    var actions = [];
    if (t.status === 'successful' && !verified) {
      actions.push('<button class="pa-act pa-act-primary" onclick="PaymentAnalytics.verifyPayment(\'' + esc(t.id).replace(/'/g, '') + '\')"><i class="fas fa-check"></i> Verify Payment</button>');
    }
    if (t.verification === 'Under Review') {
      actions.push('<button class="pa-act" onclick="PaymentAnalytics.markReviewed(\'' + esc(t.id).replace(/'/g, '') + '\')"><i class="fas fa-clipboard-check"></i> Mark as Reviewed</button>');
    }
    actions.push('<button class="pa-act" onclick="PaymentAnalytics.viewOrder(\'' + esc(t.orderId).replace(/'/g, '') + '\')"><i class="fas fa-eye"></i> View Order</button>');
    if (t.status === 'successful') {
      actions.push('<button class="pa-act pa-act-danger" onclick="PaymentAnalytics.refund(\'' + esc(t.id).replace(/'/g, '') + '\')"><i class="fas fa-undo"></i> Refund</button>');
    }
    actions.push('<button class="pa-act" onclick="PaymentAnalytics.closePayment()"><i class="fas fa-times"></i> Close</button>');
    drawer.querySelector('.pa-actions').innerHTML = actions.join('');

    overlay.classList.add('open');
    drawer.classList.add('open');
  }

  function info(l, r) {
    return '<div class="pa-info"><span class="pa-info-l">' + l + '</span><span class="pa-info-r">' + r + '</span></div>';
  }

  function updateTx(id, patch) {
    var i = -1;
    state.transactions.forEach(function (t, idx) { if (t.id === id) i = idx; });
    if (i === -1) return null;
    var t = state.transactions[i];
    for (var k in patch) t[k] = patch[k];
    state.transactions[i] = t;
    try { localStorage.setItem('vpnexues_payments_' + state.country, JSON.stringify(state.transactions)); } catch (e) {}
    return t;
  }

  var PaymentAnalytics = {
    configure: function (opts) {
      opts = opts || {};
      state.country = opts.country || 'India';
      var cc = COUNTRY_CURRENCY[state.country] || COUNTRY_CURRENCY.India;
      state.currency = opts.currency || cc.currency;
      state.currencyLabel = opts.currencyLabel || cc.currencyLabel;
      state.decimals = opts.decimals === 0 ? 0 : (opts.decimals || cc.decimals);
      state.transactions = [];
      state.knownMethods = methodsForCountry();
      state.orders = getOrders();
      buildTransactions();
      try { localStorage.setItem('vpnexues_payments_' + state.country, JSON.stringify(state.transactions)); } catch (e) {}
    },

    render: function () {
      renderPage();
      if (state.activeTx) {
        var t = null;
        state.transactions.forEach(function (x) { if (x.id === state.activeTx) t = x; });
        if (t) renderDrawer(t);
      }
    },

    openPayment: function (id) {
      openDrawer(id);
    },

    closePayment: function () {
      var drawer = document.getElementById('paDrawer');
      var overlay = document.getElementById('paOverlay');
      if (overlay) overlay.classList.remove('open');
      if (drawer) drawer.classList.remove('open');
      state.activeTx = null;
    },

    verifyPayment: function (id) {
      var t = updateTx(id, { verification: 'Verified', verifiedBy: 'Admin', verificationDate: new Date().toISOString() });
      if (!t) return;
      if (typeof window.showToast === 'function') window.showToast(t.id + ' verified successfully');
      renderDrawer(t);
    },

    markReviewed: function (id) {
      var t = updateTx(id, { verification: 'Verified', verifiedBy: 'Admin', verificationDate: new Date().toISOString() });
      if (!t) return;
      if (typeof window.showToast === 'function') window.showToast(t.id + ' marked as reviewed');
      renderDrawer(t);
    },

    viewOrder: function (orderId) {
      var fn = window.viewOrderDetails || window.openOrderDetails || window.OrderDetailsViewer;
      if (typeof fn === 'function') {
        fn(orderId);
      } else if (typeof window.OrderManager === 'object' && window.OrderManager && window.OrderManager.openOrder) {
        window.OrderManager.openOrder(orderId);
      } else {
        var orders = getOrders();
        var o = null;
        orders.forEach(function (x) { if (x.id === orderId) o = x; });
        if (o && typeof window.showToast === 'function') window.showToast('Order ' + orderId + ' opened (' + (o.items || []).length + ' items)');
      }
    },

    refund: function (id) {
      var t = null;
      state.transactions.forEach(function (x) { if (x.id === id) t = x; });
      if (!t) return;
      if (!confirm('Refund ' + money(t.amount) + ' for transaction ' + t.id + '?')) return;
      t = updateTx(id, { status: 'refunded', verification: 'N/A', refundStatus: 'Refunded', refundAmount: t.amount });
      if (typeof window.showToast === 'function') window.showToast(t.id + ' refunded (' + money(t.amount) + ')');
      renderPage();
      renderDrawer(t);
    },

    getTransactions: function () {
      ensureTransactions();
      return state.transactions;
    }
  };

  window.PaymentAnalytics = PaymentAnalytics;

  /* =====================================================================
   * PaymentManager - super admin Payment Analytics page bridge (restored).
   * Provides renderPaymentsTable, drawCharts, setStatusFilter, setSearch,
   * setMethodFilter, setCountryFilter, resetFilters, setSortBy,
   * exportCSV, printPayments, closePaymentDetail, openDetail.
   * Aggregates all 4 countries: India, UAE, US, Singapore.
   * ===================================================================== */
  var PM = {
    _state: {
      transactions: [],
      search: '',
      status: 'all',
      method: 'all',
      country: 'all',
      sortBy: 'date',
      sortDir: 'desc',
      page: 1,
      perPage: 10
    },

    _currency: { India: '\u20B9', UAE: 'AED ', US: '$', Singapore: 'S$' },

    _seed: function () {
      var names = {
        India: ['Rahul Sharma', 'Priya Patel', 'Ravi Kumar', 'Ananya Singh', 'Vikram Singh', 'Neha Gupta', 'Amit Verma', 'Sunita Iyer'],
        UAE: ['Ahmed Al-Rashid', 'Fatima Al Mansoori', 'Omar Hassan', 'Layla Khalid', 'Yusuf Khan', 'Mariam Saeed', 'Khalid Nasser', 'Huda Ibrahim'],
        US: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'James Wilson', 'Jessica Lee', 'David Martinez', 'Ashley Anderson'],
        Singapore: ['Wei Lin Tan', 'Kavita Menon', 'Marcus Lee', 'Priya Nair', 'Jonathan Koh', 'Rachel Sim', 'Darren Ong', 'Michelle Chua']
      };
      var methods = {
        India: ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Card', 'Netbanking', 'COD'],
        US: ['Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Bank Transfer', 'COD'],
        UAE: ['Card', 'Apple Pay', 'Google Pay', 'Bank Transfer', 'COD'],
        Singapore: ['PayNow', 'Card', 'GrabPay', 'Google Pay', 'Apple Pay', 'Bank Transfer']
      };
      var statuses = ['successful', 'successful', 'successful', 'successful', 'pending', 'pending', 'failed', 'refunded'];
      var platforms = ['Web', 'Mobile App', 'POS', 'API'];
      var all = [];
      var countries = ['India', 'UAE', 'US', 'Singapore'];
      var idCounter = 1;
      countries.forEach(function (country) {
        var list = names[country];
        var m = methods[country];
        for (var i = 0; i < list.length; i++) {
          var daysAgo = Math.floor(Math.random() * 30);
          var d = new Date();
          d.setDate(d.getDate() - daysAgo);
          d.setHours(Math.floor(Math.random() * 14) + 8);
          d.setMinutes(Math.floor(Math.random() * 60));
          all.push({
            id: 'TXN-' + String(idCounter++).padStart(4, '0'),
            orderId: 'ORD-' + String(1000 + idCounter).padStart(5, '0'),
            customer: list[i],
            email: list[i].toLowerCase().replace(/[^a-z ]/g, '').replace(/ +/g, '.') + '@email.com',
            country: country,
            method: m[i % m.length],
            platform: platforms[i % platforms.length],
            amount: Math.round((200 + Math.random() * 4800) * 100) / 100,
            status: statuses[i % statuses.length],
            verification: statuses[i % statuses.length] === 'successful' ? 'Verified' : (statuses[i % statuses.length] === 'failed' ? 'Failed' : 'Under Review'),
            date: d.toISOString()
          });
        }
      });
      PM._state.transactions = all;
    },

    _filtered: function () {
      var s = this._state;
      var list = s.transactions.slice();
      if (s.status !== 'all') {
        var st = s.status === 'success' ? 'successful' : s.status;
        list = list.filter(function (t) { return t.status === st; });
      }
      if (s.method !== 'all') {
        var sm = s.method.toLowerCase();
        list = list.filter(function (t) { return t.method.toLowerCase().indexOf(sm) !== -1; });
      }
      if (s.country !== 'all') {
        var sc = s.country.toLowerCase();
        list = list.filter(function (t) { return t.country.toLowerCase() === sc || t.country.toLowerCase().indexOf(sc) !== -1; });
      }
      if (s.search) {
        var q = s.search.toLowerCase();
        list = list.filter(function (t) {
          return (t.id + ' ' + t.customer + ' ' + t.email + ' ' + t.method + ' ' + t.country + ' ' + t.orderId).toLowerCase().indexOf(q) !== -1;
        });
      }
      var dir = s.sortDir === 'asc' ? 1 : -1;
      list.sort(function (a, b) {
        var av, bv;
        if (s.sortBy === 'date') { av = a.date; bv = b.date; }
        else if (s.sortBy === 'amount') { av = a.amount; bv = b.amount; }
        else if (s.sortBy === 'customer') { av = (a.customer || '').toLowerCase(); bv = (b.customer || '').toLowerCase(); }
        else if (s.sortBy === 'status') { av = a.status; bv = b.status; }
        else { av = a.date; bv = b.date; }
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
      return list;
    },

    _money: function (n) {
      var c = this._state.transactions[0] ? (this._currency[this._state.transactions[0].country] || '$') : '$';
      return c + Number(n || 0).toFixed(2);
    },

    _fmtDate: function (iso) {
      try {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) { return iso; }
    },

    _pill: function (status) {
      var colors = { successful: ['#dcfce7', '#15803d'], pending: ['#fef9c3', '#a16207'], failed: ['#fee2e2', '#b91c1c'], refunded: ['#f1f5f9', '#475569'] };
      var c = colors[status] || colors.failed;
      return '<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:' + c[0] + ';color:' + c[1] + '">' + status + '</span>';
    },

    _countUp: function (el, target, fmt) {
      if (!el) return;
      if (typeof requestAnimationFrame !== 'function') { el.textContent = fmt(target); return; }
      try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(target); return; }
      } catch (e) {}
      if (el._payRaf) { try { cancelAnimationFrame(el._payRaf); } catch (e) {} el._payRaf = null; }
      var dur = 900, t0 = null;
      el.textContent = fmt(0);
      el._payRaf = requestAnimationFrame(function frame(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased);
        if (p < 1) el._payRaf = requestAnimationFrame(frame);
        else el._payRaf = null;
      });
    },

    _updateKPIs: function () {
      var self = this;
      var txns = this._state.transactions;
      var total = 0, successful = 0, pending = 0, failed = 0, refundAmt = 0;
      txns.forEach(function (t) {
        total += t.amount;
        if (t.status === 'successful') successful += t.amount;
        if (t.status === 'pending') pending += t.amount;
        if (t.status === 'failed') failed += t.amount;
        if (t.status === 'refunded') refundAmt += t.amount;
      });
      var cur = this._currency[txns[0] ? txns[0].country : 'US'] || '$';
      var fmt = function (n) { return cur + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
      var el;
      el = document.getElementById('payKpiTotal'); self._countUp(el, total, fmt);
      el = document.getElementById('payKpiSuccess'); self._countUp(el, successful, fmt);
      el = document.getElementById('payKpiPending'); self._countUp(el, pending, fmt);
      el = document.getElementById('payKpiFailed'); self._countUp(el, failed + refundAmt, fmt);
    },

    _updateTabCounts: function () {
      var txns = this._state.transactions;
      var counts = { all: txns.length, success: 0, pending: 0, failed: 0, refunded: 0 };
      txns.forEach(function (t) {
        if (t.status === 'successful') counts.success++;
        else if (counts[t.status] !== undefined) counts[t.status]++;
      });
      document.querySelectorAll('.payment-filter-tab').forEach(function (tab) {
        var st = tab.getAttribute('data-status');
        var span = tab.querySelector('.tab-count');
        if (span && counts[st] !== undefined) span.textContent = counts[st];
      });
    },

    renderPaymentsTable: function (opts) {
      opts = opts || {};
      injectCSS();
      if (!this._state.transactions.length) this._seed();
      var tbody = document.getElementById(opts.tbodyId || 'paymentsTableBody');
      var paginationEl = document.getElementById(opts.paginationId || 'paymentsPagination');
      var summaryEl = document.getElementById(opts.summaryId || 'paymentsSummary');
      var filtered = this._filtered();
      var totalPages = Math.max(1, Math.ceil(filtered.length / this._state.perPage));
      if (this._state.page > totalPages) this._state.page = totalPages;
      var start = (this._state.page - 1) * this._state.perPage;
      var rows = filtered.slice(start, start + this._state.perPage);

      if (summaryEl) {
        summaryEl.textContent = filtered.length + ' payment' + (filtered.length !== 1 ? 's' : '') + ' found';
      }

      this._updateKPIs();
      this._updateTabCounts();

      if (!tbody) return;
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-secondary)">No payments found</td></tr>';
      } else {
        var self = this;
        tbody.innerHTML = rows.map(function (t) {
          var methodIcon = 'fa-credit-card';
          if (t.method === 'UPI' || t.method === 'BHIM' || t.method === 'PayNow') methodIcon = 'fa-mobile-alt';
          if (t.method === 'COD') methodIcon = 'fa-money-bill-wave';
          if (t.method === 'PayPal' || t.method === 'Google Pay' || t.method === 'Apple Pay' || t.method === 'GrabPay' || t.method === 'PhonePe' || t.method === 'Paytm') methodIcon = 'fa-mobile-alt';
          if (t.method === 'Bank Transfer' || t.method === 'Netbanking') methodIcon = 'fa-university';
          return '<tr>' +
            '<td style="font-weight:600;color:var(--accent)">' + t.id + '</td>' +
            '<td>' + t.customer + '<div style="font-size:11px;color:var(--text-secondary)">' + t.email + '</div></td>' +
            '<td>' + t.country + '</td>' +
            '<td><i class="fas ' + methodIcon + '" style="color:var(--text-secondary);margin-right:4px"></i>' + t.method + '</td>' +
            '<td style="font-weight:700">' + self._money(t.amount) + '</td>' +
            '<td>' + self._pill(t.status) + '</td>' +
            '<td style="font-size:12px;color:var(--text-secondary);white-space:nowrap">' + self._fmtDate(t.date) + '</td>' +
            '<td><button class="action-btn view" title="View" onclick="PaymentManager.openDetail(\'' + t.id + '\')"><i class="fas fa-eye"></i></button></td>' +
          '</tr>';
        }).join('');
      }

      /* Slide-up reveal like Activity Logs: stagger + IntersectionObserver */
      var payRows = tbody.querySelectorAll('tr');
      payRows.forEach(function (r, i) {
        r.classList.remove('visible');
        r.style.animationDelay = (i * 0.06) + 's';
      });
      try {
        if (PM._rowObserver) PM._rowObserver.disconnect();
        PM._rowObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.add('visible'); PM._rowObserver.unobserve(en.target); }
          });
        }, { threshold: 0.05 });
        payRows.forEach(function (r) { PM._rowObserver.observe(r); });
      } catch (e) {
        payRows.forEach(function (r) { r.classList.add('visible'); });
      }

      if (paginationEl) {
        var page = this._state.page;
        var html = '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="PaymentManager._goPage(' + (page - 1) + ')"' + (page <= 1 ? ' disabled' : '') + '>Prev</button>';
        for (var i = 1; i <= totalPages; i++) {
          html += '<button class="btn ' + (i === page ? 'btn-primary' : 'btn-secondary') + '" style="padding:6px 12px;font-size:12px" onclick="PaymentManager._goPage(' + i + ')">' + i + '</button>';
        }
        html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="PaymentManager._goPage(' + (page + 1) + ')"' + (page >= totalPages ? ' disabled' : '') + '>Next</button>';
        paginationEl.innerHTML = html;
      }
    },

    _goPage: function (p) {
      var total = Math.max(1, Math.ceil(this._filtered().length / this._state.perPage));
      if (p < 1) p = 1;
      if (p > total) p = total;
      this._state.page = p;
      this.renderPaymentsTable(this._lastOpts || {});
    },

    _lastOpts: null,

    drawCharts: function () {
      if (!this._state.transactions.length) return;
      var txns = this._state.transactions;
      this._drawCountryChart(txns);
      this._drawTrendChart(txns);
      this._drawMethodChart(txns);
      this._drawStatusChart(txns);
    },

    _easeOut: function (p) { return 1 - Math.pow(1 - p, 3); },

    _easeBack: function (p) { var c = 1.4; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },

    /* Animate a canvas chart: frame(e) redraws with eased progress 0->1 */
    _animate: function (canvas, dur, ease, frame) {
      if (!canvas) return;
      if (typeof requestAnimationFrame !== 'function') { frame(1); return; }
      try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { frame(1); return; }
      } catch (e) {}
      if (canvas._payRaf) { try { cancelAnimationFrame(canvas._payRaf); } catch (e) {} canvas._payRaf = null; }
      var t0 = null;
      canvas._payRaf = requestAnimationFrame(function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        frame(ease(p));
        if (p < 1) canvas._payRaf = requestAnimationFrame(step);
        else canvas._payRaf = null;
      });
    },

    _drawCountryChart: function (txns) {
      var canvas = document.getElementById('payCountryChart');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var w = canvas.parentElement.offsetWidth || 300;
      var h = canvas.parentElement.offsetHeight || 150;
      canvas.width = w; canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      var rev = {};
      txns.forEach(function (t) { rev[t.country] = (rev[t.country] || 0) + t.amount; });
      var countries = Object.keys(rev);
      if (!countries.length) return;
      var maxVal = Math.max.apply(null, countries.map(function (c) { return rev[c]; })) || 1;
      var barH = Math.min(22, (h - 20) / countries.length - 6);
      var leftPad = 90;
      /* Grow bars from 0 to full width */
      this._animate(canvas, 2200, this._easeOut, function (e) {
        ctx.clearRect(0, 0, w, h);
        countries.forEach(function (c, i) {
          var y = 10 + i * (barH + 8);
          var full = ((w - leftPad - 20) * rev[c]) / maxVal;
          var bw = full * e;
          ctx.fillStyle = '#64748b'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          ctx.fillText(c, leftPad - 8, y + barH / 2);
          var grad = ctx.createLinearGradient(leftPad, 0, leftPad + Math.max(bw, 1), 0);
          grad.addColorStop(0, '#065f46'); grad.addColorStop(1, '#10b981');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.roundRect(leftPad, y, Math.max(bw, 2), barH, 4); ctx.fill();
          ctx.fillStyle = '#1e293b'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left';
          ctx.fillText(PM._currency[c] + rev[c].toFixed(0), leftPad + bw + 6, y + barH / 2);
        });
      });
    },

    _drawTrendChart: function (txns) {
      var canvas = document.getElementById('payTrendChart');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var w = canvas.parentElement.offsetWidth || 300;
      var h = canvas.parentElement.offsetHeight || 150;
      canvas.width = w; canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      var byDay = {};
      txns.forEach(function (t) {
        var d = t.date.slice(0, 10);
        byDay[d] = (byDay[d] || 0) + t.amount;
      });
      var days = Object.keys(byDay).sort();
      if (days.length < 2) return;
      var maxVal = Math.max.apply(null, days.map(function (d) { return byDay[d]; })) || 1;
      var padL = 40, padR = 10, padT = 10, padB = 20;
      var cw = w - padL - padR, ch = h - padT - padB;
      /* Reveal the line left-to-right so dots pop in on page open */
      this._animate(canvas, 2500, this._easeOut, function (e) {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(maxVal), padL - 4, padT + 4); ctx.fillText(0, padL - 4, h - padB - 2);
        var n = Math.floor(days.length * e);
        if (n < 2) return;
        var vis = days.slice(0, n);
        var points = vis.map(function (d, i) {
          return { x: padL + (i / (days.length - 1)) * cw, y: padT + ch - (byDay[d] / maxVal) * ch };
        });
        ctx.beginPath(); ctx.moveTo(points[0].x, h - padB); points.forEach(function (p) { ctx.lineTo(p.x, p.y); });
        ctx.lineTo(points[points.length - 1].x, h - padB); ctx.closePath();
        var grd = ctx.createLinearGradient(0, padT, 0, h - padB);
        grd.addColorStop(0, 'rgba(16,185,129,.3)'); grd.addColorStop(1, 'rgba(16,185,129,.02)');
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); points.forEach(function (p, i) { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.stroke();
        points.forEach(function (p) {
          ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = '#065f46'; ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
        });
      });
    },

    _drawMethodChart: function (txns) {
      var canvas = document.getElementById('payMethodChart');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var w = canvas.parentElement.offsetWidth || 300;
      var h = canvas.parentElement.offsetHeight || 150;
      canvas.width = w; canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      var counts = {};
      txns.forEach(function (t) { counts[t.method] = (counts[t.method] || 0) + 1; });
      var keys = Object.keys(counts);
      var total = txns.length || 1;
var colors = ['#16a34a', '#86efac', '#eab308', '#fef08a', '#16a34a', '#86efac', '#eab308', '#fef08a'];
      var cx = w * 0.35, cy = h / 2, baseR = Math.min(cx - 10, cy - 10, 60);
      /* Zoom in/out: scale up with a slight overshoot, legend stays put */
      this._animate(canvas, 2000, this._easeBack, function (e) {
        ctx.clearRect(0, 0, w, h);
        var r = Math.max(baseR * e, 1);
        var acc = 0;
        keys.forEach(function (m, i) {
          var pct = counts[m] / total;
          var startA = acc * Math.PI * 2 - Math.PI / 2;
          acc += pct;
          var endA = acc * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, startA, endA); ctx.closePath();
          ctx.fillStyle = colors[i % colors.length]; ctx.fill();
        });
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
        if (e > 0.4) {
          ctx.fillStyle = '#1e293b'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(total, cx, cy - 6); ctx.font = '9px sans-serif'; ctx.fillStyle = '#64748b';
          ctx.fillText('payments', cx, cy + 8);
        }
      });
      var lx = w * 0.7, ly = 10;
      keys.forEach(function (m, i) {
        var pct = ((counts[m] / total) * 100).toFixed(1);
        ctx.fillStyle = colors[i % colors.length]; ctx.beginPath(); ctx.roundRect(lx, ly + i * 18, 8, 8, 2); ctx.fill();
        ctx.fillStyle = '#1e293b'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(m + ' (' + pct + '%)', lx + 14, ly + i * 18 + 4);
      });
    },

    _drawStatusChart: function (txns) {
      var canvas = document.getElementById('payStatusChart');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var w = canvas.parentElement.offsetWidth || 300;
      var h = canvas.parentElement.offsetHeight || 150;
      canvas.width = w; canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      var counts = { successful: 0, pending: 0, failed: 0, refunded: 0 };
      txns.forEach(function (t) { if (counts[t.status] !== undefined) counts[t.status]++; });
      var labels = ['Successful', 'Pending', 'Failed', 'Refunded'];
      var vals = [counts.successful, counts.pending, counts.failed, counts.refunded];
      var colors = ['#16a34a', '#86efac', '#eab308', '#fef08a'];
      var total = txns.length || 1;
      var maxVal = Math.max.apply(null, vals) || 1;
      var barW = Math.min(40, (w - 60) / 4 - 10);
      var padT = 15, padB = 25, padL = 30;
      var ch = h - padT - padB;
      /* Grow bars from 0 to full height */
      this._animate(canvas, 2200, this._easeOut, function (e) {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < 4; i++) {
          var x = padL + i * (barW + 14);
          var bh = (vals[i] / maxVal) * ch * e;
          var y = padT + ch - bh;
          if (bh > 0) {
            ctx.fillStyle = colors[i];
            ctx.beginPath(); ctx.roundRect(x, y, barW, Math.max(bh, 1), [4, 4, 0, 0]); ctx.fill();
          }
          ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(vals[i], x + barW / 2, y - 6);
          ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif';
          ctx.fillText(labels[i], x + barW / 2, h - 8);
        }
      });
    },

    setStatusFilter: function (status) {
      this._state.status = status || 'all';
      this._state.page = 1;
      document.querySelectorAll('.payment-filter-tab').forEach(function (tab) {
        var isActive = tab.getAttribute('data-status') === status;
        tab.classList.toggle('active', isActive);
        tab.style.background = isActive ? 'var(--accent)' : 'var(--bg)';
        tab.style.color = isActive ? '#fff' : 'var(--text-secondary)';
        tab.style.borderColor = isActive ? 'var(--accent)' : 'var(--border)';
      });
      this._render();
    },

    setSearch: function (v) {
      this._state.search = (v || '').trim();
      this._state.page = 1;
      this._render();
    },

    setMethodFilter: function (v) {
      this._state.method = v || 'all';
      this._state.page = 1;
      this._render();
    },

    setCountryFilter: function (v) {
      this._state.country = v || 'all';
      this._state.page = 1;
      this._render();
    },

    resetFilters: function () {
      this._state.search = '';
      this._state.status = 'all';
      this._state.method = 'all';
      this._state.country = 'all';
      this._state.sortBy = 'date';
      this._state.sortDir = 'desc';
      this._state.page = 1;
      var si = document.getElementById('paySearchInput'); if (si) si.value = '';
      var mi = document.getElementById('payMethodFilter'); if (mi) mi.value = 'all';
      var ci = document.getElementById('payCountryFilter'); if (ci) ci.value = 'all';
      document.querySelectorAll('.payment-filter-tab').forEach(function (tab) {
        var isActive = tab.getAttribute('data-status') === 'all';
        tab.classList.toggle('active', isActive);
        tab.style.background = isActive ? 'var(--accent)' : 'var(--bg)';
        tab.style.color = isActive ? '#fff' : 'var(--text-secondary)';
        tab.style.borderColor = isActive ? 'var(--accent)' : 'var(--border)';
      });
      document.querySelectorAll('#view-payments .table-actions .filter-tab').forEach(function (btn, i) {
        btn.classList.toggle('active', i === 0);
      });
      this._render();
    },

    setSortBy: function (key) {
      if (this._state.sortBy === key) {
        this._state.sortDir = this._state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this._state.sortBy = key;
        this._state.sortDir = 'desc';
      }
      document.querySelectorAll('#view-payments .table-actions .filter-tab').forEach(function (btn) {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
      this._render();
    },

    _render: function () {
      this.renderPaymentsTable(this._lastOpts || {});
      this.drawCharts();
    },

    openDetail: function (id) {
      if (!this._state.transactions.length) this._seed();
      var t = null;
      this._state.transactions.forEach(function (x) { if (x.id === id) t = x; });
      if (!t) return;
      injectCSS();
      var self = this;
      var stColors = { successful: '#10b981', pending: '#F2B233', failed: '#ef4444', refunded: '#94a3b8' };
      var stc = stColors[t.status] || '#fff';
      function row(l, r) { return '<div class="pa-info"><span class="pa-info-l">' + l + '</span><span class="pa-info-r">' + r + '</span></div>'; }
      var body =
        '<div class="pa-drawer-head">' +
          '<div class="pa-drawer-title"><i class="fas fa-receipt"></i> ' + esc(t.id) + '</div>' +
          '<div class="pa-drawer-sub">' + esc(t.customer) + ' · ' + esc(t.country) + '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap">' +
            '<span style="font-size:22px;font-weight:800;color:#fff">' + esc(self._money(t.amount)) + '</span>' +
            '<span style="padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(255,255,255,.12);color:' + stc + ';text-transform:capitalize">' + esc(t.status) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="pa-section"><h3><i class="fas fa-credit-card"></i> Payment Information</h3>' +
          row('Payment ID', esc(t.id)) +
          row('Order ID', esc(t.orderId)) +
          row('Amount', esc(self._money(t.amount))) +
          row('Method', esc(t.method)) +
          row('Platform', esc(t.platform)) +
          row('Date', esc(self._fmtDate(t.date))) +
        '</div>' +
        '<div class="pa-section"><h3><i class="fas fa-user"></i> Customer Information</h3>' +
          row('Name', esc(t.customer)) +
          row('Email', esc(t.email)) +
          row('Country', esc(t.country)) +
        '</div>' +
        '<div class="pa-section"><h3><i class="fas fa-shield-alt"></i> Status &amp; Verification</h3>' +
          row('Status', '<span style="text-transform:capitalize">' + esc(t.status) + '</span>') +
          row('Verification', esc(t.verification)) +
        '</div>';
      var drawer = document.getElementById('payDrawer');
      if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'payDrawer';
        drawer.className = 'pa-drawer';
        drawer.innerHTML = '<button class="pa-drawer-x" onclick="PaymentManager.closePaymentDetail()"><i class="fas fa-times"></i></button><div class="pa-drawer-scroll"></div><div class="pa-actions"></div>';
        document.body.appendChild(drawer);
      }
      var overlay = document.getElementById('payOverlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'payOverlay';
        overlay.className = 'pa-overlay';
        overlay.addEventListener('click', function () { PaymentManager.closePaymentDetail(); });
        document.body.appendChild(overlay);
      }
      drawer.querySelector('.pa-drawer-scroll').innerHTML = body;
      var acts = [];
      if (t.status === 'successful') acts.push('<button class="pa-act pa-act-danger" onclick="PaymentManager.refundTx(\'' + t.id + '\')"><i class="fas fa-undo"></i> Refund</button>');
      acts.push('<button class="pa-act" onclick="PaymentManager.closePaymentDetail()"><i class="fas fa-times"></i> Close</button>');
      drawer.querySelector('.pa-actions').innerHTML = acts.join('');
      overlay.classList.add('open');
      drawer.classList.add('open');
    },

    refundTx: function (id) {
      var found = null;
      this._state.transactions.forEach(function (x) { if (x.id === id) found = x; });
      if (!found) return;
      if (typeof confirm === 'function' && !confirm('Refund ' + this._money(found.amount) + ' for ' + found.id + '?')) return;
      found.status = 'refunded';
      found.verification = 'N/A';
      if (typeof window.showToast === 'function') window.showToast(found.id + ' refunded');
      this.openDetail(id);
      this._render();
    },

    closePaymentDetail: function () {
      var drawer = document.getElementById('payDrawer');
      var overlay = document.getElementById('payOverlay');
      if (overlay) overlay.classList.remove('open');
      if (drawer) drawer.classList.remove('open');
      var modal = document.getElementById('payDetailModal');
      if (modal) modal.style.display = 'none';
    },

    exportCSV: function () {
      var list = this._filtered();
      var csv = 'Payment ID,Order ID,Customer,Email,Country,Method,Platform,Amount,Status,Verification,Date\n';
      list.forEach(function (t) {
        csv += [t.id, t.orderId, t.customer, t.email, t.country, t.method, t.platform, t.amount, t.status, t.verification, t.date].join(',') + '\n';
      });
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'payment-analytics.csv';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    printPayments: function (opts) {
      opts = opts || {};
      var list = this._filtered();
      var cur = this._currency[list[0] ? list[0].country : 'US'] || '$';
      var html = '<html><head><title>' + (opts.title || 'Payment Analytics') + '</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left}th{background:#f8fafc}</style></head><body>';
      html += '<h2>' + (opts.title || 'Payment Analytics Report') + '</h2><table><thead><tr><th>ID</th><th>Customer</th><th>Country</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>';
      list.forEach(function (t) {
        html += '<tr><td>' + t.id + '</td><td>' + t.customer + '</td><td>' + t.country + '</td><td>' + t.method + '</td><td>' + cur + t.amount.toFixed(2) + '</td><td>' + t.status + '</td><td>' + PM._fmtDate(t.date) + '</td></tr>';
      });
      html += '</tbody></table></body></html>';
      var win = window.open('', '_blank');
      if (win) { win.document.write(html); win.document.close(); win.print(); }
    }
  };

  window.PaymentManager = PM;
})();
