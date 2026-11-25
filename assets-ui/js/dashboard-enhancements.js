/* ================================================================
   VPNexues Dashboard Enhancements Module
   Adds: Business Health, Smart Insights, Alerts, State/City analysis,
   Compare Mode, Target vs Actual, Date Range, Export, Dark Theme,
   Product Performance, Order Analytics, Customer Analytics
   ================================================================ */
window.DashEnhance = (function () {
  'use strict';

  var COUNTRY = 'India';
  var THEME_KEY = 'vpnexues_theme';

  /* ---- Geo Data ---- */
  var GEO = {
    India: {
      currency: '\u20B9', grp: 'en-IN', stateLabel: 'State',
      states: [
        { name: 'Maharashtra', cities: ['Mumbai','Pune','Nagpur','Nashik','Aurangabad'] },
        { name: 'Tamil Nadu', cities: ['Chennai','Coimbatore','Salem','Erode','Vellore'] },
        { name: 'Karnataka', cities: ['Bengaluru','Mysuru','Hubballi','Mangaluru','Belgaum'] },
        { name: 'Delhi NCR', cities: ['New Delhi','Gurugram','Noida','Faridabad','Ghaziabad'] },
        { name: 'Telangana', cities: ['Hyderabad','Warangal','Karimnagar','Nizamabad','Khammam'] },
        { name: 'West Bengal', cities: ['Kolkata','Howrah','Durgapur','Asansol','Siliguri'] },
        { name: 'Gujarat', cities: ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar'] },
        { name: 'Rajasthan', cities: ['Jaipur','Jodhpur','Udaipur','Kota','Ajmer'] }
      ]
    },
    UAE: {
      currency: 'AED ', grp: 'en-IN', stateLabel: 'Emirate',
      states: [
        { name: 'Dubai', cities: ['Deira','Bur Dubai','Jumeirah','Downtown Dubai','Business Bay'] },
        { name: 'Abu Dhabi', cities: ['Al Reem Island','Khalifa City','Corniche','Yas Island','Musaffah'] },
        { name: 'Sharjah', cities: ['Al Majaz','Al Nahda','Muwaileh','Al Khan','Al Qasimia'] },
        { name: 'Ajman', cities: ['Al Rashidiya','Al Nuaimiya','Jurf','Al Hamidiya','Al Rawda'] },
        { name: 'Ras Al Khaimah', cities: ['Al Nakheel','Al Marjan Island','Hamraniyah','Al Dhait','Julphar'] },
        { name: 'Fujairah', cities: ['Fujairah City','Dibba','Mirbah','Al Faseel','Sakamkam'] },
        { name: 'Umm Al-Quwain', cities: ['UAQ City','Falaj Al Mualla','Al Salama','Al Raas','Al Harith'] }
      ]
    },
    US: {
      currency: '$', grp: 'en-US', stateLabel: 'Region',
      states: [
        { name: 'West Coast', cities: ['Los Angeles','San Francisco','Seattle','Denver','San Diego'] },
        { name: 'Northeast', cities: ['New York City','Boston','Philadelphia','Newark','Pittsburgh'] },
        { name: 'Southeast', cities: ['Miami','Atlanta','Charlotte','Orlando','Tampa'] },
        { name: 'Midwest', cities: ['Chicago','Minneapolis','Detroit','Columbus','Milwaukee'] },
        { name: 'Southwest', cities: ['Phoenix','Dallas','Houston','Austin','San Antonio'] }
      ]
    },
    Singapore: {
      currency: 'S$', grp: 'en-US', stateLabel: 'Region',
      states: [
        { name: 'Central', cities: ['Orchard Road','Marina Bay','Bugis','Chinatown','Newton'] },
        { name: 'East', cities: ['Tampines','Bedok','Pasir Ris','Changi','Geylang'] },
        { name: 'West', cities: ['Jurong East','Clementi','Bukit Batok','Boon Lay','Tuas'] },
        { name: 'North', cities: ['Woodlands','Yishun','Sembawang','Mandai','Ang Mo Kio'] },
        { name: 'North-East', cities: ['Punggol','Sengkang','Hougang','Serangoon','Bishan'] }
      ]
    }
  };

  /* ---- Deterministic hash for seeded randomness ---- */
  function h(s) { var v = 2166136261; for (var i = 0; i < s.length; i++) { v ^= s.charCodeAt(i); v = Math.imul(v, 16777619); } return Math.abs(v); }
  function rand(seed, n) { return (h(seed) % n); }
  function pick(arr, seed) { return arr[h(seed) % arr.length]; }
  function pct(v) { return (v >= 0 ? '+' : '') + v.toFixed(1) + '%'; }

  function geo() { return GEO[COUNTRY] || GEO.India; }
  function money(v) { return geo().currency + Math.round(v).toLocaleString(geo().grp); }

  var STATE_SCALE = { India: 1000, UAE: 500, US: 150, Singapore: 120 };

  function enrichCityMetric(stateName, cityName) {
    var seed = stateName + '-' + cityName;
    var scale = STATE_SCALE[COUNTRY] || 1000;
    var revenue = ((h(seed + '-rev') % 380) + 40) * scale;
    var orders = 25 + (h(seed + '-ord') % 320);
    var delivered = Math.round(orders * 0.905);
    var cancelled = Math.round(orders * 0.045);
    var inTransit = Math.max(0, orders - delivered - cancelled);
    var units = Math.round(orders * 2.6);
    var customers = Math.round(orders * 0.72);
    var newCustomers = Math.round(customers * 0.28);
    var repeatCustomers = customers - newCustomers;
    var retentionRate = 62 + (h(seed + '-ret') % 20);
    var subscribers = Math.round(customers * 0.55);
    var activeSubs = Math.round(subscribers * 0.89);
    var unsubscribed = subscribers - activeSubs;
    var cityGrowth = ((h(seed + '-growth') % 2400) - 200) / 100;
    return {
      name: cityName,
      revenue: revenue,
      orders: orders,
      growth: cityGrowth,
      delivered: delivered,
      cancelled: cancelled,
      inTransit: inTransit,
      units: units,
      customers: customers,
      newCustomers: newCustomers,
      repeatCustomers: repeatCustomers,
      retentionRate: retentionRate,
      subscribers: subscribers,
      activeSubs: activeSubs,
      unsubscribed: unsubscribed
    };
  }

  function enrichGeo() {
    var g = geo();
    if (!Array.isArray(g.states) || (g.states[0] && g.states[0].cities && g.states[0].cities[0] && typeof g.states[0].cities[0] === 'object')) {
      return;
    }
    g.states.forEach(function (s) {
      var cityObjs = (s.cities || []).map(function (c) { return enrichCityMetric(s.name, c); });
      var totalRev = cityObjs.reduce(function (a, x) { return a + x.revenue; }, 0);
      var totalOrd = cityObjs.reduce(function (a, x) { return a + x.orders; }, 0);
      var totalUnits = cityObjs.reduce(function (a, x) { return a + x.units; }, 0);
      var totalCust = cityObjs.reduce(function (a, x) { return a + x.customers; }, 0);
      var totalSub = cityObjs.reduce(function (a, x) { return a + x.subscribers; }, 0);
      var totalDel = cityObjs.reduce(function (a, x) { return a + x.delivered; }, 0);
      var totalCancel = cityObjs.reduce(function (a, x) { return a + x.cancelled; }, 0);
      var totalTransit = cityObjs.reduce(function (a, x) { return a + x.inTransit; }, 0);
      var totalNew = cityObjs.reduce(function (a, x) { return a + x.newCustomers; }, 0);
      var totalRepeat = cityObjs.reduce(function (a, x) { return a + x.repeatCustomers; }, 0);
      var totalActiveSub = cityObjs.reduce(function (a, x) { return a + x.activeSubs; }, 0);
      var totalUnsub = cityObjs.reduce(function (a, x) { return a + x.unsubscribed; }, 0);
      var avgGrowth = cityObjs.reduce(function (a, x) { return a + x.growth; }, 0) / Math.max(1, cityObjs.length);
      s.revenue = totalRev;
      s.orders = totalOrd;
      s.growth = avgGrowth;
      s.units = totalUnits;
      s.customers = totalCust;
      s.newCustomers = totalNew;
      s.repeatCustomers = totalRepeat;
      s.subscribers = totalSub;
      s.activeSubs = totalActiveSub;
      s.unsubscribed = totalUnsub;
      s.delivered = totalDel;
      s.cancelled = totalCancel;
      s.inTransit = totalTransit;
      s.cities = cityObjs;
    });
  }

  /* ---- Generate deterministic product metrics per state/city ---- */
  var PRODUCTS = ['Organic Potatoes','Fresh Tomatoes','Green Chillies','Onions','Spinach','Mangoes','Bananas','Rice (Basmati)','Turmeric Powder','Coconut Oil'];
  function stateProducts(stateName) {
    var products = [];
    PRODUCTS.forEach(function (p, i) {
      var rev = (h(stateName + p) % 80 + 20) * 1000;
      var ord = (h(stateName + p + 'o') % 60 + 10);
      products.push({ name: p, revenue: rev, orders: ord, score: Math.round((rev / 1000 + ord) / 2) });
    });
    products.sort(function (a, b) { return b.score - a.score; });
    return products;
  }
  function cityProducts(cityName) {
    var products = [];
    PRODUCTS.forEach(function (p, i) {
      var rev = (h(cityName + p) % 50 + 5) * 1000;
      var ord = (h(cityName + p + 'o') % 30 + 3);
      products.push({ name: p, revenue: rev, orders: ord, score: Math.round((rev / 1000 + ord) / 2) });
    });
    products.sort(function (a, b) { return b.score - a.score; });
    return products;
  }

  /* ---- Business Health Score ---- */
  function healthScore() {
    var scores = {
      revenue: rand(COUNTRY + 'rev', 20) + 70,
      orders: rand(COUNTRY + 'ord', 20) + 65,
      customers: rand(COUNTRY + 'cust', 20) + 60,
      stock: rand(COUNTRY + 'stk', 20) + 55
    };
    var avg = Math.round((scores.revenue + scores.orders + scores.customers + scores.stock) / 4);
    return { overall: avg, revenue: scores.revenue, orders: scores.orders, customers: scores.customers, stock: scores.stock };
  }

  /* ---- Smart Insights ---- */
  function insights() {
    var states = geo().states;
    var top = states.slice().sort(function (a, b) { return b.revenue - a.revenue; })[0];
    var fastest = states.slice().sort(function (a, b) { return b.growth - a.growth; })[0];
    var totalRev = states.reduce(function (s, x) { return s + x.revenue; }, 0);
    var totalOrd = states.reduce(function (s, x) { return s + x.orders; }, 0);
    return [
      { icon: 'fa-arrow-trend-up', color: '#22C55E', text: 'Revenue grew ' + pct(fastest.growth) + ' in ' + fastest.name + ' this period.' },
      { icon: 'fa-trophy', color: '#F59E0B', text: top.name + ' leads with ' + money(top.revenue) + ' in total revenue.' },
      { icon: 'fa-chart-line', color: '#3B82F6', text: 'Average order value is ' + money(totalOrd ? totalRev / totalOrd : 0) + ' across all regions.' },
      { icon: 'fa-triangle-exclamation', color: '#EF4444', text: 'Restock alert: 5 products are below minimum stock levels.' },
      { icon: 'fa-users', color: '#8B5CF6', text: 'Customer retention is at 89.1%, up 2.1% from last quarter.' },
      { icon: 'fa-box-open', color: '#06B6D4', text: '90 products sold this month across ' + states.length + ' ' + geo().stateLabel.toLowerCase() + 's.' }
    ];
  }

  /* ---- Alerts ---- */
  function alerts() {
    return [
      { type: 'warn', icon: 'fa-triangle-exclamation', text: 'Green Chilli stock is critically low (28 units)', time: '2 min ago' },
      { type: 'danger', icon: 'fa-xmark-circle', text: 'Basmati Rice is out of stock', time: '15 min ago' },
      { type: 'info', icon: 'fa-bell', text: 'Revenue drop detected in West Bengal (-4.1% MoM)', time: '1 hr ago' },
      { type: 'success', icon: 'fa-check-circle', text: 'New bulk order #VP-24812 worth ' + money(4850) + ' from Mumbai', time: '2 hrs ago' },
      { type: 'warn', icon: 'fa-clock', text: '12 orders pending for more than 24 hours', time: '3 hrs ago' }
    ];
  }

  /* ---- CSS for all enhancements ---- */
  var CSS = [
    '.de-card{background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:18px;margin-bottom:16px;transition:all .2s}',
    '.de-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.08)}',
    '.de-card h3{margin:0 0 12px;font-size:14px;font-weight:700;color:var(--text,#1e293b);display:flex;align-items:center;gap:8px}',
    '.de-grid{display:grid;gap:14px}',
    '.de-grid-2{grid-template-columns:repeat(2,1fr)}',
    '.de-grid-3{grid-template-columns:repeat(3,1fr)}',
    '.de-grid-4{grid-template-columns:repeat(4,1fr)}',
    '.de-kpi{text-align:center;padding:14px;border-radius:12px;background:var(--card-alt,#f8fafc);border:1px solid var(--border,#e5e7eb)}',
    '.de-kpi .de-kpi-val{font-size:22px;font-weight:800;color:var(--text,#1e293b);margin:4px 0}',
    '.de-kpi .de-kpi-lbl{font-size:11px;font-weight:600;color:var(--text-muted,#64748b);text-transform:uppercase;letter-spacing:.4px}',
    '.de-kpi .de-kpi-sub{font-size:11px;color:var(--text-muted,#64748b);margin-top:2px}',
    '.de-health-bar{height:8px;border-radius:4px;background:var(--border,#e5e7eb);overflow:hidden;margin:4px 0}',
    '.de-health-fill{height:100%;border-radius:4px;transition:width .6s ease}',
    '.de-insight{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:10px;margin-bottom:8px;background:var(--card-alt,#f8fafc);border:1px solid var(--border,#e5e7eb);font-size:13px;color:var(--text,#374151);line-height:1.4}',
    '.de-insight i{margin-top:2px;flex-shrink:0;font-size:14px}',
    '.de-alert{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;margin-bottom:8px;font-size:12px;color:var(--text,#374151);border:1px solid var(--border,#e5e7eb)}',
    '.de-alert-warn{background:#FFFBEB;border-color:#FDE68A}',
    '.de-alert-danger{background:#FEF2F2;border-color:#FECACA}',
    '.de-alert-info{background:#EFF6FF;border-color:#BFDBFE}',
    '.de-alert-success{background:#F0FDF4;border-color:#BBF7D0}',
    '.de-alert-time{margin-left:auto;font-size:11px;color:var(--text-muted,#9CA3AF);white-space:nowrap}',
    '.de-filter-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:14px}',
    '.de-select{padding:7px 12px;border:1px solid var(--border,#d1d5db);border-radius:8px;font-size:12px;font-weight:600;font-family:inherit;background:var(--card,#fff);color:var(--text,#111827);cursor:pointer;outline:none}',
    '.de-select:focus{border-color:var(--primary,#3b82f6)}',
    '.de-btn{padding:7px 14px;border:1px solid var(--border,#d1d5db);border-radius:8px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s}',
    '.de-btn-primary{background:var(--primary,#16A34A);color:#fff;border-color:var(--primary,#16A34A)}',
    '.de-btn-primary:hover{opacity:.9}',
    '.de-ranking{margin-bottom:12px}',
    '.de-ranking h4{font-size:12px;font-weight:700;color:var(--text-muted,#64748b);margin:0 0 8px;text-transform:uppercase;letter-spacing:.3px}',
    '.de-rank-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;margin-bottom:4px;font-size:12px;color:var(--text,#374151);background:var(--card-alt,#f8fafc);border:1px solid var(--border,#e5e7eb)}',
    '.de-rank-num{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex-shrink:0}',
    '.de-rank-num.top{background:#22C55E}',
    '.de-rank-num.poor{background:#EF4444}',
    '.de-rank-name{flex:1;font-weight:600}',
    '.de-rank-val{font-weight:700;color:var(--text,#1e293b)}',
    '.de-compare{display:grid;grid-template-columns:1fr 1fr;gap:14px}',
    '.de-compare-col{padding:14px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--card-alt,#f8fafc)}',
    '.de-compare-col h4{margin:0 0 10px;font-size:13px;font-weight:700;color:var(--text,#1e293b)}',
    '.de-target-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border,#f1f5f9)}',
    '.de-target-row:last-child{border-bottom:none}',
    '.de-target-label{flex:1;font-size:13px;font-weight:600;color:var(--text,#374151)}',
    '.de-target-vals{display:flex;gap:16px;font-size:12px}',
    '.de-target-vals span{font-weight:600}',
    '.de-tabs{display:flex;gap:4px;margin-bottom:14px;flex-wrap:wrap}',
    '.de-tab{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);color:var(--text,#64748b);transition:all .15s}',
    '.de-tab.active{background:var(--primary,#16A34A);color:#fff;border-color:var(--primary,#16A34A)}',
    '.de-tab:hover:not(.active){background:var(--card-alt,#f1f5f9)}',
    '.de-empty{text-align:center;padding:30px;color:var(--text-muted,#9CA3AF);font-size:13px}',
    '.de-export-bar{display:flex;gap:6px;align-items:center}',
    '.de-export-btn{padding:6px 12px;border-radius:8px;font-size:11px;font-weight:700;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:all .15s}',
    '.de-export-btn.excel{background:#166534;color:#fff}',
    '.de-export-btn.csv{background:#0369A1;color:#fff}',
    '.de-export-btn.pdf{background:#B91C1C;color:#fff}',
    '.de-export-btn:hover{opacity:.85;transform:translateY(-1px)}',
    /* Dark Theme Variables */
    '[data-theme="dark"]{--card:#1E293B;--card-alt:#273548;--border:#334155;--text:#F8FAFC;--text-muted:#94A3B8;--bg:#0F172A}',
    '[data-theme="dark"] body{background:#0F172A;color:#F8FAFC}',
    '[data-theme="dark"] .sidebar{background:#1E293B;border-right:1px solid #334155}',
    '[data-theme="dark"] .sidebar-nav-item{color:#CBD5E1}',
    '[data-theme="dark"] .sidebar-nav-item:hover{background:rgba(255,255,255,.06)}',
    '[data-theme="dark"] .sidebar-nav-item.active{background:rgba(34,197,94,.15);color:#4ade80}',
    '[data-theme="dark"] .topbar{background:#0d2818}',
    '[data-theme="dark"] .content{background:#0F172A}',
    '[data-theme="dark"] .ds-banner{background:linear-gradient(135deg,#0d3018,#0a2b16)}',
    '[data-theme="dark"] .ds-kpi{background:#1E293B;border-color:#334155;color:#F8FAFC}',
    '[data-theme="dark"] .ds-kpi h3{color:#CBD5E1}',
    '[data-theme="dark"] .ds-kpi .value{color:#F8FAFC}',
    '[data-theme="dark"] .ds-kpi .change{color:#94A3B8}',
    '[data-theme="dark"] .ds-summary .summary-stat{background:#1E293B;border-color:#334155}',
    '[data-theme="dark"] .ds-summary .summary-stat .value{color:#F8FAFC}',
    '[data-theme="dark"] .ds-summary .summary-stat .label{color:#94A3B8}',
    '[data-theme="dark"] .card{background:#1E293B;border-color:#334155}',
    '[data-theme="dark"] .card-header{background:linear-gradient(135deg,#1a3a2a,#14532D)}',
    '[data-theme="dark"] .card-body{color:#CBD5E1}',
    '[data-theme="dark"] table.data-table th{background:linear-gradient(135deg,#1a3a2a,#14532D);color:#CBD5E1}',
    '[data-theme="dark"] table.data-table td{background:#1E293B;color:#CBD5E1;border-color:#334155}',
    '[data-theme="dark"] table.data-table tr:hover td{background:#273548}',
    '[data-theme="dark"] input,.de-select{background:#273548;color:#F8FAFC;border-color:#475569}',
    '[data-theme="dark"] .filter-tab{background:#273548;color:#CBD5E1;border-color:#475569}',
    '[data-theme="dark"] .section-banner{background:linear-gradient(135deg,#14472F,#0d3018)}',
    '[data-theme="dark"] .section-banner-text h2{color:#fff}',
    '[data-theme="dark"] .section-banner-text p{color:rgba(255,255,255,.7)}',
    '[data-theme="dark"] .report-tab{background:#14532D !important;color:#CBD5E1 !important}',
    '[data-theme="dark"] .report-tab.active{background:#16A34A !important;color:#fff !important}',
    '[data-theme="dark"] #view-reports .data-table td{background:#1E293B;color:#CBD5E1}',
    '[data-theme="dark"] #view-reports .data-table tr:hover td{background:#273548}',
    '[data-theme="dark"] .vp-live-strip{background:#1E293B;color:#CBD5E1}',
    '[data-theme="dark"] .vp-live-label{background:#273548;color:#CBD5E1}',
    '[data-theme="dark"] .vp-live-clock{background:#273548;color:#CBD5E1}',
    '[data-theme="dark"] .vp-live-item .vp-text{color:#CBD5E1}',
    '[data-theme="dark"] .de-card{background:#1E293B;border-color:#334155}',
    '[data-theme="dark"] .de-card h3{color:#F8FAFC}',
    '[data-theme="dark"] .de-kpi{background:#273548;border-color:#475569}',
    '[data-theme="dark"] .de-kpi .de-kpi-val{color:#F8FAFC}',
    '[data-theme="dark"] .de-kpi .de-kpi-lbl{color:#94A3B8}',
    '[data-theme="dark"] .de-kpi .de-kpi-sub{color:#94A3B8}',
    '[data-theme="dark"] .de-insight{background:#273548;border-color:#334155;color:#CBD5E1}',
    '[data-theme="dark"] .de-alert{border-color:#475569;color:#CBD5E1}',
    '[data-theme="dark"] .de-alert-warn{background:#422006;border-color:#92400E;color:#FDE68A}',
    '[data-theme="dark"] .de-alert-danger{background:#450A0A;border-color:#7F1D1D;color:#FCA5A5}',
    '[data-theme="dark"] .de-alert-info{background:#172554;border-color:#1E3A5F;color:#93C5FD}',
    '[data-theme="dark"] .de-alert-success{background:#052E16;border-color:#14532D;color:#86EFAC}',
    '[data-theme="dark"] .de-rank-item{background:#273548;border-color:#334155;color:#CBD5E1}',
    '[data-theme="dark"] .de-compare-col{background:#273548;border-color:#334155}',
    '[data-theme="dark"] .de-compare-col h4{color:#F8FAFC}',
    '[data-theme="dark"] .de-health-bar{background:#334155}',
    '[data-theme="dark"] .pm-card{background:#1E293B;border-color:#334155}',
    '[data-theme="dark"] .pm-card-name{color:#F8FAFC}',
    '[data-theme="dark"] .pm-card-price{color:#4ade80}',
    '[data-theme="dark"] .pm-card-cat{color:#4ade80}',
    '[data-theme="dark"] .btn{background:#334155;color:#CBD5E1;border-color:#475569}',
    '[data-theme="dark"] .sidebar-brand-text h2{color:#fff}',
    '[data-theme="dark"] .sidebar-brand-text span{color:#94A3B8}',
    '[data-theme="dark"] .topbar-logo-text{color:#fff}',
    '[data-theme="dark"] .topbar-nav-item{color:rgba(255,255,255,.7)}',
    '[data-theme="dark"] .topbar-nav-item.active{color:#fff;background:rgba(255,255,255,.18)}',
    '[data-theme="dark"] .detail-drawer{background:#1E293B}',
    '.dd-wrap{margin-top:16px}',
    '.dd-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;padding:18px 22px;background:linear-gradient(135deg,#14532D,#166534);border-radius:14px;color:#fff;margin-bottom:18px}',
    '.dd-header h2{margin:0 0 4px;font-size:17px;font-weight:800;color:#fff;display:flex;align-items:center;gap:8px}',
    '.dd-header p{margin:0;font-size:12px;color:rgba(255,255,255,.78);line-height:1.4}',
    '.dd-header-right{display:flex;gap:8px;align-items:center;flex-shrink:0}',
    '.dd-sel{display:none}',
    '.dd-loc-sel{padding:8px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;min-width:200px;justify-content:space-between;user-select:none}',
    '.dd-loc-sel:hover{background:rgba(255,255,255,.2)}',
    '.dd-loc-sel i{font-size:10px;opacity:.7}',
    '.dd-loc-wrap{position:relative;display:inline-block}',
    '.dd-loc-panel{display:none;position:absolute;top:calc(100% + 4px);right:0;width:360px;max-height:420px;overflow-y:auto;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.15);z-index:999}',
    '.dd-loc-panel.open{display:block}',
    '.dd-loc-panel::-webkit-scrollbar{width:6px}',
    '.dd-loc-panel::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}',
    '.dd-loc-state-hdr{padding:8px 14px;background:#166534;color:#fff;font-size:12px;font-weight:700;cursor:default;position:sticky;top:0;z-index:1}',
    '.dd-loc-all{padding:7px 14px 7px 28px;font-size:12px;color:#64748b;cursor:pointer;transition:background .15s}',
    '.dd-loc-all:hover{background:#f0fdf4;color:#166534}',
    '.dd-loc-copt{padding:7px 14px 7px 42px;font-size:12px;color:#1e293b;cursor:pointer;transition:background .15s;display:flex;justify-content:space-between;align-items:center}',
    '.dd-loc-copt:hover{background:#f0fdf4}',
    '.dd-loc-copt.active{background:#dcfce7;color:#166534;font-weight:600}',
    '.dd-loc-copt-name{font-weight:500}',
    '.dd-loc-copt-stats{font-size:11px;color:#64748b;white-space:nowrap}',
    '.dd-loc{display:flex;justify-content:space-between;align-items:flex-start;padding:16px 22px}',
    '.dd-loc-city{font-size:22px;font-weight:800;color:var(--text,#1e293b)}',
    '.dd-loc-state{font-size:14px;color:var(--text-muted,#64748b);font-weight:600;margin-left:6px}',
    '.dd-loc-sub{margin:4px 0 0;font-size:12px;color:var(--text-muted,#94A3B8)}',
    '.dd-loc-growth{font-size:16px;font-weight:800;white-space:nowrap;padding-top:4px}',
    '.dd-grid-6{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:18px}',
    '.dd-kpi-c{text-align:left;padding:14px 16px;border-radius:12px;background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);transition:box-shadow .2s;position:relative;overflow:hidden}',
    '.dd-kpi-c:hover{box-shadow:0 4px 14px rgba(0,0,0,.07)}',
    '.dd-kpi-icon{position:absolute;top:10px;right:10px;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;background:rgba(34,197,94,.1)}',
    '.dd-kpi-lbl{font-size:10px;font-weight:700;color:var(--text-muted,#64748b);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}',
    '.dd-kpi-val{font-size:22px;font-weight:800;color:var(--text,#1e293b);margin-bottom:2px}',
    '.dd-kpi-sub{font-size:11px;color:var(--text-muted,#94A3B8)}',
    '.dd-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}',
    '.dd-info-card{padding:16px 18px;border-radius:14px;background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-left:4px solid #166534}',
    '.dd-info-card h4{margin:0 0 12px;font-size:13px;font-weight:700;color:var(--text,#1e293b);display:flex;align-items:center;gap:8px;padding-bottom:10px;border-bottom:1px solid var(--border,#f1f5f9)}',
    '.dd-info-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border,#f1f5f9);font-size:12px}',
    '.dd-info-row:last-child{border-bottom:none}',
    '.dd-info-row span:first-child{color:var(--text-muted,#64748b);font-weight:500}',
    '.dd-info-row span:last-child{font-weight:700;color:var(--text,#1e293b);text-align:right}',
    '.dd-table{width:100%;border-collapse:collapse;font-size:12px}',
    '.dd-table th{padding:10px 12px;text-align:left;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #14532D;background:#166534}',
    '.dd-table td{padding:10px 12px;border-bottom:1px solid var(--border,#f1f5f9);color:var(--text,#374151)}',
    '.dd-table tr:last-child td{border-bottom:none}',
    '.dd-table tbody tr:nth-child(even){background:var(--card-alt,#f8fafc)}',
    '.dd-share{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:#F0FDF4;color:#166534}',
    '.dd-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}',
    '.dd-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:18px}',
    '.dd-card{background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:18px;margin-bottom:18px}',
    '.dd-card h3{margin:0 0 14px;font-size:14px;font-weight:700;color:var(--text,#1e293b);display:flex;align-items:center;gap:8px}',
    '.dd-inv-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;display:flex;align-items:center;gap:6px}',
    '.dd-inv-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border,#f1f5f9);font-size:12px}',
    '.dd-inv-row:last-child{border-bottom:none}',
    '.dd-inv-name{color:var(--text,#374151);font-weight:500}',
    '.dd-inv-units{font-weight:700}',
    '.dd-inv-total{text-align:center;padding:16px;border-radius:12px;background:var(--card-alt,#f8fafc);border:1px solid var(--border,#e5e7eb);display:flex;flex-direction:column;align-items:center;justify-content:center}',
    '.dd-inv-val{font-size:28px;font-weight:800;color:var(--text,#1e293b);margin-top:4px}',
    '.dd-trend{display:flex;align-items:flex-end;gap:10px;height:200px;padding:12px 0}',
    '.dd-trend-col{flex:1;display:flex;flex-direction:column;align-items:center;height:100%}',
    '.dd-trend-val{font-size:10px;font-weight:700;color:var(--text,#1e293b);margin-bottom:6px;white-space:nowrap}',
    '.dd-trend-bar-wrap{flex:1;width:100%;background:var(--border,#e5e7eb);border-radius:8px 8px 0 0;position:relative;overflow:hidden}',
    '.dd-trend-bar{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(180deg,#4ade80,#166534);border-radius:8px 8px 0 0;transition:height .5s ease}',
    '.dd-trend-label{font-size:11px;font-weight:600;color:var(--text-muted,#64748b);margin-top:6px}',
    '.dd-empty{text-align:center;padding:40px;color:var(--text-muted,#9CA3AF);font-size:13px}',
    '.dd-empty-icon{font-size:48px;margin-bottom:12px;opacity:.3}',
    '.dd-empty-msg{font-size:14px;color:var(--text-muted,#94A3B8);max-width:400px;margin:0 auto;line-height:1.6}',
    '.dd-inv-badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px}',
    '.dd-inv-badge-high{background:#FEF3C7;color:#92400E}',
    '.dd-inv-left{display:inline-block;padding:1px 6px;border-radius:6px;font-size:11px;font-weight:600;margin-left:4px}',
    '.dd-inv-left-red{background:#FEE2E2;color:#DC2626}',
    '.dd-inv-left-green{background:#D1FAE5;color:#059669}',
    '.dd-cat-tag{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:#F0FDF4;color:#166534}',
    '.dd-status-slow{display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:700;background:#FEF3C7;color:#92400E}',
    '[data-theme="dark"] .dd-header{background:linear-gradient(135deg,#0d3018,#14472F)}',
    '[data-theme="dark"] .dd-loc-panel{background:#1E293B;border-color:#334155}',
    '[data-theme="dark"] .dd-loc-copt{color:#CBD5E1}',
    '[data-theme="dark"] .dd-loc-copt:hover{background:#273548}',
    '[data-theme="dark"] .dd-loc-copt.active{background:#14532D;color:#fff}',
    '[data-theme="dark"] .dd-loc-copt-stats{color:#94A3B8}',
    '[data-theme="dark"] .dd-loc-all{color:#94A3B8}',
    '[data-theme="dark"] .dd-loc-all:hover{background:#14532D;color:#fff}',
    '[data-theme="dark"] .dd-loc-sel{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);color:#F8FAFC}',
    '[data-theme="dark"] .dd-loc{background:#1E293B;border-color:#334155}',
    '[data-theme="dark"] .dd-kpi-c{background:#1E293B;border-color:#334155}',
    '[data-theme="dark"] .dd-info-card{background:#1E293B;border-color:#334155}',
    '[data-theme="dark"] .dd-card{background:#1E293B;border-color:#334155}',
    '[data-theme="dark"] .dd-inv-total{background:#1E293B;border-color:#334155}',
    '[data-theme="dark"] .dd-loc-city{color:#F8FAFC}',
    '[data-theme="dark"] .dd-kpi-val{color:#F8FAFC}',
    '[data-theme="dark"] .dd-info-card h4{color:#F8FAFC}',
    '[data-theme="dark"] .dd-card h3{color:#F8FAFC}',
    '[data-theme="dark"] .dd-inv-val{color:#F8FAFC}',
    '[data-theme="dark"] .dd-trend-val{color:#F8FAFC}',
    '[data-theme="dark"] .dd-table td{color:#F8FAFC}',
    '[data-theme="dark"] .dd-table th{background:#14532D;color:#fff;border-color:#166534}',
    '[data-theme="dark"] .dd-info-row span:first-child{color:#94A3B8}',
    '[data-theme="dark"] .dd-inv-name{color:#94A3B8}',
    '[data-theme="dark"] .dd-trend-label{color:#94A3B8}',
    '@media(max-width:1100px){.dd-grid-6{grid-template-columns:repeat(3,1fr)}.dd-grid-4{grid-template-columns:repeat(2,1fr)}}',
    '@media(max-width:768px){.dd-grid-6,.dd-grid-4,.dd-grid-2{grid-template-columns:1fr}.dd-header{flex-direction:column}.dd-header-right{width:100%}.dd-sel{max-width:100%}.de-grid-2,.de-grid-3,.de-grid-4{grid-template-columns:1fr}.de-compare{grid-template-columns:1fr}}'
  ].join('\n');

  /* ---- Theme Toggle HTML ---- */
  function themeToggleHtml() {
    return '<button id="deThemeBtn" class="de-btn" onclick="DashEnhance.toggleTheme()" title="Toggle Light/Dark Theme" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;font-size:13px;background:var(--card,#fff);border:1px solid var(--border,#d1d5db);color:var(--text,#111827);cursor:pointer;font-family:inherit;font-weight:600">' +
      '<i class="fas ' + (document.documentElement.getAttribute('data-theme') === 'dark' ? 'fa-sun' : 'fa-moon') + '" id="deThemeIcon"></i>' +
      '<span id="deThemeLabel">' + (document.documentElement.getAttribute('data-theme') === 'dark' ? 'Light' : 'Dark') + '</span>' +
      '</button>';
  }

  /* ---- Business Health Card HTML ---- */
  function healthHtml() {
    var h = healthScore();
    function barColor(v) { return v >= 80 ? '#166534' : v >= 60 ? '#22C55E' : '#86EFAC'; }
    function grade(v) { return v >= 80 ? 'Excellent' : v >= 60 ? 'Good' : v >= 40 ? 'Fair' : 'Needs Attention'; }
    var rows = [
      { label: 'Revenue Health', val: h.revenue },
      { label: 'Order Health', val: h.orders },
      { label: 'Customer Health', val: h.customers },
      { label: 'Stock Health', val: h.stock }
    ];
    return '<div style="padding:14px 18px">' +
      '<h3 style="margin:0 0 10px;font-size:16px;font-weight:700;color:var(--text,#1e293b);display:flex;align-items:center;gap:8px"><i class="fas fa-heart-pulse" style="color:#22C55E"></i> Business Health</h3>' +
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">' +
        '<div style="text-align:center;min-width:70px">' +
          '<div style="font-size:38px;font-weight:800;color:' + barColor(h.overall) + '">' + h.overall + '</div>' +
          '<div style="font-size:12px;font-weight:600;color:var(--text-muted,#64748b)">/100</div>' +
          '<div style="font-size:13px;font-weight:700;color:' + barColor(h.overall) + ';margin-top:2px">' + grade(h.overall) + '</div>' +
        '</div>' +
        '<div style="flex:1">' + rows.map(function (r) {
          return '<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span style="font-weight:600;color:var(--text-muted,#64748b)">' + r.label + '</span><span style="font-weight:700;color:' + barColor(r.val) + '">' + r.val + '/100</span></div>' +
            '<div class="de-health-bar"><div class="de-health-fill" style="width:' + r.val + '%;background:' + barColor(r.val) + '"></div></div></div>';
        }).join('') + '</div>' +
      '</div></div>';
  }

  /* ---- Smart Insights HTML ---- */
  function insightsHtml() {
    var items = insights();
    return '<div class="de-card">' +
      '<h3><i class="fas fa-lightbulb" style="color:#F59E0B"></i> Smart Insights</h3>' +
      items.map(function (it) {
        return '<div class="de-insight"><i class="fas ' + it.icon + '" style="color:' + it.color + '"></i><span>' + it.text + '</span></div>';
      }).join('') + '</div>';
  }

  /* ---- Alerts HTML ---- */
  function alertsHtml() {
    var items = alerts();
    return '<div class="de-card">' +
      '<h3><i class="fas fa-bell" style="color:#3B82F6"></i> Alerts</h3>' +
      items.map(function (it) {
        return '<div class="de-alert de-alert-' + it.type + '">' +
          '<i class="fas ' + it.icon + '"></i><span>' + it.text + '</span>' +
          '<span class="de-alert-time">' + it.time + '</span></div>';
      }).join('') + '</div>';
  }

  /* ---- State/City Rankings HTML for Reports ---- */
  function geoRankingsHtml(reportType) {
    var states = geo().states;
    var stateLabel = geo().stateLabel;
    var metricLabel = { revenue: 'Revenue', orders: 'Orders', sales: 'Sales', products: 'Product', customers: 'Customers' };
    var ml = metricLabel[reportType] || 'Performance';

    var sorted = states.slice().sort(function (a, b) { return b.revenue - a.revenue; });
    var topStates = sorted.slice(0, 3);
    var poorStates = sorted.slice(-3).reverse();

    var html = '<div class="de-card"><h3><i class="fas fa-ranking-star" style="color:#8B5CF6"></i> ' + ml + ' Rankings by ' + stateLabel + '</h3>';
    html += '<div class="de-grid de-grid-2">';

    /* Top States */
    html += '<div class="de-ranking"><h4>Top ' + stateLabel + 's by ' + ml + '</h4>';
    topStates.forEach(function (s, i) {
      html += '<div class="de-rank-item"><div class="de-rank-num top">' + (i + 1) + '</div>' +
        '<div class="de-rank-name">' + s.name + '</div><div class="de-rank-val">' + money(s.revenue) + '</div></div>';
    });
    html += '</div>';

    /* Poor States */
    html += '<div class="de-ranking"><h4>Poor ' + stateLabel + 's by ' + ml + '</h4>';
    poorStates.forEach(function (s, i) {
      html += '<div class="de-rank-item"><div class="de-rank-num poor">' + (i + 1) + '</div>' +
        '<div class="de-rank-name">' + s.name + '</div><div class="de-rank-val">' + money(s.revenue) + '</div></div>';
    });
    html += '</div></div>';

    /* City drill-down per state */
    html += '<div style="margin-top:14px">';
    states.forEach(function (s) {
      var topCity = s.cities.slice().sort(function (a, b) { return b.revenue - a.revenue; })[0];
      var poorCity = s.cities.slice().sort(function (a, b) { return a.revenue - b.revenue; })[0];
      html += '<div style="margin-bottom:12px;padding:12px;border-radius:10px;background:var(--card-alt,#f8fafc);border:1px solid var(--border,#e5e7eb)">' +
        '<div style="font-size:13px;font-weight:700;color:var(--text,#1e293b);margin-bottom:8px"><i class="fas fa-map-marker-alt" style="color:#22C55E;margin-right:4px"></i>' + s.name + '</div>' +
        '<div class="de-grid de-grid-2" style="gap:8px">' +
          '<div style="padding:8px 10px;border-radius:8px;background:#F0FDF4;border:1px solid #BBF7D0">' +
            '<div style="font-size:10px;font-weight:700;color:#166534;text-transform:uppercase">Top City</div>' +
            '<div style="font-size:13px;font-weight:700;color:#15803D;margin-top:2px">' + topCity.name + ' — ' + money(topCity.revenue) + '</div></div>' +
          '<div style="padding:8px 10px;border-radius:8px;background:#FEF2F2;border:1px solid #FECACA">' +
            '<div style="font-size:10px;font-weight:700;color:#991B1B;text-transform:uppercase">Lowest City</div>' +
            '<div style="font-size:13px;font-weight:700;color:#DC2626;margin-top:2px">' + poorCity.name + ' — ' + money(poorCity.revenue) + '</div></div>' +
        '</div></div>';
    });
    html += '</div></div>';
    return html;
  }

  /* ---- City-wise detail HTML ---- */
  function cityDetailHtml(stateName) {
    var states = geo().states;
    var state = null;
    states.forEach(function (s) { if (s.name === stateName) state = s; });
    if (!state) return '';

    var cityProds = {};
    state.cities.forEach(function (c) { cityProds[c.name] = cityProducts(c.name); });

    var html = '<div class="de-card" style="border-color:#3B82F644">' +
      '<h3><i class="fas fa-city" style="color:#3B82F6"></i> ' + stateName + ' — City-wise Product Performance</h3>';

    state.cities.forEach(function (c) {
      var prods = cityProds[c.name];
      var top = prods[0];
      var poor = prods[prods.length - 1];
      html += '<div style="margin-bottom:10px;padding:12px;border-radius:10px;background:var(--card-alt,#f8fafc);border:1px solid var(--border,#e5e7eb)">' +
        '<div style="font-size:13px;font-weight:700;color:var(--text,#1e293b);margin-bottom:6px">' + c.name +
          ' <span style="font-size:11px;color:var(--text-muted,#64748b);font-weight:500">(' + money(c.revenue) + ' revenue, ' + c.orders + ' orders)</span></div>' +
        '<div class="de-grid de-grid-2" style="gap:8px">' +
          '<div class="de-rank-item" style="border-color:#BBF7D0;background:#F0FDF4">' +
            '<div class="de-rank-num top">1</div>' +
            '<div class="de-rank-name">' + top.name + '</div>' +
            '<div class="de-rank-val">' + money(top.revenue) + '</div></div>' +
          '<div class="de-rank-item" style="border-color:#FECACA;background:#FEF2F2">' +
            '<div class="de-rank-num poor">!</div>' +
            '<div class="de-rank-name">' + poor.name + '</div>' +
            '<div class="de-rank-val">' + money(poor.revenue) + '</div></div>' +
        '</div></div>';
    });
    html += '</div>';
    return html;
  }

  /* ---- Compare Mode HTML ---- */
  function compareHtml() {
    var states = geo().states;
    var opts = states.map(function (s) { return '<option value="' + s.name + '">' + s.name + '</option>'; }).join('');
    return '<div class="de-card">' +
      '<h3><i class="fas fa-code-compare" style="color:#06B6D4"></i> Compare Mode</h3>' +
      '<div class="de-filter-bar">' +
        '<select id="deCmpA" class="de-select" onchange="DashEnhance.updateCompare()"><option value="">Select ' + geo().stateLabel + ' A</option>' + opts + '</select>' +
        '<span style="font-weight:700;color:var(--text-muted,#9CA3AF)">vs</span>' +
        '<select id="deCmpB" class="de-select" onchange="DashEnhance.updateCompare()"><option value="">Select ' + geo().stateLabel + ' B</option>' + opts + '</select>' +
      '</div>' +
      '<div id="deCompareResult"></div></div>';
  }

  function updateCompare() {
    var a = document.getElementById('deCmpA');
    var b = document.getElementById('deCmpB');
    var result = document.getElementById('deCompareResult');
    if (!a || !b || !result) return;
    if (!a.value || !b.value) { result.innerHTML = '<div class="de-empty">Select two ' + geo().stateLabel.toLowerCase() + 's to compare</div>'; return; }
    var states = geo().states;
    var sa = null, sb = null;
    states.forEach(function (s) { if (s.name === a.value) sa = s; if (s.name === b.value) sb = s; });
    if (!sa || !sb) return;
    var rows = [
      { label: 'Revenue', va: money(sa.revenue), vb: money(sb.revenue) },
      { label: 'Orders', va: sa.orders.toLocaleString(), vb: sb.orders.toLocaleString() },
      { label: 'AOV', va: money(sa.revenue / sa.orders), vb: money(sb.revenue / sb.orders) },
      { label: 'Growth', va: pct(sa.growth), vb: pct(sb.growth) },
      { label: 'Cities', va: sa.cities.length, vb: sb.cities.length }
    ];
    var html = '<div class="de-compare">' +
      '<div class="de-compare-col"><h4>' + sa.name + '</h4>' + rows.map(function (r) {
        return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border,#f1f5f9);font-size:12px"><span style="color:var(--text-muted,#64748b)">' + r.label + '</span><span style="font-weight:700;color:var(--text,#1e293b)">' + r.va + '</span></div>';
      }).join('') + '</div>' +
      '<div class="de-compare-col"><h4>' + sb.name + '</h4>' + rows.map(function (r) {
        return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border,#f1f5f9);font-size:12px"><span style="color:var(--text-muted,#64748b)">' + r.label + '</span><span style="font-weight:700;color:var(--text,#1e293b)">' + r.vb + '</span></div>';
      }).join('') + '</div></div>';
    result.innerHTML = html;
  }

  /* ---- Target vs Actual HTML ---- */
  function targetActualHtml() {
    var states = geo().states;
    var totalRev = states.reduce(function (s, x) { return s + x.revenue; }, 0);
    var totalOrd = states.reduce(function (s, x) { return s + x.orders; }, 0);
    var targets = [
      { label: 'Revenue', target: Math.round(totalRev * 1.2), actual: totalRev, unit: 'money' },
      { label: 'Orders', target: Math.round(totalOrd * 1.15), actual: totalOrd, unit: 'count' },
      { label: 'Customers', target: 350, actual: 248, unit: 'count' },
      { label: 'Avg Rating', target: 5.0, actual: 4.8, unit: 'rating' }
    ];
    return '<div class="de-card">' +
      '<h3><i class="fas fa-bullseye" style="color:#EF4444"></i> Target vs Actual</h3>' +
      targets.map(function (t) {
        var pctAchieved = Math.min(100, Math.round((t.actual / t.target) * 100));
        var remaining = t.unit === 'money' ? money(t.target - t.actual) : (t.target - t.actual);
        var color = pctAchieved >= 90 ? '#22C55E' : pctAchieved >= 60 ? '#F59E0B' : '#EF4444';
        return '<div class="de-target-row">' +
          '<div class="de-target-label">' + t.label + '</div>' +
          '<div class="de-target-vals">' +
            '<span style="color:#64748b">Target: ' + (t.unit === 'money' ? money(t.target) : t.target) + '</span>' +
            '<span style="color:' + color + '">Actual: ' + (t.unit === 'money' ? money(t.actual) : t.actual) + '</span>' +
            '<span style="color:' + color + ';font-weight:800">' + pctAchieved + '%</span>' +
          '</div>' +
          '<div style="width:120px"><div class="de-health-bar"><div class="de-health-fill" style="width:' + pctAchieved + '%;background:' + color + '"></div></div></div>' +
        '</div>';
      }).join('') + '</div>';
  }

  /* ---- Date Range Filter for Reports (enhanced) ---- */
  function dateRangeHtml() {
    var opts = ['Today','Last 7 Days','This Month','Last Month','This Quarter','This Year','All Time'];
    return '<div class="de-filter-bar">' +
      '<label style="font-size:12px;font-weight:600;color:var(--text-muted,#64748b)">Date Range:</label>' +
      '<select id="deDateRange" class="de-select" onchange="DashEnhance.onDateRange()">' +
      opts.map(function (o, i) { return '<option value="' + i + '"' + (i === 6 ? ' selected' : '') + '>' + o + '</option>'; }).join('') +
      '</select></div>';
  }

  /* ---- Export Functions ---- */
  function exportCSV() {
    var rows = [['Section','Metric','Value']];
    document.querySelectorAll('#view-reports .report-content[style*="block"] .data-table tbody tr').forEach(function (tr) {
      var cells = [];
      tr.querySelectorAll('td').forEach(function (td) { cells.push(td.textContent.trim()); });
      if (cells.length) rows.push(cells);
    });
    if (rows.length <= 1) {
      document.querySelectorAll('#view-reports .report-content[style*="block"] div[style*="font-size:22px"]').forEach(function (el) {
        var label = el.parentElement ? el.parentElement.querySelector('div') : null;
        rows.push(['KPI', label ? label.textContent.trim() : '', el.textContent.trim()]);
      });
    }
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + c.replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = COUNTRY + '_report_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  }

  function exportExcel() { exportCSV(); }

  function exportPDF() {
    var w = window.open('', '_blank');
    var content = document.querySelector('#view-reports .report-content[style*="block"]');
    if (!content) content = document.querySelector('#view-reports');
    w.document.write('<html><head><title>' + COUNTRY + ' Report</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#1e293b}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #e5e7eb;padding:8px 12px;text-align:left;font-size:13px}th{background:#166534;color:#fff}h1{color:#14532D}h2{color:#166534}</style></head><body>');
    w.document.write('<h1>VPNexues — ' + COUNTRY + '</h1>');
    w.document.write('<h2>Report — ' + new Date().toLocaleDateString() + '</h2>');
    w.document.write(content.innerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.print();
  }

  /* ---- Inject Dashboard Cards ---- */
  function injectDashboard() {
    var kpiGrid = document.querySelector('#view-dashboard .ds-kpi-grid');
    if (!kpiGrid || document.getElementById('deHealthCard')) return;

    /* Find the Sales Overview card inside a .grid-2 and insert Health card as its sibling */
    var placed = false;
    var grid2s = document.querySelectorAll('#view-dashboard .grid-2');
    for (var g = 0; g < grid2s.length; g++) {
      var cards = grid2s[g].querySelectorAll('.card');
      for (var c = 0; c < cards.length; c++) {
        var hdr = cards[c].querySelector('.card-header h3');
        if (hdr && /sales overview/i.test(hdr.textContent)) {
          var healthDiv = document.createElement('div');
          healthDiv.id = 'deHealthCard';
          healthDiv.className = 'card';
          healthDiv.style.padding = '0';
          healthDiv.innerHTML = healthHtml();
          cards[c].parentElement.insertBefore(healthDiv, cards[c].nextSibling);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    /* Fallback: if no Sales Overview grid found, place after KPI grid */
    if (!placed) {
      var healthDiv = document.createElement('div');
      healthDiv.id = 'deHealthCard';
      healthDiv.style.gridColumn = '1 / -1';
      healthDiv.innerHTML = healthHtml();
      kpiGrid.parentElement.insertBefore(healthDiv, kpiGrid);
    }

  }

  /* ==== Deep Dive State ==== */
  var DD_STATE = null, DD_CITY = null, DD_RANGE = 'all';
  var DD_RF = { all: 1, today: 0.045, '7d': 0.24, '30d': 0.62, '6m': 0.86, '1y': 1 };

  /* ---- Deep Dive helpers ---- */
  function ddFmt(v) {
    var cur = geo().currency || '$';
    var digits = (COUNTRY === 'India') ? 0 : 2;
    var val = digits === 0 ? Math.round(v) : Math.round(v * 100) / 100;
    return cur + val.toLocaleString(undefined, { maximumFractionDigits: digits });
  }

  function ddGetLoc() {
    if (!DD_STATE || !DD_CITY) return null;
    var states = geo().states;
    var st = null;
    states.forEach(function (s) { if (s.name === DD_STATE) st = s; });
    if (!st) return null;
    var city = null;
    st.cities.forEach(function (c) { if (c.name === DD_CITY) city = c; });
    if (!city) return null;
    return { state: st, city: city };
  }

  function ddProductsForLoc(stateName, cityName) {
    var prods = stateProducts(stateName);
    return prods.map(function (p) {
      var cityScale = 0.15 + (h(cityName + p.name + 'cs') % 40) / 100;
      return { name: p.name, revenue: Math.round(p.revenue * cityScale), orders: Math.round(p.orders * cityScale) };
    }).sort(function (a, b) { return b.revenue - a.revenue; });
  }

  function ddTrendBars(cityRev) {
    var now = new Date();
    var labels = [];
    for (var i = 5; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString('en', { month: 'short' }));
    }
    var factors = [0.72, 0.81, 0.88, 0.93, 0.96, 1.0];
    var max = 0;
    var bars = labels.map(function (label, i) {
      var rev = Math.round(cityRev * factors[i]);
      if (rev > max) max = rev;
      return { label: label, revenue: rev };
    });
    bars.forEach(function (b) { b.pct = max ? Math.round(b.revenue / max * 100) : 0; });
    return bars;
  }

  /* ---- Render Deep Dive ---- */
  function renderDeepDive() {
    var el = document.getElementById('report-deepdive');
    if (!el) return;

    /* ---- Build custom dropdown ---- */
    var triggerLabel = DD_STATE && DD_CITY ? (DD_CITY + ' \u2014 selected') : 'Select State / City...';
    var panelHtml = '<div class="dd-loc-wrap">';
    panelHtml += '<div class="dd-loc-sel" id="ddLocTrigger" onclick="DashEnhance.toggleDropdown()"><span id="ddLocTriggerTxt">' + triggerLabel + '</span><i class="fas fa-chevron-down"></i></div>';
    panelHtml += '<div class="dd-loc-panel" id="ddLocPanel">';
    geo().states.forEach(function (s) {
      var stateRev = s.revenue || 0;
      panelHtml += '<div class="dd-loc-state-hdr">' + s.name + ' (' + ddFmt(stateRev) + ')</div>';
      panelHtml += '<div class="dd-loc-all" onclick="DashEnhance.ddSelect(\'' + s.name + '|' + s.cities[0].name + '\')">' + s.name + ' \u2014 All State</div>';
      s.cities.forEach(function (c) {
        var isActive = (s.name === DD_STATE && c.name === DD_CITY);
        panelHtml += '<div class="dd-loc-copt' + (isActive ? ' active' : '') + '" onclick="DashEnhance.ddSelect(\'' + s.name + '|' + c.name + '\')">';
        panelHtml += '<span class="dd-loc-copt-name">' + c.name + '</span>';
        panelHtml += '<span class="dd-loc-copt-stats">' + c.orders + ' orders, ' + ddFmt(c.revenue) + '</span>';
        panelHtml += '</div>';
      });
    });
    panelHtml += '</div></div>';

    /* ---- Green header ---- */
    var h = '';
    h += '<div class="dd-header">';
    h += '<div class="dd-header-left"><h2><i class="fas fa-globe" style="color:#fff"></i> Region Deep Dive</h2>';
    h += '<p>Pick a state or city to view detailed value performance \u2014 products, orders, revenue, growth, customers, inventory &amp; subscribers</p></div>';
    h += '<div class="dd-header-right">' + panelHtml + '</div>';
    h += '</div>';

    /* ---- Empty state (no city selected) ---- */
    var loc = ddGetLoc();
    if (!loc) {
      h += '<div style="background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-top:none;border-radius:0 0 14px 14px;padding:60px 20px;text-align:center">';
      h += '<div class="dd-empty-icon"><i class="fa-regular fa-hand-pointer" style="color:#d1d5db"></i></div>';
      h += '<div class="dd-empty-msg">Select a state or city from the dropdown above to view its complete details</div>';
      h += '</div>';
      el.innerHTML = h;
      return;
    }

    var st = loc.state, c = loc.city;
    var factor = DD_RF[DD_RANGE] || 1;

    var rev = Math.round(c.revenue * factor);
    var ord = Math.round(c.orders * factor);
    var growth = c.growth;
    var units = Math.round(c.units * factor);
    var cust = Math.round(c.customers * factor);
    var subs = Math.round(c.subscribers * factor);
    var del = Math.round(c.delivered * factor);
    var transit = Math.round(c.inTransit * factor);
    var cancel = Math.round(c.cancelled * factor);
    var newC = Math.round(c.newCustomers * factor);
    var repC = Math.round(c.repeatCustomers * factor);
    var retRate = c.retentionRate;
    var actSub = Math.round(c.activeSubs * factor);
    var unSub = Math.round(c.unsubscribed * factor);
    var aov = ord ? Math.round(rev / ord) : 0;
    var revPerCust = cust ? Math.round(rev / cust) : 0;

    var prods = ddProductsForLoc(st.name, c.name);
    var top5 = prods.slice(0, 5);
    var poor5 = prods.slice(-5).reverse();
    var topRevSum = top5.reduce(function (a, p) { return a + p.revenue; }, 0);

    var lowStock = prods.filter(function (p) { return p.orders > 0 && p.orders < 8; }).slice(0, 4);
    var highStock = prods.filter(function (p) { return p.orders >= 30; }).slice(0, 4);
    var totalStock = prods.reduce(function (a, p) { return a + p.orders * 3; }, 0);

    var trend = ddTrendBars(rev);

    var gArrow = growth >= 0 ? '\u2197' : '\u2198';
    var gColor = growth >= 0 ? '#22C55E' : '#EF4444';

    /* ---- Location header ---- */
    h += '<div style="background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-top:none;border-radius:0 0 14px 14px;padding:16px 22px">';
    h += '<div class="dd-loc">';
    h += '<div class="dd-loc-left"><span class="dd-loc-city">' + c.name + '</span><span class="dd-loc-state">' + st.name + '</span>';
    h += '<p class="dd-loc-sub">Complete revenue performance details for ' + c.name + '</p></div>';
    h += '<div class="dd-loc-growth" style="color:' + gColor + '">' + gArrow + ' ' + Math.abs(growth).toFixed(1) + '% growth</div>';
    h += '</div></div>';

    /* ---- 6 KPI Cards ---- */
    h += '<div class="dd-grid-6">';
    var revIcon = COUNTRY === 'India' ? 'fa-indian-rupee-sign' : COUNTRY === 'US' ? 'fa-dollar-sign' : COUNTRY === 'Singapore' ? 'fa-dollar-sign' : 'fa-coins';
    h += '<div class="dd-kpi-c"><div class="dd-kpi-icon" style="color:#166534"><i class="fas ' + revIcon + '"></i></div><div class="dd-kpi-lbl">REVENUE</div><div class="dd-kpi-val">' + ddFmt(rev) + '</div><div class="dd-kpi-sub">total collected</div></div>';
    h += '<div class="dd-kpi-c"><div class="dd-kpi-icon" style="color:#166534"><i class="fas fa-shopping-cart"></i></div><div class="dd-kpi-lbl">ORDERS</div><div class="dd-kpi-val">' + ord.toLocaleString() + '</div><div class="dd-kpi-sub">' + del + ' delivered</div></div>';
    h += '<div class="dd-kpi-c"><div class="dd-kpi-icon" style="color:#166534"><i class="fas fa-arrow-trend-up"></i></div><div class="dd-kpi-lbl">GROWTH</div><div class="dd-kpi-val" style="color:' + gColor + '">' + growth.toFixed(1) + '%</div><div class="dd-kpi-sub">vs last month</div></div>';
    h += '<div class="dd-kpi-c"><div class="dd-kpi-icon" style="color:#166534"><i class="fas fa-box"></i></div><div class="dd-kpi-lbl">UNITS SOLD</div><div class="dd-kpi-val">' + units.toLocaleString() + '</div><div class="dd-kpi-sub">across all products</div></div>';
    h += '<div class="dd-kpi-c"><div class="dd-kpi-icon" style="color:#166534"><i class="fas fa-users"></i></div><div class="dd-kpi-lbl">CUSTOMERS</div><div class="dd-kpi-val">' + cust.toLocaleString() + '</div><div class="dd-kpi-sub">' + newC + ' new</div></div>';
    h += '<div class="dd-kpi-c"><div class="dd-kpi-icon" style="color:#166534"><i class="fas fa-user-check"></i></div><div class="dd-kpi-lbl">SUBSCRIBERS</div><div class="dd-kpi-val">' + subs.toLocaleString() + '</div><div class="dd-kpi-sub">' + actSub + ' active</div></div>';
    h += '</div>';

    /* ---- 4 Detail Cards ---- */
    h += '<div class="dd-grid-4">';

    h += '<div class="dd-info-card"><h4><i class="fas fa-truck" style="color:#166534"></i> Orders &amp; Fulfilment</h4>';
    h += '<div class="dd-info-row"><span>Total Orders</span><span style="font-weight:700">' + ord.toLocaleString() + '</span></div>';
    h += '<div class="dd-info-row"><span>Delivered</span><span style="color:#16A34A;font-weight:700">' + del.toLocaleString() + '</span></div>';
    h += '<div class="dd-info-row"><span>In Transit</span><span style="color:#F59E0B;font-weight:700">' + transit.toLocaleString() + '</span></div>';
    h += '<div class="dd-info-row"><span>Cancelled</span><span style="color:#EF4444;font-weight:700">' + cancel.toLocaleString() + '</span></div>';
    h += '<div class="dd-info-row"><span>Avg Order Value</span><span style="font-weight:700">' + ddFmt(aov) + '</span></div></div>';

    h += '<div class="dd-info-card"><h4><i class="fas fa-shopping-bag" style="color:#166534"></i> Sales</h4>';
    h += '<div class="dd-info-row"><span>Units Sold</span><span style="font-weight:700">' + units.toLocaleString() + '</span></div>';
    h += '<div class="dd-info-row"><span>Sales Revenue</span><span style="font-weight:700">' + ddFmt(rev) + '</span></div>';
    h += '<div class="dd-info-row"><span>Best Seller</span><span style="font-size:11px;font-weight:700">' + (prods[0] ? prods[0].name : '-') + '</span></div>';
    var cats = {}; prods.forEach(function (p) { cats[p.name] = 1; });
    h += '<div class="dd-info-row"><span>Categories Sold</span><span style="font-weight:700">' + Object.keys(cats).length + '</span></div>';
    h += '<div class="dd-info-row"><span>Sales Growth</span><span style="color:' + gColor + ';font-weight:700">' + pct(growth) + '</span></div></div>';

    h += '<div class="dd-info-card"><h4><i class="fas fa-users" style="color:#166534"></i> Customers</h4>';
    h += '<div class="dd-info-row"><span>Total Customers</span><span style="font-weight:700">' + cust.toLocaleString() + '</span></div>';
    h += '<div class="dd-info-row"><span>New Customers</span><span style="color:#16A34A;font-weight:700">' + newC.toLocaleString() + '</span></div>';
    h += '<div class="dd-info-row"><span>Repeat Customers</span><span style="font-weight:700">' + repC.toLocaleString() + '</span></div>';
    h += '<div class="dd-info-row"><span>Retention Rate</span><span style="font-weight:700">' + retRate + '%</span></div>';
    h += '<div class="dd-info-row"><span>Revenue / Customer</span><span style="font-weight:700">' + ddFmt(revPerCust) + '</span></div></div>';

    h += '<div class="dd-info-card"><h4><i class="fas fa-bell" style="color:#166534"></i> Subscribers</h4>';
    h += '<div class="dd-info-row"><span>Total Subscribers</span><span style="font-weight:700">' + subs.toLocaleString() + '</span></div>';
    h += '<div class="dd-info-row"><span>Active</span><span style="color:#16A34A;font-weight:700">' + actSub.toLocaleString() + '</span></div>';
    h += '<div class="dd-info-row"><span>Unsubscribed</span><span style="color:#EF4444;font-weight:700">' + unSub.toLocaleString() + '</span></div>';
    var subRate = subs ? Math.round(actSub / subs * 100) : 0;
    h += '<div class="dd-info-row"><span>Retention Rate</span><span style="font-weight:700">' + subRate + '%</span></div>';
    h += '<div class="dd-info-row"><span>Active Rate</span><span style="font-weight:700">' + subRate + '%</span></div></div>';

    h += '</div>';

    /* ---- Top & Poor Revenue Products ---- */
    h += '<div class="dd-grid-2">';

    h += '<div class="dd-card"><h3><i class="fas fa-trophy" style="color:#F59E0B"></i> TOP REVENUE PRODUCTS</h3>';
    h += '<table class="dd-table"><thead><tr><th>#</th><th>PRODUCT</th><th>CATEGORY</th><th>REVENUE</th><th>SHARE</th></tr></thead><tbody>';
    top5.forEach(function (p, i) {
      var share = topRevSum ? Math.round(p.revenue / topRevSum * 100) : 0;
      h += '<tr><td>' + (i + 1) + '</td><td style="font-weight:600">' + p.name + '</td><td><span class="dd-cat-tag">' + pick(['Vegetables', 'Fruits', 'Grains', 'Spices', 'Oils'], p.name) + '</span></td><td style="font-weight:600">' + ddFmt(p.revenue) + '</td><td><span class="dd-share">' + share + '%</span></td></tr>';
    });
    h += '</tbody></table></div>';

    h += '<div class="dd-card"><h3><i class="fas fa-arrow-down" style="color:#EF4444"></i> POOR REVENUE PRODUCTS</h3>';
    h += '<table class="dd-table"><thead><tr><th>#</th><th>PRODUCT</th><th>CATEGORY</th><th>REVENUE</th><th>STATUS</th></tr></thead><tbody>';
    poor5.forEach(function (p, i) {
      var isSlow = p.orders < 5;
      var status = isSlow ? 'Slow Moving' : 'Low Demand';
      h += '<tr><td>' + (i + 1) + '</td><td style="font-weight:600">' + p.name + '</td><td><span class="dd-cat-tag">' + pick(['Vegetables', 'Fruits', 'Grains', 'Spices', 'Oils'], p.name) + '</span></td><td style="font-weight:600">' + ddFmt(p.revenue) + '</td><td><span class="dd-status-slow">' + status + '</span></td></tr>';
    });
    h += '</tbody></table></div>';
    h += '</div>';

    /* ---- Inventory & Trend side-by-side ---- */
    h += '<div class="dd-grid-2">';

    /* ---- Inventory card ---- */
    h += '<div class="dd-card">';
    h += '<h3><i class="fas fa-warehouse" style="color:#166534"></i> INVENTORY <span class="dd-inv-badge dd-inv-badge-high">RESTOCK: HIGH</span></h3>';
    h += '<div style="display:flex;gap:20px;margin-bottom:16px">';
    h += '<div style="flex:1"><div class="dd-inv-title" style="color:#EF4444"><i class="fas fa-exclamation-triangle"></i> LOW STOCK</div>';
    lowStock.forEach(function (p) {
      h += '<div class="dd-inv-row"><span class="dd-inv-name">' + p.name + '</span><span class="dd-inv-left dd-inv-left-red">' + p.orders + ' left</span></div>';
    });
    if (!lowStock.length) h += '<div class="dd-inv-row"><span class="dd-inv-name" style="color:#94A3B8">All products well-stocked</span></div>';
    h += '</div>';
    h += '<div style="flex:1"><div class="dd-inv-title" style="color:#16A34A"><i class="fas fa-circle" style="font-size:8px"></i> HIGH STOCK</div>';
    highStock.forEach(function (p) {
      h += '<div class="dd-inv-row"><span class="dd-inv-name">' + p.name + '</span><span style="font-weight:600;font-size:12px">' + p.orders + ' units</span></div>';
    });
    if (!highStock.length) h += '<div class="dd-inv-row"><span class="dd-inv-name" style="color:#94A3B8">No high-stock items</span></div>';
    h += '</div></div>';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border,#f1f5f9)">';
    h += '<span style="font-size:12px;color:var(--text-muted,#64748b);font-weight:600">Total Stock Units</span>';
    h += '<span style="font-size:22px;font-weight:800;color:var(--text,#1e293b)">' + totalStock.toLocaleString() + '</span>';
    h += '</div></div>';

    /* ---- 6-Month Revenue Trend card ---- */
    h += '<div class="dd-card">';
    h += '<h3><i class="fas fa-chart-bar" style="color:#166534"></i> 6-MONTH REVENUE TREND</h3>';
    h += '<div class="dd-trend">';
    trend.forEach(function (t) {
      h += '<div class="dd-trend-col">';
      h += '<div class="dd-trend-val">' + ddFmt(t.revenue) + '</div>';
      h += '<div class="dd-trend-bar-wrap"><div class="dd-trend-bar" style="height:' + t.pct + '%"></div></div>';
      h += '<div class="dd-trend-label">' + t.label + '</div>';
      h += '</div>';
    });
    h += '</div></div>';

    h += '</div>'; /* end dd-grid-2 */

    el.innerHTML = h;

    /* Update dropdown trigger text */
    var triggerTxt = document.getElementById('ddLocTriggerTxt');
    if (triggerTxt) {
      triggerTxt.textContent = c.name + ' \u2014 ' + ord.toLocaleString() + ' orders, ' + ddFmt(rev);
    }
    /* Close panel */
    var panel = document.getElementById('ddLocPanel');
    if (panel) panel.classList.remove('open');
  }

  /* ---- Toggle dropdown ---- */
  function toggleDropdown() {
    var panel = document.getElementById('ddLocPanel');
    if (panel) panel.classList.toggle('open');
  }

  /* ---- Close dropdown on outside click ---- */
  function ddHandleOutsideClick(e) {
    var wrap = document.querySelector('.dd-loc-wrap');
    var panel = document.getElementById('ddLocPanel');
    if (wrap && panel && !wrap.contains(e.target)) {
      panel.classList.remove('open');
    }
  }

  /* ---- Deep Dive combined handler ---- */
  function ddSelect(val) {
    if (!val) {
      DD_STATE = null;
      DD_CITY = null;
      renderDeepDive();
      return;
    }
    var parts = val.split('|');
    DD_STATE = parts[0];
    DD_CITY = parts[1];
    renderDeepDive();
  }

  function ddSetRange(range) {
    DD_RANGE = range;
    renderDeepDive();
  }

  /* ---- Inject Report Enhancements ---- */
  function injectReports() {
    var reportsView = document.getElementById('view-reports');
    if (!reportsView) return;

    var deepDive = document.getElementById('report-deepdive');
    if (deepDive && !deepDive.getAttribute('data-dd-init')) {
      deepDive.setAttribute('data-dd-init', '1');
      renderDeepDive();
    }

    /* Enhance existing export buttons */
    var exportBtns = reportsView.querySelectorAll('button[onclick*="exportReport"]');
    exportBtns.forEach(function (btn) {
      var fmt = btn.getAttribute('onclick').match(/'(\w+)'/);
      if (fmt) {
        btn.onclick = function () {
          if (fmt[1] === 'csv') exportCSV();
          else if (fmt[1] === 'excel') exportExcel();
          else if (fmt[1] === 'pdf') exportPDF();
        };
      }
    });
  }

  /* ---- Inject Theme Toggle into Topbar ---- */
  function injectThemeToggle() {
    var topbar = document.querySelector('.topbar-right');
    if (!topbar || document.getElementById('deThemeBtn')) return;
    var btn = document.createElement('div');
    btn.innerHTML = themeToggleHtml();
    topbar.insertBefore(btn, topbar.firstChild);
  }

  /* ---- State filter handler ---- */
  function onStateFilter() {
    var sel = document.getElementById('deStateFilter');
    var citySel = document.getElementById('deCityFilter');
    if (!sel) return;
    var stateName = sel.value;
    var states = geo().states;
    var state = null;
    states.forEach(function (s) { if (s.name === stateName) state = s; });

    if (citySel) {
      if (state) {
        citySel.innerHTML = '<option value="">All Cities</option>' + state.cities.map(function (c) { return '<option value="' + (c.name || c) + '">' + (c.name || c) + '</option>'; }).join('');
      } else {
        citySel.innerHTML = '<option value="">Select ' + geo().stateLabel + ' first</option>';
      }
    }

    var content = document.getElementById('deGeoContent');
    var cityDetail = document.getElementById('deCityDetail');
    if (content) {
      if (stateName) {
        content.innerHTML = geoRankingsHtml('revenue');
      } else {
        content.innerHTML = geoRankingsHtml('revenue');
      }
    }
    if (cityDetail) cityDetail.innerHTML = '';
  }

  /* ---- City filter handler ---- */
  function onCityFilter() {
    var stateSel = document.getElementById('deStateFilter');
    var citySel = document.getElementById('deCityFilter');
    var cityDetail = document.getElementById('deCityDetail');
    if (!stateSel || !cityDetail) return;
    var stateName = stateSel.value;
    var cityName = citySel ? citySel.value : '';
    if (stateName) {
      cityDetail.innerHTML = cityDetailHtml(stateName);
    } else {
      cityDetail.innerHTML = '';
    }
  }

  /* ---- Date range handler ---- */
  function onDateRange() {
    var sel = document.getElementById('deDateRange');
    if (!sel) return;
    var factors = [0.045, 0.24, 0.5, 0.45, 0.65, 0.92, 1];
    var f = factors[parseInt(sel.value)] || 1;
    var ranges = ['today', '7d', '30d', '30d', '6m', '1y', 'all'];
    var range = ranges[parseInt(sel.value)] || 'all';
    ddSetRange(range);
    if (typeof window.applyReportDateFilter === 'function') {
      window.applyReportDateFilter(range);
    }
  }

  /* ---- Theme Toggle ---- */
  function toggleTheme() {
    var html = document.documentElement;
    var current = html.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { }
    var icon = document.getElementById('deThemeIcon');
    var label = document.getElementById('deThemeLabel');
    if (icon) icon.className = 'fas ' + (next === 'dark' ? 'fa-sun' : 'fa-moon');
    if (label) label.textContent = next === 'dark' ? 'Light' : 'Dark';
  }

  function loadTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved) document.documentElement.setAttribute('data-theme', saved);
    } catch (e) { }
  }

  /* ---- Init ---- */
  function init(country) {
    if (country) COUNTRY = country;
    enrichGeo();
    loadTheme();

    /* Inject CSS */
    if (!document.getElementById('de-style')) {
      var s = document.createElement('style');
      s.id = 'de-style';
      s.textContent = CSS;
      document.head.appendChild(s);
    }

    /* Close dropdown on outside click */
    document.addEventListener('click', ddHandleOutsideClick);

    /* Wrap native applyReportDateFilter so the Deep Dive also re-renders
       with date-range-scaled values. */
    if (typeof window.applyReportDateFilter === 'function' && !window.__ddDateWrapped) {
      window.__ddDateWrapped = true;
      var _origDateFilter = window.applyReportDateFilter;
      window.applyReportDateFilter = function (range) {
        ddSetRange(range || 'all');
        try { _origDateFilter(range); } catch (e) { }
      };
    }

    /* Inject dashboard cards */
    injectDashboard();

    /* Inject report enhancements */
    injectReports();
  }

  return {
    init: init,
    toggleTheme: toggleTheme,
    updateCompare: updateCompare,
    ddSelect: ddSelect,
    toggleDropdown: toggleDropdown,
    ddSetRange: ddSetRange,
    onDateRange: onDateRange,
    renderDeepDive: renderDeepDive,
    exportCSV: exportCSV,
    exportExcel: exportExcel,
    exportPDF: exportPDF,
    setCountry: function (c) { COUNTRY = c; },
    getCountry: function () { return COUNTRY; }
  };
})();
