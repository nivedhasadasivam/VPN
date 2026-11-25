/* VPNexues StateBreakdown
 * Adds state/city-wise detail tables to every Reports & Analytics section
 * (overview, revenue, sales, orders, products, customers, inventory,
 * subscribers) in all sub-admin dashboards.
 * Data is derived deterministically from GeoReport's per-country
 * state/city dataset so numbers stay consistent across sections.
 */
window.StateBreakdown = (function () {
  'use strict';

  var country = 'India';

  /* ---- helpers ---- */
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function data() {
    if (!window.GeoReport || !GeoReport.getData) return null;
    var d = GeoReport.getData();
    return d ? (d[country] || d.India) : null;
  }

  function money(n) {
    var d = data() || {};
    var cur = d.currency || '$';
    var grp = d.group || 'en-US';
    return cur + Number(n).toLocaleString(grp, { maximumFractionDigits: 0 });
  }

  function num(n) {
    return Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function growthCls(g) {
    return g >= 10 ? 'sbd-pos' : (g >= 5 ? 'sbd-mid' : 'sbd-neg');
  }

  function products() {
    try {
      if (window.CategoryProducts && CategoryProducts.getProducts) {
        var p = CategoryProducts.getProducts();
        if (p && p.length) return p;
      }
    } catch (e) {}
    return [
      { name: 'Organic Vegetables Box', cat: 'Vegetables' },
      { name: 'Fresh Fruits Box', cat: 'Fruits' },
      { name: 'Organic Greens Pack', cat: 'Vegetables' },
      { name: 'Farm Eggs Tray', cat: 'Dairy & Eggs' },
      { name: 'Whole Grains Pack', cat: 'Grains' },
      { name: 'Exotic Fruits Box', cat: 'Fruits' }
    ];
  }

  /* ---- derived metrics per state ---- */
  var curTab = 'overview';

  function topCities(s, n) {
    return (s.cities || []).slice().sort(function (a, b) { return b.revenue - a.revenue; }).slice(0, n || 3);
  }

  function cityMetric(c) {
    return metrics({ name: c.name + '::' + curTab, orders: c.orders, revenue: c.revenue });
  }

  function chipHtml(c) {
    var m = cityMetric(c);
    var val;
    switch (curTab) {
      case 'sales': val = num(m.units) + ' sold'; break;
      case 'orders': val = num(m.delivered) + ' delivered'; break;
      case 'products': val = num(m.units) + ' sold'; break;
      case 'customers': val = num(m.customers) + ' customers'; break;
      case 'inventory': val = num(m.stockUnits) + ' units'; break;
      case 'subscribers': val = num(m.subs) + ' subs'; break;
      default: val = money(c.revenue);
    }
    return '<span class="sbd-chip">' + esc(c.name) + ' \u00B7 ' + val + '</span>';
  }

  function cityChips(s) {
    return '<div class="sbd-chips">' + topCities(s).map(chipHtml).join('') + '</div>';
  }

  function rankHtml(idx) {
    if (idx === 0) return '<span class="sbd-rank sbd-rank-1">\uD83E\uDD47 1</span>';
    if (idx === 1) return '<span class="sbd-rank sbd-rank-2">\uD83E\uDD48 2</span>';
    if (idx === 2) return '<span class="sbd-rank sbd-rank-3">\uD83E\uDD49 3</span>';
    return '<span class="sbd-rank">' + (idx + 1) + '</span>';
  }

  function metrics(s) {
    var h = hash(s.name);
    var m = {};
    m.units = Math.round(s.orders * (2.4 + (h % 40) / 100));
    m.customers = Math.round(s.orders * 0.72);
    m.newCust = Math.round(m.customers * (0.28 + (h % 15) / 100));
    m.repeatCust = m.customers - m.newCust;
    m.delivered = Math.round(s.orders * (0.78 + (h % 12) / 100));
    m.transit = Math.round(s.orders * (0.05 + (h % 5) / 100));
    m.cancelled = Math.max(0, s.orders - m.delivered - m.transit);
    m.subs = Math.round(s.orders * 0.4);
    m.subsActive = Math.round(m.subs * (0.8 + (h % 12) / 100));
    m.subsUnsub = m.subs - m.subsActive;
    m.stockUnits = Math.round(s.orders * (4.5 + (h % 25) / 10));
    m.lowStock = 2 + (h % 7);
    m.reorder = h % 3 === 0 ? 'High' : (h % 3 === 1 ? 'Medium' : 'Low');
    var ps = products();
    m.topProduct = ps[hash(s.name + '::prod') % ps.length];
    m.aov = s.orders ? Math.round(s.revenue / s.orders) : 0;
    var avgPrice = 0;
    if (ps.length) {
      var sum = 0;
      ps.forEach(function (p) { sum += parsePrice(p.price); });
      avgPrice = sum / ps.length;
    }
    if (!avgPrice) avgPrice = m.aov || 100;
    m.salesRevenue = Math.round(m.units * avgPrice);
    m.ordersValue = m.delivered * m.aov;
    m.lostValue = m.cancelled * m.aov;
    m.productRevenue = Math.round(m.units * 0.34 * (parsePrice(m.topProduct.price) || avgPrice));
    m.stockValue = Math.round(m.stockUnits * avgPrice * 0.62);
    m.revPerCust = m.customers ? Math.round(s.revenue / m.customers) : 0;
    return m;
  }

  /* ---- section definitions ---- */
  var SECTIONS = {
    overview: {
      title: 'State-wise Overview', icon: 'fa-globe',
      sub: function (d) { return 'Complete performance across all ' + (d.plural || 'States').toLowerCase() + ' and key cities'; },
      sortVal: function (s, m) { return s.revenue; },
      cols: function (d) { return ['Region', 'Revenue', 'Orders', 'Growth', 'Top Cities']; },
      row: function (s, m, total) {
        return [
          '<span class="sbd-state">' + esc(s.name) + '</span>',
          '<strong>' + money(s.revenue) + '</strong>',
          num(s.orders),
          '<span class="' + growthCls(s.growth) + '">' + s.growth + '%</span>',
          cityChips(s)
        ];
      }
    },
    revenue: {
      title: 'Revenue by State', icon: 'fa-coins',
      sub: function (d) { return 'Revenue contribution and share of every ' + (d.label || 'State').toLowerCase(); },
      sortVal: function (s, m) { return s.revenue; },
      cols: function (d) { return ['Region', 'Revenue', 'Share', 'Growth', 'Top Cities']; },
      row: function (s, m, total) {
        var share = total ? Math.round(s.revenue / total * 100) : 0;
        return [
          '<span class="sbd-state">' + esc(s.name) + '</span>',
          '<strong>' + money(s.revenue) + '</strong>',
          '<div style="display:flex;align-items:center;gap:8px"><div class="sbd-bar"><span style="width:' + share + '%"></span></div><span style="font-weight:700">' + share + '%</span></div>',
          '<span class="' + growthCls(s.growth) + '">' + s.growth + '%</span>',
          cityChips(s)
        ];
      }
    },
    sales: {
      title: 'Sales by State', icon: 'fa-cart-shopping',
      sub: function (d) { return 'Units sold, order value and sales trend per ' + (d.label || 'State').toLowerCase(); },
      sortVal: function (s, m) { return m.units; },
      cols: function (d) { return ['Region', 'Units Sold', 'Sales Revenue', 'Avg Order Value', 'Growth', 'Top Cities']; },
      row: function (s, m) {
        return [
          '<span class="sbd-state">' + esc(s.name) + '</span>',
          num(m.units),
          '<strong>' + money(m.salesRevenue) + '</strong>',
          money(m.aov),
          '<span class="' + growthCls(s.growth) + '">' + s.growth + '%</span>',
          cityChips(s)
        ];
      }
    },
    orders: {
      title: 'Orders by State', icon: 'fa-box',
      sub: function (d) { return 'Order volume and fulfilment status across every ' + (d.label || 'State').toLowerCase(); },
      sortVal: function (s, m) { return s.orders; },
      cols: function (d) { return ['Region', 'Orders', 'Delivered', 'In Transit', 'Cancelled', 'Orders Value', 'Lost Revenue', 'Top Cities']; },
      row: function (s, m) {
        return [
          '<span class="sbd-state">' + esc(s.name) + '</span>',
          num(s.orders),
          '<span class="sbd-pos">' + num(m.delivered) + '</span>',
          '<span class="sbd-mid">' + num(m.transit) + '</span>',
          '<span class="sbd-neg">' + num(m.cancelled) + '</span>',
          '<strong>' + money(m.ordersValue) + '</strong>',
          '<span class="sbd-neg">' + money(m.lostValue) + '</span>',
          cityChips(s)
        ];
      }
    },
    products: {
      title: 'Top Products by State', icon: 'fa-basket-shopping',
      sub: function (d) { return 'Best selling products and categories in each ' + (d.label || 'State').toLowerCase(); },
      sortVal: function (s, m) { return m.units; },
      cols: function (d) { return ['Region', 'Top Product', 'Category', 'Units Sold', 'Product Revenue', 'Top Cities']; },
      row: function (s, m) {
        return [
          '<span class="sbd-state">' + esc(s.name) + '</span>',
          esc(m.topProduct.name),
          '<span class="sbd-chip">' + esc(m.topProduct.cat || 'General') + '</span>',
          num(m.units),
          '<strong>' + money(m.productRevenue) + '</strong>',
          cityChips(s)
        ];
      }
    },
    customers: {
      title: 'Customers by State', icon: 'fa-users',
      sub: function (d) { return 'Customer base, new vs repeat split per ' + (d.label || 'State').toLowerCase(); },
      sortVal: function (s, m) { return m.customers; },
      cols: function (d) { return ['Region', 'Customers', 'New', 'Repeat', 'Retention', 'Revenue / Customer', 'Top Cities']; },
      row: function (s, m) {
        var retention = Math.round(m.repeatCust / Math.max(1, m.customers) * 100);
        return [
          '<span class="sbd-state">' + esc(s.name) + '</span>',
          num(m.customers),
          '<span class="sbd-pos">+' + num(m.newCust) + '</span>',
          num(m.repeatCust),
          '<strong>' + retention + '%</strong>',
          money(m.revPerCust),
          cityChips(s)
        ];
      }
    },
    inventory: {
      title: 'Inventory by State', icon: 'fa-warehouse',
      sub: function (d) { return 'Stock levels and restock priority across every ' + (d.label || 'State').toLowerCase(); },
      sortVal: function (s, m) { return m.stockUnits; },
      cols: function (d) { return ['Region', 'Stock Units', 'Stock Value', 'Low Stock Items', 'Restock Priority', 'Top Cities']; },
      row: function (s, m) {
        var pill = m.reorder === 'High' ? 'sbd-pill-red' : (m.reorder === 'Medium' ? 'sbd-pill-amber' : 'sbd-pill-green');
        return [
          '<span class="sbd-state">' + esc(s.name) + '</span>',
          num(m.stockUnits),
          '<strong>' + money(m.stockValue) + '</strong>',
          '<span class="sbd-mid">' + m.lowStock + ' items</span>',
          '<span class="sbd-pill ' + pill + '">' + m.reorder + '</span>',
          cityChips(s)
        ];
      }
    },
    subscribers: {
      title: 'Subscribers by State', icon: 'fa-user-check',
      sub: function (d) { return 'Page subscribers and opt-outs in every ' + (d.label || 'State').toLowerCase(); },
      sortVal: function (s, m) { return m.subs; },
      cols: function (d) { return ['Region', 'Subscribers', 'Active', 'Unsubscribed', 'Active Rate', 'Top Cities']; },
      row: function (s, m) {
        var rate = Math.round(m.subsActive / Math.max(1, m.subs) * 100);
        return [
          '<span class="sbd-state">' + esc(s.name) + '</span>',
          num(m.subs),
          '<span class="sbd-pos">' + num(m.subsActive) + '</span>',
          '<span class="sbd-neg">' + num(m.subsUnsub) + '</span>',
          '<strong>' + rate + '%</strong>',
          cityChips(s)
        ];
      }
    }
  };

  /* ---- render ---- */
  function styleHtml() {
    return '<style>' +
      '.sbd-card{background:#fff;border:1.5px solid #d7e4d0;border-radius:14px;margin-top:18px;box-shadow:0 1px 8px rgba(0,0,0,.05);overflow:hidden}' +
      '.sbd-head{padding:14px 18px;border-bottom:1px solid #eef2ec;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}' +
      '.sbd-head h3{margin:0;font-size:15px;font-weight:800;color:#1e293b;display:flex;align-items:center;gap:9px}' +
      '.sbd-head h3 i{color:#16A34A}' +
      '.sbd-note{font-size:12px;color:#64748b}' +
      '.sbd-wrap{overflow-x:auto}' +
      '.sbd-table{width:100%;border-collapse:collapse;font-size:13px;min-width:760px}' +
      '.sbd-table th{background:#f6f9f4;padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #e2e8f0;white-space:nowrap}' +
      '.sbd-table td{padding:11px 14px;border-bottom:1px solid #f1f5f0;color:#334155;vertical-align:middle}' +
      '.sbd-table tbody tr:last-child td{border-bottom:none}' +
      '.sbd-table tbody tr:hover td{background:#f9fbf8}' +
      '.sbd-state{font-weight:700;color:#1e293b;white-space:nowrap}' +
      '.sbd-pos{color:#16A34A;font-weight:700}' +
      '.sbd-mid{color:#ca8a04;font-weight:700}' +
      '.sbd-neg{color:#dc2626;font-weight:700}' +
      '.sbd-chips{display:flex;gap:6px;flex-wrap:wrap}' +
      '.sbd-chip{background:#f0f7ec;border:1px solid #d7e8cd;color:#2f6b2a;font-size:11px;font-weight:600;padding:2px 9px;border-radius:10px;white-space:nowrap}' +
      '.sbd-bar{background:#eef2ec;border-radius:6px;height:8px;min-width:90px;overflow:hidden}' +
      '.sbd-bar span{display:block;height:100%;background:linear-gradient(90deg,#16A34A,#22C55E);border-radius:6px}' +
      '.sbd-pill{display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:700}' +
      '.sbd-rank{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:24px;border-radius:8px;background:#f1f5f0;color:#64748b;font-size:12px;font-weight:800}' +
      '.sbd-rank-1{background:#fef9c3;color:#B45309}' +
      '.sbd-rank-2{background:#f1f5f9;color:#475569}' +
      '.sbd-rank-3{background:#ffedd5;color:#c2410c}' +
      '.sbd-pill-green{background:#dcfce7;color:#16A34A}' +
      '.sbd-pill-amber{background:#fef9c3;color:#ca8a04}' +
      '.sbd-pill-red{background:#fee2e2;color:#dc2626}' +
      '.sbd-dd-card{background:#fff;border:1.5px solid #d7e4d0;border-radius:14px;margin:16px 0;box-shadow:0 1px 8px rgba(0,0,0,.05);overflow:hidden}' +
      '.sbd-dd-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:14px 18px;background:linear-gradient(135deg,#14472F,#166534);color:#fff}' +
      '.sbd-dd-bar-l{display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-size:14px}' +
      '.sbd-dd-bar-l i{color:#4ade80}' +
      '.sbd-dd-bar-sub{display:block;font-size:11.5px;color:rgba(255,255,255,.75);font-weight:400;width:100%;margin-left:25px;margin-top:2px}' +
      '.sbd-dd-select{min-width:280px;flex-shrink:0;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:#fff;color:#1e293b;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;outline:none}' +
      '.sbd-dd-select:focus{border-color:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.25)}' +
      '.sbd-dd-empty{padding:36px 20px;text-align:center;color:#94a3b8;font-size:13.5px}' +
      '.sbd-dd-empty i{font-size:22px;color:#cbd5e1;display:block;margin-bottom:8px}' +
      '.sbd-dd-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:16px 18px;border-bottom:1px solid #eef2ec;background:#f8fbf6}' +
      '.sbd-dd-name{font-size:19px;font-weight:800;color:#1e293b;display:flex;align-items:center;gap:9px;flex-wrap:wrap}' +
      '.sbd-dd-sub{font-size:12.5px;color:#64748b;margin-top:3px}' +
      '.sbd-dd-growth{font-size:15px;font-weight:800;padding:8px 16px;border-radius:12px;background:#f6f9f4}' +
      '.sbd-kpis2{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;padding:16px 18px 4px}' +
      '.sbd-kpi2{background:#f8fbf6;border:1px solid #e2ecdb;border-radius:12px;padding:13px 15px}' +
      '.sbd-kpi2-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:7px}' +
      '.sbd-kpi2-label{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px}' +
      '.sbd-kpi2-ico{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:13px}' +
      '.sbd-kpi2-val{font-size:20px;font-weight:800;color:#1e293b;line-height:1.15}' +
      '.sbd-kpi2-sub{font-size:11.5px;color:#94a3b8;margin-top:3px}' +
      '.sbd-dd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;padding:14px 18px 0}' +
      '.sbd-dd-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:12px;padding:12px 18px 0}' +
      '.sbd-sec2{background:#fff;border:1px solid #e2ecdb;border-radius:12px;padding:14px 16px}' +
      '.sbd-sec2-title{font-size:12.5px;font-weight:800;color:#1e293b;text-transform:uppercase;letter-spacing:.4px;display:flex;align-items:center;gap:8px;margin-bottom:10px}' +
      '.sbd-sec2-title i{color:#16A34A}' +
      '.sbd-row2{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 0;border-bottom:1px dashed #eef2ec;font-size:13px}' +
      '.sbd-row2:last-child{border-bottom:none}' +
      '.sbd-row2-l{color:#475569}' +
      '.sbd-row2-r{text-align:right;font-weight:600;color:#1e293b}' +
      '.sbd-mini-table{width:100%;border-collapse:collapse;font-size:12.5px}' +
      '.sbd-mini-table th{background:#f6f9f4;padding:7px 10px;text-align:left;font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #e2e8f0;white-space:nowrap}' +
      '.sbd-mini-table td{padding:7px 10px;border-bottom:1px solid #f1f5f0;color:#334155}' +
      '.sbd-stock-cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}' +
      '.sbd-stock-h{font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;display:flex;align-items:center;gap:6px}' +
      '.sbd-trend{display:flex;gap:12px;align-items:flex-end;justify-content:space-around;padding:8px 4px 4px}' +
      '.sbd-trend-col{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1}' +
      '.sbd-trend-val{font-size:10.5px;font-weight:700;color:#64748b;white-space:nowrap}' +
      '.sbd-trend-bar{width:100%;max-width:64px;height:110px;background:#f1f6ee;border-radius:8px;display:flex;align-items:flex-end;overflow:hidden}' +
      '.sbd-trend-bar span{display:block;width:100%;background:linear-gradient(180deg,#22C55E,#16A34A);border-radius:8px 8px 0 0}' +
      '.sbd-trend-mo{font-size:11px;font-weight:700;color:#94a3b8}' +
      '@media(max-width:900px){.sbd-dd-grid2{grid-template-columns:1fr}}' +
      '@media(max-width:640px){.sbd-dd-select{width:100%;min-width:0}.sbd-stock-cols{grid-template-columns:1fr}.sbd-trend-bar{height:80px}}' +
      '</style>';
  }

  function cardHtml(tab) {
    var cfg = SECTIONS[tab];
    var d = data();
    if (!cfg || !d || !d.states || !d.states.length) return '';
    curTab = tab;
    var total = d.states.reduce(function (a, s) { return a + s.revenue; }, 0);
    var head = '<div class="sbd-head"><h3><i class="fas ' + cfg.icon + '"></i> ' + cfg.title + ' <span class="sbd-chip">' + esc(country) + '</span></h3>' +
      '<span class="sbd-note">' + cfg.sub(d) + '</span></div>';
    var sorted = d.states.slice().sort(function (a, b) {
      return cfg.sortVal(b, metrics(b)) - cfg.sortVal(a, metrics(a));
    });
    var rows = sorted.map(function (s, idx) {
      var m = metrics(s);
      var cells = cfg.row(s, m, total);
      return '<tr>' + '<td>' + rankHtml(idx) + '</td>' + cells.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    var cols = ['Top'].concat(cfg.cols(d)).map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('');
    return '<div class="sbd-card">' + head +
      '<div class="sbd-wrap"><table class="sbd-table"><thead><tr>' + cols + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</div>';
  }

  function inject(tab) {
    if (!SECTIONS[tab]) return;
    var host = document.getElementById('report-' + tab);
    if (!host || document.getElementById('sbd-' + tab)) return;
    ensureStyles();
    var html = cardHtml(tab);
    if (!html) return;
    var wrap = document.createElement('div');
    wrap.id = 'sbd-' + tab;
    wrap.innerHTML = html;
    host.appendChild(wrap);
  }

  function ensureStyles() {
    if (document.getElementById('sbd-style')) return;
    var s = document.createElement('style');
    s.id = 'sbd-style';
    s.textContent = styleHtml().replace(/<style[^>]*>/, '').replace(/<\/style>\s*$/, '');
    document.head.appendChild(s);
  }

  /* ================= Region Deep Dive (dropdown) ================= */

  function parsePrice(p) {
    var n = parseFloat(String(p == null ? '' : p).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function regionMetrics(r) {
    var key = r.name + (r.isCity ? '::city' : '');
    var h = hash(key);
    var m = {};
    m.units = Math.round(r.orders * (2.4 + (h % 40) / 100));
    m.customers = Math.round(r.orders * 0.72);
    m.newCust = Math.round(m.customers * (0.28 + (h % 15) / 100));
    m.repeatCust = m.customers - m.newCust;
    m.delivered = Math.round(r.orders * (0.78 + (h % 12) / 100));
    m.transit = Math.round(r.orders * (0.05 + (h % 5) / 100));
    m.cancelled = Math.max(0, r.orders - m.delivered - m.transit);
    m.aov = r.orders ? Math.round(r.revenue / r.orders) : 0;
    m.subs = Math.round(r.orders * 0.4);
    m.subsActive = Math.round(m.subs * (0.8 + (h % 12) / 100));
    m.subsUnsub = m.subs - m.subsActive;
    m.stockUnits = Math.round(r.orders * (4.5 + (h % 25) / 10));
    m.reorder = h % 3 === 0 ? 'High' : (h % 3 === 1 ? 'Medium' : 'Low');
    return m;
  }

  function regionProducts(r) {
    var ps = products();
    var m = regionMetrics(r);
    var h = hash(r.name + '::topprods');
    var start = h % ps.length;
    var out = [];
    var remaining = m.units;
    for (var i = 0; i < Math.min(5, ps.length); i++) {
      var p = ps[(start + i) % ps.length];
      var share = 0.3 - i * 0.05;
      var units = Math.max(5, Math.round(m.units * share));
      if (i === Math.min(4, ps.length) - 1) units = Math.max(5, remaining);
      remaining -= units;
      if (remaining < 0) remaining = 0;
      var price = parsePrice(p.price) || Math.round(r.revenue / Math.max(1, m.units));
      out.push({ name: p.name, cat: p.cat || 'General', units: units, revenue: units * price });
    }
    return out;
  }

  function regionStock(r) {
    var ps = products();
    var h = hash(r.name + '::stock');
    var low = [];
    var high = [];
    for (var i = 0; i < 4; i++) {
      var pl = ps[(h + i * 3) % ps.length];
      low.push({ name: pl.name, qty: 2 + (h + i * 7) % 14 });
    }
    for (var j = 0; j < 4; j++) {
      var ph = ps[(h + j * 5 + 2) % ps.length];
      high.push({ name: ph.name, qty: 180 + (h + j * 37) % 420 });
    }
    return { low: low, high: high };
  }

  function regionTrend(r) {
    var h = hash(r.name + '::trend');
    var months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    var base = r.revenue / 6;
    return months.map(function (mo, i) {
      var f = 0.55 + ((h >> i) % 55) / 100 + i * 0.07;
      return { month: mo, value: Math.round(base * f) };
    });
  }

  function kpiBox(label, value, sub, icon, color) {
    return '<div class="sbd-kpi2"><div class="sbd-kpi2-top"><span class="sbd-kpi2-label">' + label + '</span>' +
      '<span class="sbd-kpi2-ico" style="background:' + color + '18;color:' + color + '"><i class="fas ' + icon + '"></i></span></div>' +
      '<div class="sbd-kpi2-val">' + value + '</div><div class="sbd-kpi2-sub">' + sub + '</div></div>';
  }

  function secBox(title, icon, rows) {
    return '<div class="sbd-sec2"><div class="sbd-sec2-title"><i class="fas ' + icon + '"></i> ' + title + '</div>' +
      rows.map(function (r) {
        return '<div class="sbd-row2"><span class="sbd-row2-l">' + r[0] + '</span><span class="sbd-row2-r">' + r[1] + '</span></div>';
      }).join('') + '</div>';
  }

  function deepDivePanelHtml(r) {
    if (!r) {
      return '<div class="sbd-dd-empty"><i class="fas fa-hand-pointer"></i> Select a state or city from the dropdown above to view its complete details</div>';
    }
    var m = regionMetrics(r);
    var d = data();
    var prods = regionProducts(r);
    var stock = regionStock(r);
    var trend = regionTrend(r);
    var maxTrend = Math.max.apply(null, trend.map(function (t) { return t.value; })) || 1;
    var pill = m.reorder === 'High' ? 'sbd-pill-red' : (m.reorder === 'Medium' ? 'sbd-pill-amber' : 'sbd-pill-green');
    var gCls = growthCls(r.growth);

    var html = '<div class="sbd-dd-head"><div>' +
      '<div class="sbd-dd-name">' + esc(r.name) + ' <span class="sbd-chip">' + esc(r.isCity ? (cityParent(r.name) || d.label || 'State') : (d.label || 'State')) + '</span></div>' +
      '<div class="sbd-dd-sub">Complete performance details for ' + esc(r.name) + '</div></div>' +
      '<div class="sbd-dd-growth ' + gCls + '"><i class="fas fa-arrow-trend-' + (r.growth >= 5 ? 'up' : 'down') + '"></i> ' + r.growth + '% growth</div></div>';

    html += '<div class="sbd-kpis2">' +
      kpiBox('Revenue', money(r.revenue), 'total collected', 'fa-coins', '#16A34A') +
      kpiBox('Orders', num(r.orders), m.delivered + ' delivered', 'fa-box', '#3B82F6') +
      kpiBox('Growth', r.growth + '%', 'vs last month', 'fa-chart-line', r.growth >= 5 ? '#16A34A' : '#DC2626') +
      kpiBox('Units Sold', num(m.units), 'across all products', 'fa-cart-shopping', '#8b5cf6') +
      kpiBox('Customers', num(m.customers), m.newCust + ' new', 'fa-users', '#0ea5e9') +
      kpiBox('Subscribers', num(m.subs), m.subsActive + ' active', 'fa-user-check', '#F2B233') +
      '</div>';

    html += '<div class="sbd-dd-grid">' +
      secBox('Orders & Fulfilment', 'fa-receipt', [
        ['Total Orders', '<strong>' + num(r.orders) + '</strong>'],
        ['Delivered', '<span class="sbd-pos">' + num(m.delivered) + '</span>'],
        ['In Transit', '<span class="sbd-mid">' + num(m.transit) + '</span>'],
        ['Cancelled', '<span class="sbd-neg">' + num(m.cancelled) + '</span>'],
        ['Avg Order Value', '<strong>' + money(m.aov) + '</strong>']
      ]) +
      secBox('Sales', 'fa-cart-shopping', [
        ['Units Sold', '<strong>' + num(m.units) + '</strong>'],
        ['Sales Revenue', '<strong>' + money(r.revenue) + '</strong>'],
        ['Best Seller', esc(prods[0].name)],
        ['Categories Sold', num(new Set(prods.map(function (p) { return p.cat; })).size)],
        ['Sales Growth', '<span class="' + gCls + '">' + r.growth + '%</span>']
      ]) +
      secBox('Customers', 'fa-users', [
        ['Total Customers', '<strong>' + num(m.customers) + '</strong>'],
        ['New Customers', '<span class="sbd-pos">+' + num(m.newCust) + '</span>'],
        ['Repeat Customers', num(m.repeatCust)],
        ['Retention Rate', '<strong>' + Math.round(m.repeatCust / Math.max(1, m.customers) * 100) + '%</strong>'],
        ['Revenue / Customer', money(Math.round(r.revenue / Math.max(1, m.customers)))]
      ]) +
      secBox('Subscribers', 'fa-user-check', [
        ['Total Subscribers', '<strong>' + num(m.subs) + '</strong>'],
        ['Active', '<span class="sbd-pos">' + num(m.subsActive) + '</span>'],
        ['Unsubscribed', '<span class="sbd-neg">' + num(m.subsUnsub) + '</span>'],
        ['Active Rate', '<strong>' + Math.round(m.subsActive / Math.max(1, m.subs) * 100) + '%</strong>']
      ]) +
      '</div>';

    html += '<div class="sbd-dd-grid2">' +
      '<div class="sbd-sec2"><div class="sbd-sec2-title"><i class="fas fa-basket-shopping"></i> Top Products</div>' +
      '<table class="sbd-mini-table"><thead><tr><th>Product</th><th>Category</th><th>Units</th><th>Revenue</th></tr></thead><tbody>' +
      prods.map(function (p) {
        return '<tr><td>' + esc(p.name) + '</td><td><span class="sbd-chip">' + esc(p.cat) + '</span></td><td>' + num(p.units) + '</td><td><strong>' + money(p.revenue) + '</strong></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="sbd-sec2"><div class="sbd-sec2-title"><i class="fas fa-warehouse"></i> Inventory <span class="sbd-pill ' + pill + '" style="margin-left:6px">Restock: ' + m.reorder + '</span></div>' +
      '<div class="sbd-stock-cols"><div><div class="sbd-stock-h sbd-neg"><i class="fas fa-triangle-exclamation"></i> Low Stock</div>' +
      stock.low.map(function (s) { return '<div class="sbd-row2"><span class="sbd-row2-l">' + esc(s.name) + '</span><span class="sbd-neg">' + s.qty + ' left</span></div>'; }).join('') +
      '</div><div><div class="sbd-stock-h sbd-pos"><i class="fas fa-circle-check"></i> High Stock</div>' +
      stock.high.map(function (s) { return '<div class="sbd-row2"><span class="sbd-row2-l">' + esc(s.name) + '</span><span class="sbd-pos">' + num(s.qty) + ' units</span></div>'; }).join('') +
      '</div></div>' +
      '<div class="sbd-row2" style="margin-top:10px"><span class="sbd-row2-l">Total Stock Units</span><span class="sbd-row2-r"><strong>' + num(m.stockUnits) + '</strong></span></div>' +
      '</div></div>';

    html += '<div class="sbd-sec2"><div class="sbd-sec2-title"><i class="fas fa-chart-column"></i> 6-Month Revenue Trend</div>' +
      '<div class="sbd-trend">' +
      trend.map(function (t) {
        var pct = Math.round(t.value / maxTrend * 100);
        return '<div class="sbd-trend-col"><div class="sbd-trend-val">' + money(t.value) + '</div><div class="sbd-trend-bar"><span style="height:' + pct + '%"></span></div><div class="sbd-trend-mo">' + t.month + '</div></div>';
      }).join('') + '</div></div>';

    if (!r.isCity && r.cities && r.cities.length) {
      html += '<div class="sbd-sec2"><div class="sbd-sec2-title"><i class="fas fa-city"></i> Cities in ' + esc(r.name) + '</div>' +
        '<div class="sbd-chips">' + r.cities.slice().sort(function (a, b) { return b.revenue - a.revenue; }).map(function (c) {
          return '<span class="sbd-chip" style="cursor:pointer" onclick="StateBreakdown.selectRegion(\'city:' + esc(c.name).replace(/'/g, '') + '\')">' + esc(c.name) + ' \u00B7 ' + num(c.orders) + ' orders \u00B7 ' + money(c.revenue) + '</span>';
        }).join('') + '</div></div>';
    }
    return html;
  }

  function cityParent(cityName) {
    var d = data();
    if (!d) return '';
    for (var i = 0; i < d.states.length; i++) {
      var st = d.states[i];
      for (var j = 0; j < (st.cities || []).length; j++) {
        if (st.cities[j].name === cityName) return st.name;
      }
    }
    return '';
  }

  function findRegion(val) {
    if (!val) return null;
    var parts = val.split(':');
    var kind = parts[0];
    var name = parts.slice(1).join(':');
    var d = data();
    if (!d) return null;
    if (kind === 'city') {
      for (var i = 0; i < d.states.length; i++) {
        var cs = d.states[i].cities || [];
        for (var j = 0; j < cs.length; j++) {
          if (cs[j].name === name) {
            var c = cs[j];
            return { name: c.name, revenue: c.revenue, orders: c.orders, growth: c.growth, isCity: true };
          }
        }
      }
      return null;
    }
    for (var k = 0; k < d.states.length; k++) {
      if (d.states[k].name === name) {
        var s = d.states[k];
        return { name: s.name, revenue: s.revenue, orders: s.orders, growth: s.growth, cities: s.cities, isCity: false };
      }
    }
    return null;
  }

  function deepDiveHtml() {
    var d = data();
    if (!d) return '';
    var opts = '<option value="">Select ' + esc(d.label || 'State') + ' / City...</option>';
    d.states.forEach(function (s) {
      opts += '<optgroup label="' + esc(s.name) + ' (' + money(s.revenue) + ')">';
      opts += '<option value="state:' + esc(s.name) + '">' + esc(s.name) + ' \u2014 All ' + esc(d.label || 'State') + '</option>';
      (s.cities || []).forEach(function (c) {
        opts += '<option value="city:' + esc(c.name) + '">\u00A0\u00A0\u00A0 ' + esc(c.name) + ' \u2014 ' + num(c.orders) + ' orders, ' + money(c.revenue) + '</option>';
      });
      opts += '</optgroup>';
    });
    return '<div class="sbd-dd-card">' +
      '<div class="sbd-dd-bar">' +
        '<div class="sbd-dd-bar-l"><i class="fas fa-magnifying-glass-chart"></i> <strong>Region Deep Dive</strong><span class="sbd-dd-bar-sub">Pick a ' + esc((d.label || 'State').toLowerCase()) + ' or city to view every detail \u2014 orders, revenue, growth, sales, products, customers, inventory & subscribers</span></div>' +
        '<select class="sbd-dd-select" id="sbdRegionSelect" onchange="StateBreakdown.selectRegion(this.value)">' + opts + '</select>' +
      '</div>' +
      '<div id="sbdRegionPanel">' + deepDivePanelHtml(null) + '</div>' +
      '</div>';
  }

  function injectDeepDive() {
    var d = data();
    if (!d) return;
    if (document.getElementById('sbdDeepDive')) return;
    var host = document.getElementById('report-states');
    if (!host) return;
    ensureStyles();
    var wrap = document.createElement('div');
    wrap.id = 'sbdDeepDive';
    wrap.innerHTML = deepDiveHtml();
    host.parentElement.insertBefore(wrap, host.nextSibling);
  }

  /* ================= end Region Deep Dive ================= */

  function hook() {
    if (typeof window.switchReportTab === 'function' && !window.__sbdHooked) {
      window.__sbdHooked = true;
      var orig = window.switchReportTab;
      window.switchReportTab = function (tab) {
        var r = orig.apply(this, arguments);
        try { inject(tab); } catch (e) {}
        return r;
      };
    }
    var active = document.querySelector('.report-tab.active');
    if (active) {
      var m = (active.getAttribute('onclick') || '').match(/switchReportTab\('([^']+)'/);
      if (m) inject(m[1]);
    }
    try { injectDeepDive(); } catch (e) {}
  }

  /* capture the country configured by each dashboard */
  (function () {
    function waitGeo() {
      if (window.GeoReport && GeoReport.configure) {
        var orig = GeoReport.configure;
        GeoReport.configure = function (opts) {
          orig.apply(this, arguments);
          country = (opts && opts.country) || country;
        };
        return true;
      }
      return false;
    }
    if (!waitGeo()) {
      var t = setInterval(function () { if (waitGeo()) clearInterval(t); }, 50);
    }
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hook);
  } else {
    hook();
  }

  return {
    inject: inject,
    selectRegion: function (val) {
      var r = findRegion(val);
      var panel = document.getElementById('sbdRegionPanel');
      var sel = document.getElementById('sbdRegionSelect');
      if (sel && val) sel.value = val;
      if (!panel) return;
      panel.innerHTML = deepDivePanelHtml(r);
      if (panel.scrollIntoView) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
    refresh: function () {
      Object.keys(SECTIONS).forEach(function (k) {
        var el = document.getElementById('sbd-' + k);
        if (el) el.remove();
        inject(k);
      });
      var dd = document.getElementById('sbdDeepDive');
      if (dd) dd.remove();
      injectDeepDive();
    }
  };
})();
