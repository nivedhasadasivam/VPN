/* VPNexues DashboardAPI
 * Shared data service for admin dashboards.
 * Generates a deterministic default order dataset (per country), persists it
 * under 'vpnexues_orders', and derives dashboard statistics from it.
 */
(function () {
  'use strict';

  var ORDERS_KEY = 'vpnexues_orders';
  var USERS_KEY = 'vpnexues_users';

  /* In-memory fallbacks so dashboards still render when localStorage is
   * empty or unavailable (e.g. pages opened directly via file://). */
  var _ordersFallback = null;
  var _usersFallback = null;

  var COUNTRIES = ['India', 'UAE', 'US', 'Singapore'];
  var COUNTRY_CODE = { India: 'IN', UAE: 'AE', US: 'US', Singapore: 'SG' };

  /* Local currency config per dashboard country */
  var CURRENCY = {
    India: { sym: '\u20B9', digits: 0 },
    UAE: { sym: 'AED ', digits: 2 },
    US: { sym: '$', digits: 2 },
    Singapore: { sym: 'S$', digits: 2 }
  };

  /* Approximate local price factor vs USD base price (matches catalog prices) */
  var FX = { India: 62, UAE: 3.68, US: 1, Singapore: 1.354 };

  /* Deterministic PRNG so the seeded dataset is stable */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var PRODUCTS = [
    { name: 'Organic Carrots', sku: 'GPNX-001', cat: 'Vegetables', usd: 2.8 },
    { name: 'Vine Tomatoes', sku: 'GPNX-002', cat: 'Vegetables', usd: 3.9 },
    { name: 'Baby Spinach', sku: 'GPNX-003', cat: 'Vegetables', usd: 3.2 },
    { name: 'Sweet Corn', sku: 'GPNX-004', cat: 'Vegetables', usd: 1.9 },
    { name: 'Red Onions', sku: 'GPNX-005', cat: 'Vegetables', usd: 2.2 },
    { name: 'Bell Peppers Mix', sku: 'GPNX-006', cat: 'Vegetables', usd: 4.5 },
    { name: 'Broccoli Head', sku: 'GPNX-007', cat: 'Vegetables', usd: 3.5 },
    { name: 'Cucumber', sku: 'GPNX-008', cat: 'Vegetables', usd: 1.8 },
    { name: 'Zucchini', sku: 'GPNX-009', cat: 'Vegetables', usd: 2.9 },
    { name: 'Cherry Tomatoes', sku: 'GPNX-010', cat: 'Vegetables', usd: 4.2 },
    { name: 'Kale Bunch', sku: 'GPNX-011', cat: 'Vegetables', usd: 3.8 },
    { name: 'Cauliflower', sku: 'GPNX-013', cat: 'Vegetables', usd: 3.9 },
    { name: 'Iceberg Lettuce', sku: 'GPNX-041', cat: 'Vegetables', usd: 2.9 },
    { name: 'Alphonso Mango', sku: 'GPNX-051', cat: 'Fruits', usd: 12.0 },
    { name: 'Fresh Bananas', sku: 'GPNX-052', cat: 'Fruits', usd: 3.2 },
    { name: 'Green Apples', sku: 'GPNX-054', cat: 'Fruits', usd: 5.8 },
    { name: 'Papaya', sku: 'GPNX-055', cat: 'Fruits', usd: 5.5 },
    { name: 'Pomegranate', sku: 'GPNX-056', cat: 'Fruits', usd: 8.8 },
    { name: 'Fresh Pineapple', sku: 'GPNX-057', cat: 'Fruits', usd: 6.8 },
    { name: 'Watermelon', sku: 'GPNX-058', cat: 'Fruits', usd: 8.0 },
    { name: 'Red Grapes', sku: 'GPNX-059', cat: 'Fruits', usd: 7.2 },
    { name: 'Strawberries', sku: 'GPNX-060', cat: 'Fruits', usd: 9.9 },
    { name: 'Lemon', sku: 'GPNX-062', cat: 'Fruits', usd: 2.8 },
    { name: 'Ripe Avocado', sku: 'GPNX-064', cat: 'Fruits', usd: 6.9 },
    { name: 'Blueberries', sku: 'GPNX-065', cat: 'Fruits', usd: 11.0 },
    { name: 'Fresh Coconut', sku: 'GPNX-080', cat: 'Fruits', usd: 3.5 },
    { name: 'Free Range Eggs', sku: 'GPNX-114', cat: 'Groceries', usd: 8.0 },
    { name: 'Basmati Rice', sku: 'GPNX-111', cat: 'Groceries', usd: 12.5 },
    { name: 'Coconut Milk', sku: 'GPNX-148', cat: 'Groceries', usd: 5.5 },
    { name: 'Turmeric Powder', sku: 'GPNX-120', cat: 'Spices', usd: 5.5 },
    { name: 'Cumin Seeds', sku: 'GPNX-121', cat: 'Spices', usd: 3.8 },
    { name: 'Herbal Green Tea', sku: 'GPNX-094', cat: 'Beverages', usd: 9.5 },
    { name: 'Mango Lassi', sku: 'GPNX-096', cat: 'Beverages', usd: 5.5 },
    { name: 'Coconut Water', sku: 'GPNX-092', cat: 'Beverages', usd: 5.8 },
    { name: 'Cold-Pressed Juice', sku: 'GPNX-091', cat: 'Beverages', usd: 11.0 }
  ];

  var CATEGORY_IMAGE = {
    Vegetables: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/veg%201.jpeg',
    Fruits: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/fruit%201.jpeg',
    Groceries: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/groceries%201.jpeg',
    Spices: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/spices%201.jpeg',
    Beverages: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/beverages%201.jpeg',
    Herbs: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/veg%201.jpeg'
  };

  var CUSTOMERS = {
    India: ['Rahul Sharma', 'Priya Patel', 'Ravi Kumar', 'Ananya Singh', 'Vikram Reddy', 'Sneha Iyer', 'Arjun Mehta', 'Kavya Nair', 'Rohan Gupta', 'Divya Menon'],
    UAE: ['Ahmed Al-Rashid', 'Fatima Al Mansoori', 'Omar Hassan', 'Layla Khalid', 'Yusuf Rahman', 'Mariam Ali', 'Khalid Omar', 'Noor Saeed', 'Sara Haddad', 'Zayed Bin Ahmed'],
    US: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Jessica Miller', 'James Taylor', 'Ashley Moore', 'Robert Anderson', 'Megan Thomas'],
    Singapore: ['Wei Lin Tan', 'Kavita Menon', 'Marcus Lee', 'Priya Nair', 'Jun Wei Ng', 'Aisha Rahman', 'Boon Hui Lim', 'Sharon Goh', 'Derek Tan', 'Mei Ling Chan']
  };

  var PAYMENTS = {
    India: ['UPI', 'Card', 'Net Banking', 'Cash on Delivery', 'Wallets'],
    UAE: ['Card', 'Cash on Delivery', 'Apple Pay', 'Bank Transfer'],
    US: ['Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Cash on Delivery'],
    Singapore: ['PayNow', 'Card', 'Cash on Delivery', 'E-Wallets']
  };

  var ADDRESSES = {
    India: ['42, Anna Salai, Chennai', '17, MG Road, Bengaluru', '5, Linking Road, Mumbai', '88, Connaught Place, New Delhi', '12, Park Street, Kolkata'],
    UAE: ['Villa 22, Palm Jumeirah, Dubai', 'Al Reem Island, Abu Dhabi', 'Corniche Road, Sharjah', 'Downtown Boulevard, Dubai'],
    US: ['910 Pine Street, Austin, TX', '55 Harbor Blvd, Los Angeles, CA', '21 Madison Ave, New York, NY', '77 Lake Shore Drive, Chicago, IL'],
    Singapore: ['88 Orchard Road, Singapore', '21 Marina Bay, Singapore', '10 Raffles Place, Singapore', '5 Sentosa Cove, Singapore']
  };

  var STATUSES = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'packed', 'pending', 'cancelled'];

  function loadJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function loadOrders() {
    var orders = loadJSON(ORDERS_KEY);
    if (Array.isArray(orders) && orders.length) return orders;
    if (_ordersFallback) return _ordersFallback;
    _ordersFallback = generateOrders();
    saveJSON(ORDERS_KEY, _ordersFallback);
    return _ordersFallback;
  }

  function loadUsers() {
    var users = loadJSON(USERS_KEY);
    if (Array.isArray(users) && users.length) return users;
    if (_usersFallback) return _usersFallback;
    _usersFallback = [];
    var seen = {};
    loadOrders().forEach(function (o) {
      if (o && o.customer && !seen[o.customer]) {
        seen[o.customer] = true;
        _usersFallback.push({
          id: 'USR-' + (o.currencyCode || '') + '-' + _usersFallback.length,
          name: o.customer,
          email: o.email || '',
          country: userCountryName((o.country || '').toLowerCase()) || o.country,
          status: 'active',
          joined: o.date || ''
        });
      }
    });
    saveJSON(USERS_KEY, _usersFallback);
    return _usersFallback;
  }

  function daysAgoISO(days) {
    var d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  }

  function pad(n, len) {
    var s = String(n);
    while (s.length < (len || 2)) s = '0' + s;
    return s;
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function fmtMoney(n, sym, digits) {
    return sym + Number(n || 0).toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function localPrice(country, usd) {
    var f = FX[country] || 1;
    var digits = CURRENCY[country] ? CURRENCY[country].digits : 2;
    var val = usd * f;
    return digits === 0 ? Math.round(val) : round2(val);
  }

  function localSymbol(country) {
    return CURRENCY[country] ? CURRENCY[country].sym : '$';
  }

  function localDigits(country) {
    return CURRENCY[country] ? CURRENCY[country].digits : 2;
  }

  function emailFor(name) {
    return name.toLowerCase().replace(/[^a-z ]/g, '').replace(/ +/g, '.') + '@email.com';
  }

  /* ---- Seed generator ---- */
  function generateOrders() {
    var rng = mulberry32(20260817);
    var orders = [];
    COUNTRIES.forEach(function (country) {
      var cc = COUNTRY_CODE[country];
      var names = CUSTOMERS[country];
      var payments = PAYMENTS[country];
      var addresses = ADDRESSES[country];
      var count = 11 + Math.floor(rng() * 3); /* 11-13 per country */
      for (var i = 0; i < count; i++) {
        var seq = 1042 + i * 3;
        var name = names[Math.floor(rng() * names.length)];
        var itemCount = 1 + Math.floor(rng() * 4);
        var picked = [];
        var items = [];
        var subtotal = 0;
        for (var j = 0; j < itemCount; j++) {
          var p = PRODUCTS[Math.floor(rng() * PRODUCTS.length)];
          if (picked.indexOf(p.sku) !== -1) continue;
          picked.push(p.sku);
          var qty = 1 + Math.floor(rng() * 5);
          var price = localPrice(country, p.usd);
          items.push({ name: p.name, sku: p.sku, cat: p.cat, qty: qty, price: price });
          subtotal += price * qty;
        }
        if (!items.length) items.push({ name: PRODUCTS[0].name, sku: PRODUCTS[0].sku, cat: PRODUCTS[0].cat, qty: 1, price: localPrice(country, PRODUCTS[0].usd) });
        var delivery = round2(Math.max(1, subtotal * 0.03));
        var total = round2(subtotal + delivery);
        var daysBack = Math.floor(rng() * 60);
        var date = daysAgoISO(daysBack);
        var sym = localSymbol(country);
        var digits = localDigits(country);
        var status = STATUSES[Math.floor(rng() * STATUSES.length)];
        orders.push({
          id: 'ORD-' + cc + '-' + seq,
          customer: name,
          email: emailFor(name),
          phone: '+00 00000 ' + (1000 + Math.floor(rng() * 9000)),
          country: country,
          items: items,
          subtotal: round2(subtotal),
          delivery: delivery,
          total: total,
          totalText: fmtMoney(total, sym, digits),
          currency: sym,
          currencyCode: cc,
          payment: payments[Math.floor(rng() * payments.length)],
          address: addresses[Math.floor(rng() * addresses.length)],
          date: date,
          status: status,
          amountUsd: round2(subtotal / (FX[country] || 1))
        });
      }
    });
    return orders;
  }

  function ensureSeed() {
    loadOrders();
    loadUsers();
  }

  function userCountryName(key) {
    var map = { india: 'India', uae: 'UAE', us: 'US', singapore: 'Singapore' };
    return map[key] || '';
  }

  /* ---- Statistics ---- */
  function uniqueCount(list) {
    var seen = {};
    list.forEach(function (x) { if (x) seen[x] = true; });
    return Object.keys(seen).length;
  }

  function countryOrders(country) {
    return loadOrders().filter(function (o) { return o.country === country; });
  }

  function sumAmount(orders) {
    return orders.reduce(function (acc, o) { return acc + (Number(o.total) || 0); }, 0);
  }

  function aggregateTopProducts(orders) {
    var map = {};
    orders.forEach(function (o) {
      (o.items || []).forEach(function (it) {
        var key = it.sku || it.name;
        if (!map[key]) {
          map[key] = { name: it.name, sku: it.sku, cat: it.cat, qty: 0, revenue: 0 };
        }
        map[key].qty += Number(it.qty) || 0;
        map[key].revenue += (Number(it.qty) || 0) * (Number(it.price) || 0);
      });
    });
    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return b.qty - a.qty; })
      .slice(0, 5)
      .map(function (p) {
        return {
          name: p.name,
          image: CATEGORY_IMAGE[p.cat] || '',
          qty: p.qty,
          revenue: p.revenue
        };
      });
  }

  var LOW_STOCK = [
    { name: 'Fresh Basil', cat: 'Herbs', stock: 12, unit: 'bunch' },
    { name: 'Organic Tomatoes', cat: 'Vegetables', stock: 8, unit: 'kg' },
    { name: 'Free Range Eggs', cat: 'Groceries', stock: 10, unit: 'pack' },
    { name: 'Alphonso Mangoes', cat: 'Fruits', stock: 6, unit: 'kg' },
    { name: 'Cold-Pressed Juice', cat: 'Beverages', stock: 14, unit: 'bottle' }
  ];

  function statusCounts(orders) {
    var counts = { pending: 0, processing: 0, packed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(function (o) {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return counts;
  }

  function recentUsersFor(country) {
    var users = loadUsers()
      .filter(function (u) { return userCountryName(u.country) === country; })
      .slice(0, 6)
      .map(function (u) {
        return { name: u.name, email: u.email, joined: u.joined || '—', status: u.status || 'active' };
      });
    return users;
  }

  function getCountryStats(country) {
    var orders = countryOrders(country);
    var revenue = sumAmount(orders);
    var delivered = orders.filter(function (o) { return o.status === 'delivered'; }).length;
    var users = loadUsers().filter(function (u) { return userCountryName(u.country) === country; });
    var products = {};
    orders.forEach(function (o) {
      (o.items || []).forEach(function (it) { if (it.sku) products[it.sku] = true; });
    });
    var sym = localSymbol(country);
    var digits = localDigits(country);
    var recent = orders.slice().sort(function (a, b) { return b.date < a.date ? -1 : 1; }).slice(0, 5);
    var itemsSold = orders.reduce(function (acc, o) {
      return acc + (o.items || []).reduce(function (a, it) { return a + (Number(it.qty) || 0); }, 0);
    }, 0);

    return {
      totalRevenue: revenue,
      totalRevenueFormatted: fmtMoney(revenue, sym, digits),
      totalOrders: orders.length,
      totalCustomers: uniqueCount(orders.map(function (o) { return o.customer; })),
      totalProducts: Math.max(20, Object.keys(products).length),
      totalItemsSold: itemsSold,
      statusCounts: statusCounts(orders),
      deliveryRate: orders.length ? Math.round((delivered / orders.length) * 100) : 0,
      lowStockItems: LOW_STOCK.length,
      lowStockProducts: LOW_STOCK,
      pendingUsers: users.filter(function (u) { return u.status === 'pending'; }).length,
      topProducts: aggregateTopProducts(orders),
      recentOrders: recent.map(function (o) {
        return {
          id: o.id,
          customer: o.customer,
          total: fmtMoney(o.total, sym, digits),
          status: o.status
        };
      }),
      recentUsers: recentUsersFor(country)
    };
  }

  var DashboardAPI = {
    COUNTRIES: COUNTRIES,
    COUNTRY_CODE: COUNTRY_CODE,
    CURRENCY: CURRENCY,
    FX: FX,
    getOrders: function (country) {
      if (!country) return loadOrders();
      return countryOrders(country);
    },
    getUniqueCustomers: function (country) {
      var list = country ? countryOrders(country) : loadOrders();
      return uniqueCount(list.map(function (o) { return o.customer; }));
    },
    getCountryStats: function (country) {
      return getCountryStats(country);
    },
    getAllStats: function () {
      var stats = {};
      COUNTRIES.forEach(function (c) { stats[c] = getCountryStats(c); });
      return stats;
    },
    getGlobalStats: function () {
      var orders = loadOrders();
      var revenueUsd = orders.reduce(function (acc, o) { return acc + (Number(o.amountUsd) || 0); }, 0);
      var users = loadUsers();
      return {
        totalRevenue: revenueUsd,
        totalRevenueFormatted: '$' + revenueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalOrders: orders.length,
        totalCustomers: uniqueCount(orders.map(function (o) { return o.customer; })),
        totalUsers: users.length
      };
    },
    formatNumber: function (n) {
      return Number(n || 0).toLocaleString('en-US');
    },
    formatMoney: function (country, amount) {
      return fmtMoney(amount, localSymbol(country), localDigits(country));
    },
    ensureSeed: ensureSeed
  };

  window.DashboardAPI = DashboardAPI;

  window.renderDashboardStats = function () {
    try {
      if (typeof window.renderDashboard === 'function') window.renderDashboard();
      if (typeof window.renderCountryCards === 'function') window.renderCountryCards();
    } catch (e) {}
  };

  ensureSeed();
})();