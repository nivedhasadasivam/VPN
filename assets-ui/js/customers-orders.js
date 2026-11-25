/* VPNexues CustomersOrders
 * Combined "Customers & Orders" section for the sub admin dashboards.
 * Reads customers + orders from the existing OrderManager / UserManager APIs.
 * Renders into a root container (#co-root) and provides a right-side
 * Order Details drawer with customer info, order summary, ordered products,
 * payment info, timeline, delivery details and working actions.
 */
(function () {
  'use strict';

  var COUNTRY_CURRENCY = {
    India: { sym: '\u20B9', code: 'INR', digits: 0 },
    US: { sym: '$', code: 'USD', digits: 2 },
    UAE: { sym: 'AED ', code: 'AED', digits: 2 },
    Singapore: { sym: 'S$', code: 'SGD', digits: 2 }
  };

  var ORDER_FLOW = ['pending', 'processing', 'packed', 'shipped', 'delivered'];

  var PLATFORM_MAP = {
    'UPI': 'Google Pay',
    'Card': 'Visa',
    'Net Banking': 'NetBanking',
    'Cash on Delivery': 'Cash',
    'Wallets': 'Paytm',
    'PayPal': 'PayPal',
    'Apple Pay': 'Apple Pay',
    'Google Pay': 'Google Pay',
    'Bank Transfer': 'Bank Transfer',
    'PayNow': 'PayNow',
    'E-Wallets': 'GrabPay'
  };

  var COUNTRY_CITIES = {
    India: ['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Chennai','Coimbatore','Salem','Erode','Vellore','Bengaluru','Mysuru','Hubballi','Mangaluru','Belgaum','New Delhi','Gurugram','Noida','Faridabad','Ghaziabad','Hyderabad','Warangal','Karimnagar','Nizamabad','Khammam','Kolkata','Howrah','Durgapur','Asansol','Siliguri','Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jaipur','Jodhpur','Udaipur','Kota','Ajmer'],
    UAE: ['Deira','Bur Dubai','Jumeirah','Downtown Dubai','Business Bay','Al Reem Island','Khalifa City','Corniche','Yas Island','Musaffah','Al Majaz','Al Nahda','Muwaileh','Al Khan','Al Qasimia','Al Rashidiya','Al Nuaimiya','Jurf','Al Hamidiya','Al Rawda','Al Nakheel','Al Marjan Island','Hamraniyah','Al Dhait','Julphar','Fujairah City','Dibba','Mirbah','Al Faseel','Sakamkam','UAQ City','Falaj Al Mualla','Al Salama','Al Raas','Al Harith'],
    US: ['Los Angeles','San Francisco','Seattle','Denver','San Diego','New York City','Boston','Philadelphia','Newark','Pittsburgh','Miami','Atlanta','Charlotte','Orlando','Tampa','Chicago','Minneapolis','Detroit','Columbus','Milwaukee','Phoenix','Dallas','Houston','Austin','San Antonio'],
    Singapore: ['Orchard Road','Marina Bay','Bugis','Chinatown','Newton','Tampines','Bedok','Pasir Ris','Changi','Geylang','Jurong East','Clementi','Bukit Batok','Boon Lay','Tuas','Woodlands','Yishun','Sembawang','Mandai','Ang Mo Kio','Punggol','Sengkang','Hougang','Serangoon','Bishan']
  };

  var state = {
    country: 'India',
    city: '',
    rootId: 'co-root',
    productImages: {},
    search: '',
    orderStatus: 'all',
    paymentStatus: 'all',
    orderType: 'all',
    dateFrom: '',
    dateTo: '',
    minSpent: '',
    maxSpent: '',
    sortBy: 'lastOrder',
    sortDir: 'desc',
    page: 1,
    perPage: 10,
    moreOpen: false,
    activeOrder: null,
    activeMenu: null
  };

  function money(n) {
    var c = COUNTRY_CURRENCY[state.country] || COUNTRY_CURRENCY.India;
    return c.sym + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: c.digits, maximumFractionDigits: c.digits });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function hashNum(s) {
    var h = 0;
    var str = String(s || '');
    for (var i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
    return Math.abs(h);
  }

  function allOrders() {
    if (window.OrderManager && OrderManager.state && OrderManager.state.orders) return OrderManager.state.orders;
    return [];
  }

  function allUsers() {
    if (window.UserManager && UserManager.state && UserManager.state.users) return UserManager.state.users;
    return [];
  }

  function paymentStatusOf(o) {
    if (o.refunded) return 'Refunded';
    if (o.status === 'delivered' || o.status === 'shipped') return 'Paid';
    if (o.status === 'cancelled') return 'Refunded';
    return 'Pending';
  }

  function orderTotalProducts(o) {
    var seen = {};
    (o.items || []).forEach(function (it) { if (it.sku) seen[it.sku] = true; });
    return Object.keys(seen).length;
  }

  function orderTotalQty(o) {
    return (o.items || []).reduce(function (a, it) { return a + (Number(it.qty) || 0); }, 0);
  }

  function platformFor(payment) {
    return PLATFORM_MAP[payment] || payment || '–';
  }

  function txnFor(o) {
    var m = String(o.id || '').match(/(\d+)/);
    var digits = m ? m[1] : String(hashNum(o.id) % 90000 + 10000);
    return 'TXN' + digits;
  }

  var ORDER_TYPES = ['Shop', 'Small Box', 'Big Box', 'B2B'];

  function orderTypeOf(o) {
    return ORDER_TYPES[hashNum(o.id + ':t') % ORDER_TYPES.length];
  }

  function orderTypeMeta(type) {
    var map = {
      'Shop': { color: '#3B82F6', icon: 'fa-store' },
      'Small Box': { color: '#16A34A', icon: 'fa-box' },
      'Big Box': { color: '#7C3AED', icon: 'fa-box-open' },
      'B2B': { color: '#D97706', icon: 'fa-building' }
    };
    return map[type] || { color: '#64748B', icon: 'fa-box' };
  }

  function orderTypeBadge(type) {
    var m = orderTypeMeta(type);
    return '<span class="co-type-badge" style="color:' + m.color + ';background:transparent;border:none"><i class="fas ' + m.icon + '"></i> ' + type + '</span>';
  }

  function enhanceOrder(o) {
    var e = {};
    var keys = Object.keys(o);
    for (var i = 0; i < keys.length; i++) { e[keys[i]] = o[keys[i]]; }
    e.discount = e.discount || 0;
    e.tax = Math.round((Number(e.subtotal) || 0) * 0.10 * 100) / 100;
    e.trackingNumber = 'TRK-' + String(e.id).replace(/[^a-zA-Z0-9]/g, '');
    e.paymentMethod = e.payment || 'Credit Card';
    var payStr = String(e.payment || '').toLowerCase();
    e.paymentStatus = payStr.indexOf('paid') !== -1 ? 'Paid' : (e.status === 'cancelled' || e.refunded ? 'Refunded' : 'Pending');
    return e;
  }

  function orderTime(o) {
    var h = hashNum(o.id) % 12 + 8;
    var min = hashNum(o.id + 'm') % 60;
    var ampm = h >= 12 ? 'PM' : 'AM';
    var hh = h > 12 ? h - 12 : h;
    return String(hh).padStart(2, '0') + ':' + String(min).padStart(2, '0') + ' ' + ampm;
  }

  function dateFromISO(iso, offsetDays) {
    var d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + (offsetDays || 0));
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function buildCustomers() {
    var map = {};
    allOrders().forEach(function (o) {
      if (o.country !== state.country) return;
      var key = (o.email || o.customer || '').toLowerCase();
      if (!map[key]) {
        map[key] = { name: o.customer, email: o.email, phone: o.phone, address: o.address, country: o.country, orders: [], profile: null };
      }
      map[key].orders.push(o);
    });
    var users = allUsers();
    Object.keys(map).forEach(function (k) {
      var c = map[k];
      c.orders.sort(function (a, b) { return b.date.localeCompare(a.date); });
      var u = users.find(function (x) { return (x.email || '').toLowerCase() === k; }) ||
              users.find(function (x) { return (x.name || '').toLowerCase() === (c.name || '').toLowerCase(); });
      if (u) c.profile = u;
      c.totalOrders = c.orders.length;
      c.productsPurchased = c.orders.reduce(function (s, o) { return s + orderTotalQty(o); }, 0);
      c.totalSpent = c.orders.reduce(function (s, o) { return s + (Number(o.total) || 0); }, 0);
      c.lastOrder = c.orders[0] || null;
      c.registrationDate = c.orders.reduce(function (min, o) { return !min || o.date < min ? o.date : min; }, '');
      c.avgOrderValue = c.totalOrders ? c.totalSpent / c.totalOrders : 0;
      var lastDate = c.lastOrder ? new Date(c.lastOrder.date + 'T00:00:00') : null;
      var now = new Date();
      var diffMs = lastDate ? (now - lastDate) : Infinity;
      var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      c.customerStatus = diffDays <= 30 ? 'Active' : 'Inactive';
      var emailHash = String(hashNum(k));
      while (emailHash.length < 8) emailHash = '0' + emailHash;
      c.customerID = 'CUST-' + emailHash.slice(0, 8);
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function customerStatus(c) {
    if (c.profile && c.profile.status) return c.profile.status;
    if (!c.lastOrder) return 'active';
    return c.lastOrder.status === 'cancelled' ? 'inactive' : 'active';
  }

  function customerHasOrderStatus(c, status) {
    if (status === 'all') return true;
    return c.orders.some(function (o) { return o.status === status; });
  }

  function customerHasPaymentStatus(c, status) {
    if (status === 'all') return true;
    return c.orders.some(function (o) { return paymentStatusOf(o) === status; });
  }

  function customerHasOrderType(c, type) {
    if (type === 'all') return true;
    return c.orders.some(function (o) { return orderTypeOf(o) === type; });
  }

  function customerInRange(c) {
    if (state.dateFrom) {
      var has = c.orders.some(function (o) { return o.date >= state.dateFrom; });
      if (!has) return false;
    }
    if (state.dateTo) {
      var has2 = c.orders.some(function (o) { return o.date <= state.dateTo; });
      if (!has2) return false;
    }
    return true;
  }

  function getFiltered() {
    var list = buildCustomers();
    if (state.search) {
      var q = state.search.toLowerCase();
      list = list.filter(function (c) {
        var orderMatch = c.orders.some(function (o) { return o.id.toLowerCase().indexOf(q) !== -1; });
        return (c.name + ' ' + esc(c.email) + ' ' + esc(c.phone)).toLowerCase().indexOf(q) !== -1 || orderMatch;
      });
    }
    list = list.filter(function (c) { return customerHasOrderStatus(c, state.orderStatus); });
    list = list.filter(function (c) { return customerHasPaymentStatus(c, state.paymentStatus); });
    list = list.filter(function (c) { return customerHasOrderType(c, state.orderType); });
    list = list.filter(customerInRange);
    if (state.city) {
      var cityLower = state.city.toLowerCase();
      list = list.filter(function (c) {
        return c.orders.some(function (o) {
          return (o.address || '').toLowerCase().indexOf(cityLower) !== -1 || (o.city || '').toLowerCase() === cityLower;
        });
      });
    }
    if (state.minSpent !== '') list = list.filter(function (c) { return c.totalSpent >= Number(state.minSpent); });
    if (state.maxSpent !== '') list = list.filter(function (c) { return c.totalSpent <= Number(state.maxSpent); });
    var key = state.sortBy;
    var dir = state.sortDir === 'asc' ? 1 : -1;
    list.sort(function (a, b) {
      var av, bv;
      if (key === 'lastOrder') { av = a.lastOrder ? a.lastOrder.date : ''; bv = b.lastOrder ? b.lastOrder.date : ''; }
      else if (key === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else { av = a[key]; bv = b[key]; }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }

  function getPaged() {
    var filtered = getFiltered();
    var totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * state.perPage;
    return { rows: filtered.slice(start, start + state.perPage), total: filtered.length, pages: totalPages, page: state.page };
  }

  function kpis(list) {
    var totalOrders = 0;
    var totalRevenue = 0;
    var repeat = 0;
    list.forEach(function (c) {
      totalOrders += c.totalOrders;
      totalRevenue += c.totalSpent;
      if (c.totalOrders >= 2) repeat++;
    });
    return {
      customers: list.length,
      orders: totalOrders,
      revenue: totalRevenue,
      aov: totalOrders ? totalRevenue / totalOrders : 0,
      repeat: repeat
    };
  }

  /* ---- Pills / badges ---- */
  function statusPill(status) {
    var colors = {
      delivered: '#16A34A', shipped: '#2563EB', packed: '#7C3AED',
      processing: '#D97706', pending: '#64748B', cancelled: '#DC2626'
    };
    var c = colors[status] || '#64748B';
    var label = status.charAt(0).toUpperCase() + status.slice(1);
    return '<span class="co-pill" style="color:' + c + ';background:transparent;border:none">' + label + '</span>';
  }

  function paymentPill(status) {
    var c = status === 'Paid' ? '#16A34A' : status === 'Refunded' ? '#DC2626' : '#D97706';
    return '<span class="co-pill" style="color:' + c + ';background:transparent;border:none">' + status + '</span>';
  }

  function customerPill(c) {
    var s = customerStatus(c);
    var colors = { active: '#16A34A', pending: '#D97706', inactive: '#DC2626' };
    var cc = colors[s] || '#64748B';
    var label = s.charAt(0).toUpperCase() + s.slice(1);
    return '<span class="co-pill" style="color:' + cc + ';background:transparent;border:none">' + label + '</span>';
  }

  function avatarHtml(c) {
    var initial = (c.name || '?').charAt(0).toUpperCase();
    return '<div class="co-avatar">' + esc(initial) + '</div>';
  }

  function countryLabel(country) {
    var flags = { India: '\uD83C\uDDEE\uD83C\uDDF3', US: '\uD83C\uDDFA\uD83C\uDDF8', UAE: '\uD83C\uDDE6\uD83C\uDDEA', Singapore: '\uD83C\uDDF8\uD83C\uDDEC' };
    return (flags[country] || '') + ' ' + country;
  }

  /* ---- Render ---- */
  function renderPage() {
    var root = document.getElementById(state.rootId);
    if (!root) return;
    var list = getFiltered();
    var k = kpis(list);
    var paged = getPaged();
    var rows = paged.rows;

    var html = '';
    html += styleHtml();
    html += pageHeaderHtml();
    html += kpiHtml(k);
    html += filterBarHtml();
    html += tableCardHtml(rows, list.length, paged);
    root.innerHTML = html;
    ensureDrawer();
  }

  function styleHtml() {
    return '' +
      '<style id="co-style">' +
      '#co-root{font-family:inherit;color:#111827}' +
      '.co-breadcrumb{font-size:12px;color:#6B7280;margin-bottom:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}' +
      '.co-breadcrumb a{color:#065F46;text-decoration:none;font-weight:600}' +
      '.co-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}' +
      '.co-title-row h2{margin:0;font-size:22px;font-weight:800;color:#111827;display:flex;align-items:center;gap:10px}' +
      '.co-country-badge{font-size:12px;font-weight:700;color:#065F46;background:#065F4614;border:1px solid #065F4626;padding:4px 12px;border-radius:20px}' +
      '.co-subtitle{font-size:13px;color:#6B7280;margin-top:4px}' +
      '.co-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:18px}' +
      '.co-kpi{background:linear-gradient(120deg,#f3fbf6,#fdfcf2);border:1px solid #e5e7eb;border-radius:14px;padding:16px 18px;box-shadow:0 1px 2px rgba(17,24,39,.04)}' +
      '.co-kpi .co-kpi-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}' +
      '.co-kpi .co-kpi-label{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.3px}' +
      '.co-kpi .co-kpi-icon{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);color:#16A34A;display:flex;align-items:center;justify-content:center;font-size:15px}' +
      '.co-kpi .co-kpi-value{font-size:19px;font-weight:800;color:#1e293b;line-height:1.1}' +
      '.co-kpi .co-kpi-sub{font-size:12px;font-weight:600;color:#16A34A;margin-top:4px}' +
      '.co-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;margin-bottom:18px;box-shadow:0 1px 2px rgba(17,24,39,.04);overflow:hidden;transition:transform .2s,box-shadow .2s,border-color .2s}' +
      '.co-card:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(20,83,45,.12)}' +
      '@keyframes coIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
      '.co-card{animation:coIn .35s ease backwards}' +
      '.co-card-pad{padding:16px 18px}' +
      '.co-card-header{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #F3F4F6}' +
      '.co-field label{display:block;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}' +
      '.co-field input,.co-field select{width:100%;padding:8px 11px;border:1px solid #D1D5DB;border-radius:9px;font-size:13px;font-family:inherit;background:#fff;color:#111827;outline:none;transition:border-color .15s,box-shadow .15s}' +
      '.co-field input:focus,.co-field select:focus{border-color:#065F46;box-shadow:0 0 0 3px rgba(6,95,70,.12)}' +
      '.co-btn{padding:8px 14px;border-radius:9px;border:1px solid #D1D5DB;background:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:7px;color:#374151;transition:all .15s;white-space:nowrap}' +
      '.co-btn:hover{border-color:#065F46;color:#065F46}' +
      '.co-btn-primary{background:#065F46;border-color:#065F46;color:#fff}' +
      '.co-btn-primary:hover{background:#047857;border-color:#047857;color:#fff}' +
      '.co-btn-sm{padding:5px 10px;font-size:12px;border-radius:7px}' +
      '.co-table-wrap{overflow-x:auto}' +
      '.co-table{width:100%;border-collapse:collapse;font-size:13px;min-width:760px}' +
      '.co-table thead th{background:#166534;padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;border-bottom:none;white-space:nowrap}' +
      '.co-table tbody td{padding:12px 14px;border-bottom:1px solid #e8f5e9;color:#374151;vertical-align:middle;background:#f0fdf4}' +
      '.co-table tbody tr:hover td{background:#dcfce7}' +
      '.co-cust{display:flex;align-items:center;gap:10px}' +
      '.co-avatar{width:36px;height:36px;border-radius:50%;background:#065F4612;color:#065F46;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}' +
      '.co-cust .co-cust-name{font-weight:700;color:#111827}' +
      '.co-cust .co-cust-mail{font-size:11px;color:#9CA3AF;margin-top:1px}' +
      '.co-contact{font-size:12px;color:#6B7280;line-height:1.5}' +
      '.co-num{font-weight:700;color:#111827}' +
      '.co-action{display:flex;gap:6px;align-items:center}' +
      '.co-action-btn{width:32px;height:32px;border-radius:8px;border:1px solid #E5E7EB;background:#fff;color:#6B7280;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s}' +
      '.co-action-btn:hover{border-color:#065F46;color:#065F46}' +
      '.co-menu-wrap{position:relative}' +
      '.co-menu{position:absolute;right:0;top:calc(100% + 4px);background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 30px rgba(17,24,39,.12);min-width:190px;z-index:900;overflow:hidden}' +
      '.co-menu a{display:flex;align-items:center;gap:9px;padding:9px 14px;font-size:13px;color:#374151;text-decoration:none;transition:background .12s}' +
      '.co-menu a:hover{background:#F9FAFB}' +
      '.co-empty{padding:50px 20px;text-align:center;color:#9CA3AF;font-size:14px}' +
      '.co-pager{display:flex;align-items:center;justify-content:center;gap:6px;padding:13px 18px;border-top:1px solid #F3F4F6;flex-wrap:wrap}' +
      '.co-pager button{padding:6px 12px;font-size:12px;border-radius:8px;border:1px solid #E5E7EB;background:#fff;color:#374151;cursor:pointer;font-family:inherit;font-weight:600}' +
      '.co-pager button.active{background:#065F46;border-color:#065F46;color:#fff}' +
      '.co-pager button:disabled{opacity:.4;cursor:not-allowed}' +
      '.co-summary{font-size:13px;color:#6B7280}' +
      '.co-typebar{display:flex;gap:8px;flex-wrap:wrap;padding:12px 18px;border-bottom:1px solid #F3F4F6}' +
      '.co-type{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:999px;border:1px solid #E5E7EB;background:#fff;color:#374151;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap}' +
      '.co-type:hover{border-color:#065F46;color:#065F46}' +
      '.co-type.active{background:linear-gradient(135deg,#065F46,#047857);border-color:#065F46;color:#fff}' +
      '.co-type-badge{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid;white-space:nowrap}' +
      '.co-more-filters{display:none;padding:14px 18px;border-top:1px solid #F3F4F6;background:#FAFAFB}' +
      '.co-more-filters.open{display:block}' +
      '.co-grid-4{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}' +
      '.co-grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}' +
      '@media(max-width:900px){.co-grid-4{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}}' +
      '@media(max-width:640px){.co-grid-4,.co-grid-2{grid-template-columns:1fr}' +
      '.co-table thead{display:none}.co-table{min-width:0}.co-table,.co-table tbody,.co-table tr,.co-table td{display:block;width:100%}' +
      '.co-table tbody tr{border:1px solid #E5E7EB;border-radius:12px;margin-bottom:10px;padding:8px 4px}' +
      '.co-table tbody td{border:none;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:right;border-bottom:1px dashed #F3F4F6}' +
      '.co-table tbody td:last-child{border-bottom:none}' +
      '.co-table tbody td::before{content:attr(data-label);font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px}' +
      '.co-table tbody td.co-no-label::before{display:none}' +
      '.co-cust{justify-content:flex-end}' +
      '.co-action{justify-content:flex-end}}' +
      '.co-drawer-overlay{position:fixed;inset:0;background:rgba(17,24,39,.45);opacity:0;visibility:hidden;transition:opacity .25s;z-index:12000}' +
      '.co-drawer-overlay.open{opacity:1;visibility:visible}' +
      '.co-drawer{position:fixed;top:0;right:0;height:100%;width:480px;max-width:100%;background:linear-gradient(135deg,#14472F,#0d3018);color:#fff;box-shadow:-12px 0 40px rgba(8,30,16,.55);transform:translateX(105%);transition:transform .28s ease;z-index:12001;display:flex;flex-direction:column}' +
      '.co-drawer.open{transform:translateX(0)}' +
      '@media(max-width:640px){.co-drawer{width:100%}}' +
      '.co-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff}' +
      '.co-drawer-head h3{margin:0;font-size:17px;font-weight:800}' +
      '.co-drawer-close{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:#fff;cursor:pointer;font-size:14px}' +
      '.co-drawer-close:hover{background:rgba(255,255,255,.16)}' +
      '.co-drawer-body{flex:1;overflow-y:auto;padding:18px 20px}' +
      '.co-sec{border:1px solid rgba(255,255,255,.10);border-radius:12px;background:rgba(255,255,255,.06);margin-bottom:14px;overflow:hidden}' +
      '.co-sec-head{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.10);font-size:12px;font-weight:800;color:#F2B233;text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.05)}' +
      '.co-sec-body{padding:14px}' +
      '.co-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
      '@media(max-width:520px){.co-detail-grid{grid-template-columns:1fr}}' +
      '.co-detail-item{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 12px}' +
      '.co-detail-item .co-dl{font-size:10px;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;font-weight:700}' +
      '.co-detail-item .co-dv{font-size:13px;font-weight:600;color:#fff}' +
      '.co-drawer-items{display:flex;flex-direction:column;gap:10px}' +
      '.co-item-row{display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.06);border-radius:10px;padding:10px 12px}' +
      '.co-item-img{width:44px;height:44px;border-radius:9px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.12);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px}' +
      '.co-item-img img{width:100%;height:100%;object-fit:cover}' +
      '.co-item-info{flex:1;min-width:0}' +
      '.co-item-name{font-size:13px;font-weight:700;color:#fff}' +
      '.co-item-meta{font-size:11px;color:rgba(255,255,255,.6);margin-top:2px}' +
      '.co-item-price{text-align:right;font-size:13px;font-weight:700;color:#F2B233;white-space:nowrap}' +
      '.co-summary-line{display:flex;justify-content:space-between;gap:10px;padding:7px 0;font-size:13px;color:rgba(255,255,255,.75)}' +
      '.co-summary-line .co-sv{font-weight:700;color:#fff}' +
      '.co-summary-line.co-grand{border-top:1px solid rgba(255,255,255,.14);margin-top:4px;padding-top:11px;font-size:15px;color:#F2B233}' +
      '.co-summary-line.co-grand .co-sv{font-weight:800}' +
      '.co-timeline{position:relative;padding-left:22px}' +
      '.co-timeline::before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:rgba(255,255,255,.16)}' +
      '.co-tl-step{position:relative;padding:0 0 16px 0}' +
      '.co-tl-step:last-child{padding-bottom:0}' +
      '.co-tl-dot{position:absolute;left:-22px;top:2px;width:14px;height:14px;border-radius:50%;border:2px solid #14472F;box-shadow:0 0 0 2px rgba(255,255,255,.25);background:rgba(255,255,255,.12)}' +
      '.co-tl-step.done .co-tl-dot{background:#16A34A;box-shadow:0 0 0 2px #16A34A}' +
      '.co-tl-step.current .co-tl-dot{background:#F2B233;box-shadow:0 0 0 2px #F2B233}' +
      '.co-tl-step.cancelled .co-tl-dot{background:#EF4444;box-shadow:0 0 0 2px #EF4444}' +
      '.co-tl-title{font-size:13px;font-weight:700;color:#fff}' +
      '.co-tl-time{font-size:11px;color:rgba(255,255,255,.6);margin-top:2px}' +
      '.co-tl-note{font-size:11px;color:#F2B233;margin-top:2px;font-weight:600}' +
      '.co-drawer-foot{padding:14px 20px;border-top:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);display:flex;gap:8px;flex-wrap:wrap}' +
      '.co-order-chips{display:flex;gap:6px;flex-wrap:wrap}' +
      '.co-chip{padding:5px 11px;border-radius:20px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08);font-size:11px;font-weight:700;color:rgba(255,255,255,.85);cursor:pointer;font-family:inherit}' +
      '.co-chip:hover{color:#F2B233;border-color:#F2B233}' +
      '.co-chip.active{background:#F2B233;border-color:#F2B233;color:#14472F}' +
      '.co-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
      '.co-detail-item{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 12px}' +
      '.co-detail-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.3px}' +
      '.co-detail-val{font-size:13px;font-weight:600;color:#fff;margin-top:2px}' +
      '.co-timeline{position:relative;padding-left:20px}' +
      '.co-timeline-item{position:relative;padding:8px 0 8px 16px;font-size:12px;color:#64748b}' +
      '.co-timeline-item::before{content:"";position:absolute;left:-4px;top:12px;width:8px;height:8px;border-radius:50%;background:#e2e8f0;border:2px solid #fff}' +
      '.co-timeline-item.active::before{background:#22c55e}' +
      '.co-timeline-item.done::before{background:#065f46}' +
      '.co-timeline-item.current::before{background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.2)}' +
      '</style>';
  }

  function pageHeaderHtml() {
    return '';
  }

  function kpiHtml(k) {
    var items = [
      { label: 'Total Customers', value: String(k.customers), icon: 'fa-users', sub: 'Registered &amp; active buyers' },
      { label: 'Total Orders', value: String(k.orders), icon: 'fa-receipt', sub: 'Across all customers' },
      { label: 'Total Revenue', value: money(k.revenue), icon: 'fa-indian-rupee-sign', sub: 'Gross order value' },
      { label: 'AOV', value: money(k.aov), icon: 'fa-chart-line', sub: 'Average order value' },
      { label: 'Repeat Customers', value: String(k.repeat), icon: 'fa-repeat', sub: 'Placed 2+ orders' }
    ];
    return '<div class="co-kpis">' + items.map(function (it) {
      return '<div class="co-kpi">' +
        '<div class="co-kpi-top"><span class="co-kpi-label">' + it.label + '</span><span class="co-kpi-icon"><i class="fas ' + it.icon + '"></i></span></div>' +
        '<div class="co-kpi-value">' + it.value + '</div>' +
        '<div class="co-kpi-sub">' + it.sub + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function statusOptions() {
    return ['all', 'pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];
  }

  function selOpts(list, val, labelFor, placeholder) {
    var html = '<option value="">' + placeholder + '</option>';
    list.forEach(function (v) {
      html += '<option value="' + v + '"' + (v === val ? ' selected' : '') + '>' + labelFor(v) + '</option>';
    });
    return html;
  }

  function typeTab(type, icon, label) {
    return '<button class="co-type' + (state.orderType === type ? ' active' : '') + '" onclick="CustomersOrders.setOrderType(\'' + type + '\')"><i class="fas ' + icon + '"></i> ' + label + '</button>';
  }

  function filterBarHtml() {
    var countryVal = state.country;
    var cities = COUNTRY_CITIES[countryVal] || [];
    var cityOpts = '<option value="">All Cities</option>' + cities.map(function (c) { return '<option value="' + esc(c) + '"' + (state.city === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
    var orderStatusSel = selOpts(statusOptions(), state.orderStatus, function (s) { return s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1); }, 'All Statuses');
    var payStatusSel = selOpts(['Paid', 'Pending', 'Refunded'], state.paymentStatus, function (s) { return s; }, 'All Statuses');

    return '' +
      '<div class="co-card">' +
        '<div class="co-typebar">' +
          typeTab('all', 'fa-border-all', 'All Orders') +
          typeTab('Shop', 'fa-store', 'Shop') +
          typeTab('Small Box', 'fa-box', 'Small Box') +
          typeTab('Big Box', 'fa-box-open', 'Big Box') +
          typeTab('B2B', 'fa-building', 'B2B') +
        '</div>' +
        '<div class="co-card-pad">' +
          '<div class="co-grid-4">' +
            '<div class="co-field">' +
              '<label><i class="fas fa-search"></i> Search</label>' +
              '<input type="text" id="coSearch" value="' + esc(state.search) + '" placeholder="Customer name, email, phone or Order ID..." oninput="CustomersOrders.setSearch(this.value)">' +
            '</div>' +
            '<div class="co-field">' +
              '<label>City</label>' +
              '<select onchange="CustomersOrders.setCity(this.value)">' + cityOpts + '</select>' +
            '</div>' +
            '<div class="co-field">' +
              '<label>Order Status</label>' +
              '<select onchange="CustomersOrders.setOrderStatus(this.value)">' + orderStatusSel + '</select>' +
            '</div>' +
            '<div class="co-field">' +
              '<label>Payment Status</label>' +
              '<select onchange="CustomersOrders.setPaymentStatus(this.value)">' + payStatusSel + '</select>' +
            '</div>' +
            '<div class="co-field">' +
              '<label>Date From</label>' +
              '<input type="date" value="' + esc(state.dateFrom) + '" onchange="CustomersOrders.setDateFrom(this.value)">' +
            '</div>' +
            '<div class="co-field">' +
              '<label>Date To</label>' +
              '<input type="date" value="' + esc(state.dateTo) + '" onchange="CustomersOrders.setDateTo(this.value)">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="co-more-filters' + (state.moreOpen ? ' open' : '') + '" id="coMoreFilters">' +
          '<div class="co-grid-4">' +
            '<div class="co-field"><label>Min Total Spent</label><input type="number" min="0" value="' + esc(state.minSpent) + '" placeholder="0" onchange="CustomersOrders.setMinSpent(this.value)"></div>' +
            '<div class="co-field"><label>Max Total Spent</label><input type="number" min="0" value="' + esc(state.maxSpent) + '" placeholder="Any" onchange="CustomersOrders.setMaxSpent(this.value)"></div>' +
            '<div class="co-field"><label>Sort By</label>' +
              '<select onchange="CustomersOrders.setSortBy(this.value)">' +
                '<option value="lastOrder"' + (state.sortBy === 'lastOrder' ? ' selected' : '') + '>Last Order</option>' +
                '<option value="name"' + (state.sortBy === 'name' ? ' selected' : '') + '>Name</option>' +
                '<option value="totalOrders"' + (state.sortBy === 'totalOrders' ? ' selected' : '') + '>Total Orders</option>' +
                '<option value="totalSpent"' + (state.sortBy === 'totalSpent' ? ' selected' : '') + '>Total Spent</option>' +
              '</select>' +
            '</div>' +
            '<div class="co-field" style="display:flex;align-items:flex-end">' +
              '<button class="co-btn co-btn-primary co-btn-sm" onclick="CustomersOrders.resetFilters()"><i class="fas fa-redo"></i> Reset All</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function tableCardHtml(rows, total, paged) {
    var sortOpts = [
      { v: 'lastOrder', l: 'Last Order' }, { v: 'name', l: 'Name' },
      { v: 'totalOrders', l: 'Total Orders' }, { v: 'totalSpent', l: 'Total Spent' }
    ];
    var sortHtml = sortOpts.map(function (s) {
      return '<button class="co-btn co-btn-sm' + (state.sortBy === s.v ? ' co-btn-primary' : '') + '" onclick="CustomersOrders.setSortBy(\'' + s.v + '\')">' + s.l + '</button>';
    }).join('');

    var bodyHtml = '';
    if (!rows.length) {
      bodyHtml = '<div class="co-empty"><i class="fas fa-inbox" style="font-size:28px;margin-bottom:8px;display:block"></i>No customers found for the selected filters.</div>';
    } else {
      bodyHtml = rows.map(function (c) {
        return '<tr>' +
          '<td data-label="Customer ID"><span class="co-num">' + esc(c.customerID || '–') + '</span></td>' +
          '<td data-label="Name"><div class="co-cust">' + avatarHtml(c) +
            '<div><div class="co-cust-name">' + esc(c.name) + '</div><div class="co-cust-mail">' + esc(c.email) + '</div></div>' +
          '</div></td>' +
          '<td data-label="Phone"><div class="co-contact">' + esc(c.phone || '–') + '</div></td>' +
          '<td data-label="Orders"><span class="co-num">' + c.totalOrders + '</span></td>' +
          '<td data-label="Total Spent"><span class="co-num">' + money(c.totalSpent) + '</span></td>' +
          '<td data-label="Avg Order Value"><span class="co-num">' + money(c.avgOrderValue) + '</span></td>' +
          '<td data-label="Last Order"><div style="font-size:12px;color:#6B7280">' + (c.lastOrder ? esc(c.lastOrder.date) : '–') + '</div><div style="font-size:11px;color:#9CA3AF">' + (c.lastOrder ? esc(c.lastOrder.id) : '') + '</div></td>' +
          '<td data-label="Status">' + '<span class="co-pill" style="color:' + (c.customerStatus === 'Active' ? '#16A34A' : '#DC2626') + ';background:transparent;border:none">' + esc(c.customerStatus || 'Active') + '</span>' + '</td>' +
          '<td data-label="" class="co-no-label"><div class="co-action">' +
            '<button class="co-action-btn" title="Order Details" onclick="CustomersOrders.openOrder(\'' + esc(c.lastOrder.id).replace(/'/g, "&#39;") + '\')"><i class="fas fa-eye"></i></button>' +
            '<div class="co-menu-wrap">' +
              '<button class="co-action-btn" title="More" onclick="event.stopPropagation();CustomersOrders.toggleMenu(\'' + esc(c.email).replace(/'/g, "&#39;") + '\')"><i class="fas fa-ellipsis-v"></i></button>' +
              '<div class="co-menu" id="coMenu-' + esc(c.email) + '" style="display:none">' +
                (c.profile ? '<a href="#" onclick="event.preventDefault();CustomersOrders.closeMenus();UserManager.openUserDetail(\'' + esc(c.profile.id).replace(/'/g, "&#39;") + '\')"><i class="fas fa-user" style="width:16px;color:#065F46"></i> View Customer Profile</a>' : '') +
                '<a href="#" onclick="event.preventDefault();CustomersOrders.closeMenus();CustomersOrders.exportCustomer(\'' + esc(c.email) + '\')"><i class="fas fa-download" style="width:16px;color:#2563EB"></i> Export Customer</a>' +
              '</div>' +
            '</div>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }

    var pagerHtml = '';
    if (paged.pages > 1) {
      pagerHtml = '<button onclick="CustomersOrders.goToPage(' + (paged.page - 1) + ')"' + (paged.page <= 1 ? ' disabled' : '') + '><i class="fas fa-chevron-left"></i></button>';
      for (var i = 1; i <= paged.pages; i++) {
        if (i === 1 || i === paged.pages || Math.abs(i - paged.page) <= 1) {
          pagerHtml += '<button class="' + (i === paged.page ? 'active' : '') + '" onclick="CustomersOrders.goToPage(' + i + ')">' + i + '</button>';
        } else if (Math.abs(i - paged.page) === 2) {
          pagerHtml += '<span style="padding:6px 2px;color:#9CA3AF">…</span>';
        }
      }
      pagerHtml += '<button onclick="CustomersOrders.goToPage(' + (paged.page + 1) + ')"' + (paged.page >= paged.pages ? ' disabled' : '') + '><i class="fas fa-chevron-right"></i></button>';
    }

    var start = (paged.page - 1) * state.perPage + 1;
    var end = Math.min(start + rows.length - 1, total);

    return '' +
      '<div class="co-card">' +
        '<div class="co-card-header">' +
          '<span class="co-summary">Showing <b>' + (total ? start : 0) + '–' + (total ? end : 0) + '</b> of <b>' + total + '</b> customers</span>' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
            '<span style="font-size:12px;color:#6B7280">Sort:</span>' + sortHtml +
            '<button class="co-btn co-btn-sm" onclick="CustomersOrders.exportCSV()"><i class="fas fa-download"></i> Export</button>' +
            '<button class="co-btn co-btn-sm" onclick="CustomersOrders.printView()"><i class="fas fa-print"></i> Print</button>' +
          '</div>' +
        '</div>' +
        '<div class="co-table-wrap">' +
'<table class="co-table">' +
            '<thead><tr>' +
              '<th>Customer ID</th><th>Name</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Avg Order Value</th><th>Last Order</th><th>Status</th><th></th>' +
            '</tr></thead>' +
            '<tbody>' + bodyHtml + '</tbody>' +
          '</table>' +
        '</div>' +
        (pagerHtml ? '<div class="co-pager">' + pagerHtml + '</div>' : '') +
      '</div>';
  }

  /* ---- Drawer ---- */
  function drawerHtml() {
    return '' +
      '<div class="co-drawer-overlay" id="coOverlay" onclick="CustomersOrders.closeDrawer()"></div>' +
      '<div class="co-drawer" id="coDrawer">' +
        '<div class="co-drawer-head">' +
          '<h3><i class="fas fa-receipt" style="margin-right:6px"></i> Order Details</h3>' +
          '<button class="co-drawer-close" onclick="CustomersOrders.closeDrawer()"><i class="fas fa-times"></i></button>' +
        '</div>' +
        '<div class="co-drawer-body" id="coDrawerBody"></div>' +
        '<div class="co-drawer-foot" id="coDrawerFoot"></div>' +
      '</div>';
  }

  function ensureDrawer() {
    if (!document.getElementById('coDrawer')) {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = drawerHtml();
      while (wrapper.firstChild) {
        document.body.appendChild(wrapper.firstChild);
      }
    }
  }

  function renderDrawer(orderId) {
    var o = null;
    var cust = null;
    buildCustomers().forEach(function (c) {
      c.orders.forEach(function (x) { if (x.id === orderId) { o = x; cust = c; } });
    });
    if (!o) return;
    state.activeOrder = orderId;
    var body = document.getElementById('coDrawerBody');
    var foot = document.getElementById('coDrawerFoot');
    var overlay = document.getElementById('coOverlay');
    var drawer = document.getElementById('coDrawer');
    if (!body || !foot || !overlay || !drawer) return;

    body.innerHTML = drawerBodyHtml(o, cust);
    foot.innerHTML = drawerFootHtml(o);
    overlay.classList.add('open');
    drawer.classList.add('open');
  }

  function drawerBodyHtml(o, cust) {
    var ps = paymentStatusOf(o);
    o = enhanceOrder(o);
    var itemsHtml = (o.items || []).map(function (it) {
      var img = state.productImages[it.name];
      var imgHtml = img
        ? '<img src="' + img + '" alt="' + esc(it.name) + '">'
        : '<i class="fas fa-box" style="color:#F2B233"></i>';
      var unit = it.unit || '';
      return '<div class="co-item-row">' +
        '<div class="co-item-img">' + imgHtml + '</div>' +
        '<div class="co-item-info">' +
          '<div class="co-item-name">' + esc(it.name) + '</div>' +
          '<div class="co-item-meta">' + esc(it.sku) + ' · ' + esc(it.cat) + (unit ? ' · ' + esc(unit) : '') + '</div>' +
          '<div class="co-item-meta">Qty: ' + it.qty + '</div>' +
        '</div>' +
        '<div class="co-item-price">' + money(it.price * it.qty) + '<div style="font-size:11px;color:rgba(255,255,255,.5);font-weight:400">' + money(it.price) + ' × ' + it.qty + '</div></div>' +
      '</div>';
    }).join('');

    var detail = function (label, value) {
      return '<div class="co-detail-item"><div class="co-dl">' + label + '</div><div class="co-dv">' + value + '</div></div>';
    };

    var pStatus = ps === 'Refunded' ? '#DC2626' : ps === 'Paid' ? '#16A34A' : '#D97706';

    /* Timeline */
    var timelineHtml = '';
    if (o.status === 'cancelled') {
      timelineHtml += tlStep(false, false, true, 'Order Placed', dateFromISO(o.date, 0) + ', ' + orderTime(o), '');
      timelineHtml += tlStep(false, false, false, 'Payment Confirmed', '', '');
      timelineHtml += tlStep(false, false, false, 'Order Processing', '', '');
      timelineHtml += tlStep(false, false, false, 'Packed', '', '');
      timelineHtml += tlStep(false, false, false, 'Shipped', '', '');
      timelineHtml += tlStep(false, false, false, 'Out for Delivery', '', '');
      timelineHtml += tlStep(false, false, true, 'Cancelled', dateFromISO(o.date, 0) + ', ' + orderTime(o), 'Order was cancelled by the customer or admin');
    } else {
      var flow = ORDER_FLOW;
      var idx = flow.indexOf(o.status);
      if (idx < 0) idx = 0;
      var labels = ['Order Placed', 'Payment Confirmed', 'Order Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
      for (var i = 0; i < labels.length; i++) {
        var done = i < idx;
        var current = i === idx;
        var time = (i === 0 ? dateFromISO(o.date, 0) : dateFromISO(o.date, i)) + ', ' + orderTime(o);
        timelineHtml += tlStep(done, current, false, labels[i], done || current ? time : '', current && o.status === 'delivered' ? 'Completed' : '');
      }
    }

    function tlStep(done, current, cancelled, title, time, note) {
      var cls = cancelled ? ' cancelled' : (done ? ' done' : (current ? ' current' : ''));
      return '<div class="co-tl-step' + cls + '">' +
        '<div class="co-tl-dot"></div>' +
        '<div class="co-tl-title">' + title + '</div>' +
        (time ? '<div class="co-tl-time">' + time + '</div>' : '') +
        (note ? '<div class="co-tl-note">' + note + '</div>' : '') +
      '</div>';
    }

    var orderChips = cust.orders.map(function (x) {
      return '<button class="co-chip' + (x.id === o.id ? ' active' : '') + '" onclick="CustomersOrders.openOrder(\'' + esc(x.id).replace(/'/g, "&#39;") + '\')">' + esc(x.id) + '</button>';
    }).join('');

    return '' +
      /* order meta */
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">' +
        '<span style="font-size:18px;font-weight:800;color:#fff">' + esc(o.id) + '</span>' +
        orderTypeBadge(orderTypeOf(o)) +
        statusPill(o.status) +
        '<span class="co-pill" style="color:' + pStatus + ';background:transparent;border:none">' + ps + '</span>' +
        '<span style="font-size:12px;color:rgba(255,255,255,.6);margin-left:auto">' + esc(o.date) + ' · ' + orderTime(o) + '</span>' +
      '</div>' +
      '<div style="margin-bottom:14px"><span style="font-size:11px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.5px">Other orders from this customer</span>' +
        '<div class="co-order-chips" style="margin-top:6px">' + orderChips + '</div>' +
      '</div>' +

      /* customer */
      '<div class="co-sec">' +
        '<div class="co-sec-head"><i class="fas fa-user"></i> Customer Details</div>' +
        '<div class="co-sec-body">' +
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">' +
            avatarHtml(cust) +
            '<div><div style="font-weight:800;color:#fff;font-size:15px">' + esc(cust.name) + '</div>' +
            '<div style="font-size:12px;color:rgba(255,255,255,.65)">' + esc(cust.email) + '</div></div>' +
            (cust.profile ? '<span style="margin-left:auto"><button class="co-btn co-btn-sm" onclick="CustomersOrders.closeMenus();UserManager.openUserDetail(\'' + esc(cust.profile.id).replace(/'/g, "&#39;") + '\')"><i class="fas fa-user"></i> View Customer</button></span>' : '') +
          '</div>' +
          '<div class="co-detail-grid">' +
            detail('Customer ID', cust.customerID || (cust.profile ? esc(cust.profile.id) : '–')) +
            detail('Full Name', esc(cust.name || '–')) +
            detail('Phone', esc(cust.phone || '–')) +
            detail('Email', esc(cust.email || '–')) +
            detail('Address', esc(cust.address || '–')) +
            detail('Registration Date', esc(cust.registrationDate || '–')) +
            detail('Total Orders', String(cust.totalOrders || 0)) +
            detail('Total Spent', money(cust.totalSpent)) +
            detail('Avg Order Value', money(cust.avgOrderValue)) +
            detail('Customer Status', '<span class="co-pill" style="color:' + (cust.customerStatus === 'Active' ? '#16A34A' : '#DC2626') + ';background:transparent;border:none">' + (cust.customerStatus || 'Active') + '</span>') +
          '</div>' +
        '</div>' +
      '</div>' +

      /* order information */
      '<div class="co-sec">' +
        '<div class="co-sec-head"><i class="fas fa-receipt"></i> Order Information</div>' +
        '<div class="co-sec-body">' +
          '<div class="co-detail-grid">' +
            detail('Order ID', esc(o.id)) +
            detail('Order Date', esc(o.date) + ' · ' + orderTime(o)) +
            detail('Order Status', statusPill(o.status)) +
            detail('Payment Method', esc(o.paymentMethod || o.payment || 'Credit Card')) +
            detail('Payment Status', '<span class="co-pill" style="color:' + pStatus + ';background:transparent;border:none">' + o.paymentStatus + '</span>') +
            detail('Tracking Number', esc(o.trackingNumber)) +
            detail('Tax', money(o.tax)) +
            detail('Discount', money(o.discount)) +
            detail('Shipping', money(o.delivery)) +
            detail('Grand Total', '<span style="font-size:15px;font-weight:800;color:#F2B233">' + money(o.total) + '</span>') +
          '</div>' +
          '<div style="border-top:1px solid rgba(255,255,255,.12);margin-top:10px;padding-top:10px">' +
            '<div class="co-summary-line"><span>Subtotal</span><span class="co-sv">' + money(o.subtotal) + '</span></div>' +
            '<div class="co-summary-line"><span>Discount</span><span class="co-sv" style="color:#16A34A">' + money(o.discount) + '</span></div>' +
            '<div class="co-summary-line"><span>Tax (10%)</span><span class="co-sv">' + money(o.tax) + '</span></div>' +
            '<div class="co-summary-line"><span>Delivery Charge</span><span class="co-sv">' + money(o.delivery) + '</span></div>' +
            '<div class="co-summary-line co-grand"><span>Grand Total</span><span class="co-sv">' + money(o.total) + '</span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* products */
      '<div class="co-sec">' +
        '<div class="co-sec-head"><i class="fas fa-box-open"></i> Ordered Products (' + (o.items || []).length + ')</div>' +
        '<div class="co-sec-body"><div class="co-drawer-items">' + itemsHtml + '</div></div>' +
      '</div>' +

      /* payment */
      '<div class="co-sec">' +
        '<div class="co-sec-head"><i class="fas fa-credit-card"></i> Payment Info</div>' +
        '<div class="co-sec-body">' +
          '<div class="co-detail-grid">' +
            detail('Status', ps) +
            detail('Method', esc(o.payment || '–')) +
            detail('Platform', esc(platformFor(o.payment))) +
            detail('Transaction ID', esc(txnFor(o))) +
            detail('Payment Date', esc(o.date)) +
            detail('Payment Time', orderTime(o)) +
            detail('Amount', money(o.total)) +
            detail('Currency', (COUNTRY_CURRENCY[state.country] || {}).code || '') +
          '</div>' +
        '</div>' +
      '</div>' +

      /* timeline */
      '<div class="co-sec">' +
        '<div class="co-sec-head"><i class="fas fa-stream"></i> Order Timeline</div>' +
        '<div class="co-sec-body"><div class="co-timeline">' + timelineHtml + '</div></div>' +
      '</div>' +

      /* delivery */
      '<div class="co-sec">' +
        '<div class="co-sec-head"><i class="fas fa-truck"></i> Delivery Details</div>' +
        '<div class="co-sec-body">' +
          '<div class="co-detail-grid">' +
            detail('Recipient', esc(o.customer || '–')) +
            detail('Phone', esc(o.phone || '–')) +
            detail('Country', countryLabel(o.country)) +
            detail('Tracking Number', esc(o.trackingNumber)) +
          '</div>' +
          '<div style="margin-top:10px"><div class="co-detail-item"><div class="co-dl">Delivery Address</div><div class="co-dv" style="font-weight:400;font-size:13px">' + esc(o.address || '–') + '</div></div></div>' +
        '</div>' +
      '</div>';
  }

  function drawerFootHtml(o) {
    var refunded = !!o.refunded;
    return '' +
      '<button class="co-btn co-btn-primary' + (refunded ? '" disabled style="opacity:.55' : '') + '" onclick="CustomersOrders.refundOrder(\'' + esc(o.id).replace(/'/g, "&#39;") + '\')"><i class="fas fa-undo"></i> ' + (refunded ? 'Refunded' : 'Refund') + '</button>' +
      '<button class="co-btn" onclick="CustomersOrders.downloadInvoice(\'' + esc(o.id).replace(/'/g, "&#39;") + '\')"><i class="fas fa-file-invoice"></i> Download Invoice</button>' +
      '<button class="co-btn" onclick="CustomersOrders.printOrder(\'' + esc(o.id).replace(/'/g, "&#39;") + '\')"><i class="fas fa-print"></i> Print Order</button>';
  }

  /* ---- Actions ---- */
  function openOrder(id) {
    renderDrawer(id);
  }

  function closeDrawer() {
    var overlay = document.getElementById('coOverlay');
    var drawer = document.getElementById('coDrawer');
    if (overlay) overlay.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
    state.activeOrder = null;
    state.activeMenu = null;
  }

  function toggleMenu(email) {
    closeMenus();
    var menu = document.getElementById('coMenu-' + email);
    if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    state.activeMenu = menu ? menu.style.display === 'block' : false;
  }

  function closeMenus() {
    document.querySelectorAll('.co-menu').forEach(function (m) { m.style.display = 'none'; });
    state.activeMenu = null;
  }

  function exportCustomer(email) {
    var cust = buildCustomers().find(function (c) { return c.email === email; });
    if (!cust) return;
    var rows = cust.orders.map(function (o) {
      return [o.id, o.customer, o.email, o.payment, o.total, o.date, o.status].join(',');
    });
    var csv = 'Order ID,Customer,Email,Payment,Amount,Date,Status\n' + rows.join('\n');
    downloadFile('customer-' + cust.name.replace(/[^a-z0-9]+/gi, '-') + '.csv', csv, 'text/csv');
  }

  function exportCSV() {
    var list = getFiltered();
    var rows = list.map(function (c) {
      return [c.name, c.email, c.phone, (c.address || '').replace(/,/g, ' '), c.country, c.totalOrders, c.productsPurchased, c.totalSpent.toFixed(2), c.lastOrder ? c.lastOrder.date : '', c.lastOrder ? c.lastOrder.id : '', customerStatus(c)].join(',');
    });
    var csv = 'Customer,Email,Phone,Address,Country,Total Orders,Products Purchased,Total Spent,Last Order Date,Last Order ID,Status\n' + rows.join('\n');
    downloadFile('customers-orders-' + state.country.toLowerCase() + '.csv', csv, 'text/csv');
  }

  function printView() {
    var list = getFiltered();
    var bodyHtml = list.map(function (c) {
      return '<tr><td>' + esc(c.name) + '<br><small>' + esc(c.email) + '</small></td><td>' + esc(c.phone) + '</td><td>' + esc(c.country) + '</td><td>' + c.totalOrders + '</td><td>' + c.productsPurchased + '</td><td>' + money(c.totalSpent) + '</td><td>' + (c.lastOrder ? c.lastOrder.date : '–') + '</td><td>' + customerStatus(c) + '</td></tr>';
    }).join('');
    openPrintWindow(
      '<h2>Customers &amp; Orders – ' + esc(state.country) + '</h2>' +
      '<table><thead><tr><th>Customer</th><th>Contact</th><th>Country</th><th>Orders</th><th>Products</th><th>Total Spent</th><th>Last Order</th><th>Status</th></tr></thead><tbody>' + bodyHtml + '</tbody></table>'
    );
  }

  function downloadInvoice(orderId) {
    var o = allOrders().find(function (x) { return x.id === orderId; });
    if (!o) return;
    var itemsHtml = (o.items || []).map(function (it) {
      return '<tr><td>' + esc(it.name) + '</td><td>' + it.qty + '</td><td>' + money(it.price) + '</td><td>' + money(it.price * it.qty) + '</td></tr>';
    }).join('');
    var html = '<html><head><meta charset="utf-8"><title>Invoice ' + esc(o.id) + '</title>' +
      '<style>body{font-family:Inter,Arial,sans-serif;padding:30px;color:#111}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:13px;text-align:left}th{background:#f8fafc}.h{font-size:20px;font-weight:800;color:#065F46}</style>' +
      '</head><body>' +
      '<div class="h">VPNexues – Tax Invoice</div>' +
      '<p><b>Invoice #:</b> ' + esc(o.id) + ' &nbsp;|&nbsp; <b>Date:</b> ' + esc(o.date) + ' &nbsp;|&nbsp; <b>Payment:</b> ' + esc(o.payment) + '</p>' +
      '<p><b>Bill To:</b> ' + esc(o.customer) + '<br>' + esc(o.email) + '<br>' + esc(o.phone) + '<br>' + esc(o.address) + ', ' + esc(o.country) + '</p>' +
      '<table><thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
      '<p style="text-align:right"><b>Subtotal:</b> ' + money(o.subtotal) + '<br><b>Delivery:</b> ' + money(o.delivery) + '<br><b style="font-size:16px">Grand Total:</b> <b style="font-size:16px">' + money(o.total) + '</b></p>' +
      '<p style="color:#999;font-size:11px;margin-top:40px">Generated on ' + new Date().toLocaleString() + ' · Status: ' + statusLabel(o.status) + '</p>' +
      '</body></html>';
    downloadFile('invoice-' + o.id + '.html', html, 'text/html');
  }

  function printOrder(orderId) {
    var o = allOrders().find(function (x) { return x.id === orderId; });
    if (!o) return;
    var itemsHtml = (o.items || []).map(function (it) {
      return '<tr><td>' + esc(it.name) + '</td><td>' + it.qty + '</td><td>' + money(it.price) + '</td><td>' + money(it.price * it.qty) + '</td></tr>';
    }).join('');
    openPrintWindow(
      '<h2>Order Details – ' + esc(o.id) + '</h2>' +
      '<p><b>Customer:</b> ' + esc(o.customer) + ' (' + esc(o.email) + ') · <b>Phone:</b> ' + esc(o.phone) + '</p>' +
      '<p><b>Date:</b> ' + esc(o.date) + ' · <b>Payment:</b> ' + esc(o.payment) + ' · <b>Status:</b> ' + statusLabel(o.status) + '</p>' +
      '<p><b>Address:</b> ' + esc(o.address) + ', ' + esc(o.country) + '</p>' +
      '<table><thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
      '<p style="text-align:right"><b>Subtotal:</b> ' + money(o.subtotal) + '<br><b>Delivery:</b> ' + money(o.delivery) + '<br><b style="font-size:16px">Grand Total:</b> <b style="font-size:16px">' + money(o.total) + '</b></p>'
    );
  }

  function refundOrder(orderId) {
    var o = allOrders().find(function (x) { return x.id === orderId; });
    if (!o) return;
    if (o.refunded) return;
    if (!confirm('Refund order ' + orderId + ' for ' + money(o.total) + '? This cannot be undone.')) return;
    o.refunded = true;
    if (window.OrderManager && OrderManager.persist) OrderManager.persist();
    renderDrawer(orderId);
    renderPage();
    if (typeof window.showToast === 'function') window.showToast('Order ' + orderId + ' refunded successfully!');
  }

  function statusLabel(status) {
    return (status || '').charAt(0).toUpperCase() + (status || '').slice(1);
  }

  function downloadFile(name, content, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function openPrintWindow(bodyHtml) {
    var html = '<html><head><title>Customers &amp; Orders</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px;color:#111}h2{color:#065F46}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left}th{background:#f8fafc}</style></head><body>' + bodyHtml + '</body></html>';
    var win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  }

  /* ---- Filter setters ---- */
  function setSearch(v) { state.search = v; state.page = 1; renderPage(); }
  function setCountry(v) { state.country = v; state.city = ''; state.page = 1; renderPage(); }
  function setCity(v) { state.city = v; state.page = 1; renderPage(); }
  function setOrderStatus(v) { state.orderStatus = v || 'all'; state.page = 1; renderPage(); }
  function setPaymentStatus(v) { state.paymentStatus = v || 'all'; state.page = 1; renderPage(); }
  function setOrderType(v) { state.orderType = v || 'all'; state.page = 1; renderPage(); }
  function setDateFrom(v) { state.dateFrom = v || ''; state.page = 1; renderPage(); }
  function setDateTo(v) { state.dateTo = v || ''; state.page = 1; renderPage(); }
  function setMinSpent(v) { state.minSpent = v === '' ? '' : v; state.page = 1; renderPage(); }
  function setMaxSpent(v) { state.maxSpent = v === '' ? '' : v; state.page = 1; renderPage(); }
  function setSortBy(key) {
    if (state.sortBy === key) {
      state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortBy = key;
      state.sortDir = 'desc';
    }
    state.page = 1;
    renderPage();
  }
  function toggleMore() { state.moreOpen = !state.moreOpen; renderPage(); }
  function resetFilters() {
    state.search = ''; state.orderStatus = 'all'; state.paymentStatus = 'all'; state.orderType = 'all';
    state.dateFrom = ''; state.dateTo = ''; state.minSpent = ''; state.maxSpent = '';
    state.sortBy = 'lastOrder'; state.sortDir = 'desc'; state.page = 1; state.moreOpen = false; state.city = '';
    renderPage();
  }
  function goToPage(p) {
    var filtered = getFiltered();
    var totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    state.page = p;
    renderPage();
  }

  window.CustomersOrders = {
    configure: function (opts) {
      opts = opts || {};
      state.country = opts.country || 'India';
      state.rootId = opts.rootId || 'co-root';
      state.productImages = opts.productImages || {};
    },
    render: renderPage,
    openOrder: openOrder,
    closeDrawer: closeDrawer,
    toggleMenu: toggleMenu,
    closeMenus: closeMenus,
    exportCSV: exportCSV,
    exportCustomer: exportCustomer,
    printView: printView,
    downloadInvoice: downloadInvoice,
    printOrder: printOrder,
    refundOrder: refundOrder,
    setSearch: setSearch,
    setCountry: setCountry,
    setCity: setCity,
    setOrderStatus: setOrderStatus,
    setPaymentStatus: setPaymentStatus,
    setOrderType: setOrderType,
    setDateFrom: setDateFrom,
    setDateTo: setDateTo,
    setMinSpent: setMinSpent,
    setMaxSpent: setMaxSpent,
    setSortBy: setSortBy,
    toggleMore: toggleMore,
    resetFilters: resetFilters,
    goToPage: goToPage,
    getCustomers: function () { return buildCustomers(); },
    getOrders: function () { return allOrders().filter(function (o) { return o.country === state.country; }); }
  };

  document.addEventListener('click', function (e) {
    if (state.activeMenu) closeMenus();
  });
})();