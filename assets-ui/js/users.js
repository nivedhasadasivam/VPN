/* VPNexues UserManager
 * Self-contained user management for the super admin dashboard.
 * Persists to localStorage under 'vpnexues_users'.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'vpnexues_users';
  var STORAGE_VERSION = 4;

  var COUNTRY_INFO = {
    india: { name: 'India', flag: '\uD83C\uDDEE\uD83C\uDDF3', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/in-flag.svg' },
    uae: { name: 'UAE', flag: '\uD83C\uDDE6\uD83C\uDDEA', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/uae%20flag.png' },
    us: { name: 'United States', flag: '\uD83C\uDDFA\uD83C\uDDF8', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/us%20flag.png' },
    singapore: { name: 'Singapore', flag: '\uD83C\uDDF8\uD83C\uDDEC', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/sg-flag.png' }
  };

  var DEFAULT_USERS = [
    {
      id: 'USR-IN-001',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 98470 11223',
      address: '42, Anna Salai, Chennai, Tamil Nadu 600002',
      country: 'india',
      orders: 0,
      totalSpent: '\u20B90',
      lastOrders: ['12 Aug 2026'],
      status: 'active',
      verification: 'verified',
      joined: '05 Jan 2025'
    },
    {
      id: 'USR-IN-002',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@email.com',
      phone: '+91 98230 45678',
      address: '17, MG Road, Bengaluru, Karnataka 560001',
      country: 'india',
      orders: 0,
      totalSpent: '\u20B90',
      lastOrders: ['06 Aug 2026'],
      status: 'active',
      verification: 'verified',
      joined: '18 Feb 2025'
    },
    {
      id: 'USR-AE-001',
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      phone: '+971 50 987 6543',
      address: 'Villa 22, Palm Jumeirah, Dubai',
      country: 'uae',
      orders: 0,
      totalSpent: 'AED 0',
      lastOrders: ['09 Aug 2026'],
      status: 'active',
      verification: 'verified',
      joined: '12 Mar 2025'
    },
    {
      id: 'USR-AE-002',
      name: 'Fatima Al Mansoori',
      email: 'fatima.am@email.com',
      phone: '+971 55 234 8890',
      address: 'Al Reem Island, Abu Dhabi',
      country: 'uae',
      orders: 0,
      totalSpent: 'AED 0',
      lastOrders: ['30 Jul 2026'],
      status: 'pending',
      verification: 'pending',
      joined: '22 Apr 2025'
    },
    {
      id: 'USR-US-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 320-1190',
      address: '910 Pine Street, Austin, TX 78701',
      country: 'us',
      orders: 0,
      totalSpent: '$0',
      lastOrders: ['11 Aug 2026'],
      status: 'active',
      verification: 'verified',
      joined: '30 Jan 2025'
    },
    {
      id: 'USR-US-002',
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '+1 (555) 447-2288',
      address: '55 Harbor Blvd, Los Angeles, CA 90015',
      country: 'us',
      orders: 0,
      totalSpent: '$0',
      lastOrders: ['04 Aug 2026'],
      status: 'inactive',
      verification: 'verified',
      joined: '15 Jun 2025'
    },
    {
      id: 'USR-SG-001',
      name: 'Wei Lin Tan',
      email: 'weilin.tan@email.com',
      phone: '+65 9123 4567',
      address: '88 Orchard Road, #12-04, Singapore 238842',
      country: 'singapore',
      orders: 0,
      totalSpent: 'S$0',
      lastOrders: ['02 Aug 2026'],
      status: 'pending',
      verification: 'pending',
      joined: '08 Jul 2025'
    },
    {
      id: 'USR-SG-002',
      name: 'Kavita Menon',
      email: 'kavita.menon@email.com',
      phone: '+65 8123 9087',
      address: '21 Marina Bay, Singapore 018956',
      country: 'singapore',
      orders: 0,
      totalSpent: 'S$0',
      lastOrders: ['07 Aug 2026'],
      status: 'active',
      verification: 'verified',
      joined: '20 Mar 2025'
    }
  ];

  function deepClone(arr) {
    return JSON.parse(JSON.stringify(arr || []));
  }

  function countryName(key) {
    var map = { india: 'India', uae: 'UAE', us: 'US', singapore: 'Singapore' };
    return map[key] || '';
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.__v === STORAGE_VERSION && Array.isArray(parsed.data)) return parsed.data;
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    var fresh = deepClone(DEFAULT_USERS);
    save(fresh);
    return fresh;
  }

  function save(arr) {
    try {
      var wrapper = { data: JSON.parse(JSON.stringify(arr)), __v: STORAGE_VERSION };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
    } catch (e) {}
  }

  var UserManager = {
    allUsers: load(),
    state: {
      users: deepClone(load()),
      search: '',
      statusFilter: 'all',
      sortBy: 'name',
      sortDir: 'asc',
      page: 1,
      perPage: 10,
      editingId: null
    },

    getCountryLabel: function (key) {
      var info = COUNTRY_INFO[key];
      return info ? info.flag + ' ' + info.name : key;
    },

    _flagHtml: function (key) {
      var info = COUNTRY_INFO[key];
      if (!info) return key;
      if (info.flagImg) {
        return '<img src="' + info.flagImg + '" title="' + info.name + '" style="width:34px;height:24px;object-fit:cover;border-radius:4px;border:1px solid var(--border)" alt="' + info.name + ' flag"> <span style="font-weight:600;color:var(--text)">' + info.name + '</span>';
      }
      return '<span style="font-size:20px;line-height:1" title="' + info.name + '">' + info.flag + '</span> <span style="font-weight:600;color:var(--text)">' + info.name + '</span>';
    },

    _flagImg: function (key) {
      var info = COUNTRY_INFO[key];
      return info && info.flagImg ? info.flagImg : '';
    },

    _lastOrdersHtml: function (u) {
      if (!u.lastOrders || !u.lastOrders.length) return '<span style="color:var(--text-secondary)">—</span>';
      var items = u.lastOrders.slice(0, 2).map(function (o) {
        return '<span style="display:inline-block;padding:3px 9px;border-radius:6px;background:rgba(22,163,74,.1);color:var(--accent);font-size:11px;font-weight:600;margin:1px 2px 1px 0">' + o + '</span>';
      }).join('');
      return items;
    },

    getFiltered: function () {
      var self = this;
      var list = self.state.users.slice();

      if (self.state.country) {
        list = list.filter(function (u) {
          return countryName(u.country) === self.state.country;
        });
      }

      if (self.state.statusFilter !== 'all') {
        list = list.filter(function (u) {
          return u.status === self.state.statusFilter;
        });
      }

      if (self.state.search) {
        var q = self.state.search.toLowerCase();
        list = list.filter(function (u) {
          return (u.name + ' ' + u.email + ' ' + u.phone + ' ' + (u.address || '') + ' ' + (COUNTRY_INFO[u.country] ? COUNTRY_INFO[u.country].name : '')).toLowerCase().indexOf(q) !== -1;
        });
      }

      var key = self.state.sortBy;
      var dir = self.state.sortDir === 'asc' ? 1 : -1;
      var countryOrder = { india: 0, singapore: 1, us: 2, uae: 3 };
      list.sort(function (a, b) {
        var ca = countryOrder[a.country] != null ? countryOrder[a.country] : 99;
        var cb = countryOrder[b.country] != null ? countryOrder[b.country] : 99;
        if (ca !== cb) return ca - cb;
        var av = a[key], bv = b[key];
        if (typeof av === 'string') { av = av.toLowerCase(); bv = String(bv).toLowerCase(); }
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });

      return list;
    },

    getPaged: function () {
      var filtered = this.getFiltered();
      var per = this.state.perPage;
      var start = (this.state.page - 1) * per;
      return {
        rows: filtered.slice(start, start + per),
        total: filtered.length,
        pages: Math.max(1, Math.ceil(filtered.length / per))
      };
    },

    renderUsersTable: function (opts) {
      opts = opts || {};
      this.state.country = opts.country || null;
      var tbody = document.getElementById(opts.tbodyId || 'usersTableBody');
      var paginationEl = document.getElementById(opts.paginationId || 'usersPagination');
      var summaryEl = document.getElementById(opts.summaryId || 'usersSummary');

      var result = this.getPaged();
      var totalPages = result.pages;
      if (this.state.page > totalPages) {
        this.state.page = totalPages;
        result = this.getPaged();
      }

      this.updateFilterTabCounts();

      if (summaryEl) {
        if (this.state.country) {
          var start = (this.state.page - 1) * this.state.perPage;
          var end = Math.min(start + result.rows.length, result.total);
          summaryEl.textContent = result.total ? ('Showing ' + (start + 1) + '-' + end + ' of ' + result.total + ' users') : 'No users found';
        } else {
          summaryEl.textContent = result.total + ' users';
        }
      }

      if (!tbody) return;

      if (!result.rows.length) {
        tbody.innerHTML = '<tr><td colspan="' + (opts.colCount || 8) + '" style="text-align:center;padding:40px;color:var(--text-secondary)">No users found</td></tr>';
      } else {
        var html = '';
        var self = this;
        result.rows.forEach(function (u) {
          html += self._rowHtml(u, !!opts.country);
        });
        tbody.innerHTML = html;
      }

      if (paginationEl) {
        paginationEl.innerHTML = this._paginationHtml(totalPages);
      }

      setTimeout(function() {
        if (window._userRowObs) window._userRowObs.disconnect();
        var rows = tbody.querySelectorAll('tr');
        rows.forEach(function(row, i) { row.classList.remove('visible'); row.style.animationDelay = (i * 0.06) + 's'; });
        window._userRowObs = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); window._userRowObs.unobserve(e.target); } });
        }, { threshold: 0.01, rootMargin: '200px' });
        rows.forEach(function(row) { window._userRowObs.observe(row); });
      }, 20);
    },

    _rowHtml: function (u, compact) {
      if (compact) {
        return '' +
          '<tr>' +
          '<td><div style="display:flex;align-items:center;gap:10px"><div style="width:34px;height:34px;border-radius:50%;background:rgba(22,163,74,.12);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">' + (u.name ? u.name.charAt(0).toUpperCase() : '?') + '</div><div><a href="#" onclick="event.preventDefault();event.stopPropagation();UserManager.openUserDetail(\'' + u.id + '\')" style="font-weight:600;color:var(--accent);text-decoration:none;cursor:pointer">' + u.name + '</a><div style="font-size:11px;color:var(--text-secondary)">' + u.email + '</div></div></div></td>' +
          '<td>' + u.phone + '</td>' +
          '<td style="max-width:200px"><span style="font-size:12px;color:var(--text);display:block;white-space:normal;line-height:1.4">' + u.address + '</span></td>' +
          '<td>' + this._flagHtml(u.country) + '</td>' +
          '<td><span class="role-badge active" style="background:rgba(22,163,74,.1)">' + u.orders + '</span></td>' +
          '<td><span style="font-weight:600;color:var(--text)">' + u.totalSpent + '</span></td>' +
          '<td><div style="display:flex;gap:6px;align-items:center">' +
            '<button class="action-btn view" title="View" onclick="event.stopPropagation();UserManager.openUserDetail(\'' + u.id + '\')"><i class="fas fa-eye"></i></button>' +
            '<button class="action-btn" title="Edit" onclick="UserManager.editUser(\'' + u.id + '\')"><i class="fas fa-edit"></i></button>' +
            '<button class="action-btn delete" title="Delete" onclick="UserManager.deleteUser(\'' + u.id + '\')"><i class="fas fa-trash-alt"></i></button>' +
          '</div></td>' +
          '</tr>';
      }
      return '' +
        '<tr>' +
        '<td><div style="display:flex;align-items:center;gap:10px"><div style="width:34px;height:34px;border-radius:50%;background:rgba(30,64,175,.12);color:#1e40af;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">' + (u.name ? u.name.charAt(0).toUpperCase() : '?') + '</div><div><a href="#" onclick="event.preventDefault();event.stopPropagation();UserManager.openUserDetail(\'' + u.id + '\')" style="font-weight:600;color:#1e40af;text-decoration:none;cursor:pointer">' + u.name + '</a><div style="font-size:11px;color:var(--text-secondary)">' + u.email + '</div></div></div></td>' +
        '<td>' + u.phone + '</td>' +
        '<td style="max-width:220px"><span style="font-size:12px;color:var(--text);display:block;white-space:normal;line-height:1.4">' + u.address + '</span></td>' +
        '<td>' + this._flagHtml(u.country) + '</td>' +
        '<td><span class="role-badge active" style="background:rgba(22,163,74,.1)">' + u.orders + '</span></td>' +
        '<td><span style="font-weight:600;color:var(--text)">' + u.totalSpent + '</span></td>' +
        '<td>' + this._lastOrdersHtml(u) + '</td>' +
        '<td><div style="display:flex;gap:6px;align-items:center">' +
          '<button class="action-btn view" title="View" onclick="event.stopPropagation();UserManager.openUserDetail(\'' + u.id + '\')"><i class="fas fa-eye"></i></button>' +
        '</div></td>' +
        '</tr>';
    },

    toggleMenu: function (id) {
      document.querySelectorAll('.user-menu').forEach(function (m) {
        if (m.id !== 'userMenu-' + id) m.style.display = 'none';
      });
      var menu = document.getElementById('userMenu-' + id);
      if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    },

    closeAllMenus: function () {
      document.querySelectorAll('.user-menu').forEach(function (m) {
        m.style.display = 'none';
      });
    },

    _paginationHtml: function (totalPages) {
      var page = this.state.page;
      var html = '';
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="UserManager.goToPage(' + (page - 1) + ')"' + (page <= 1 ? ' disabled' : '') + '>Prev</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button class="btn ' + (i === page ? 'btn-primary' : 'btn-secondary') + '" style="padding:6px 12px;font-size:12px" onclick="UserManager.goToPage(' + i + ')">' + i + '</button>';
      }
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="UserManager.goToPage(' + (page + 1) + ')"' + (page >= totalPages ? ' disabled' : '') + '>Next</button>';
      return html;
    },

    updateFilterTabCounts: function () {
      var self = this;
      var tabs = document.querySelectorAll('.user-filter-tab');
      var scope = this.state.users;
      if (this.state.country) {
        scope = this.state.users.filter(function (u) { return countryName(u.country) === self.state.country; });
      }
      var all = scope.length;
      var active = scope.filter(function (u) { return u.status === 'active'; }).length;
      var pending = scope.filter(function (u) { return u.status === 'pending'; }).length;
      var inactive = scope.filter(function (u) { return u.status === 'inactive'; }).length;
      tabs.forEach(function (tab) {
        var status = tab.getAttribute('data-status');
        var count = status === 'all' ? all : status === 'active' ? active : status === 'pending' ? pending : inactive;
        var span = tab.querySelector('.tab-count');
        if (span) {
          span.textContent = count;
          if (tab.classList.contains('active')) {
            span.style.background = 'rgba(255,255,255,.25)';
            span.style.color = '#fff';
          } else {
            span.style.background = 'rgba(0,0,0,.08)';
            span.style.color = 'var(--text-secondary)';
          }
        }
      });
    },

    goToPage: function (p) {
      var totalPages = Math.max(1, Math.ceil(this.getFiltered().length / this.state.perPage));
      if (p < 1) p = 1;
      if (p > totalPages) p = totalPages;
      this.state.page = p;
      this.renderCurrent();
    },

    setStatusFilter: function (status) {
      this.state.statusFilter = status;
      this.state.page = 1;
      document.querySelectorAll('.user-filter-tab').forEach(function (tab) {
        var isActive = tab.getAttribute('data-status') === status;
        tab.classList.toggle('active', isActive);
        if (isActive) {
          tab.style.background = '#2E7D32';
          tab.style.color = '#fff';
          tab.style.borderColor = '#2E7D32';
        } else {
          tab.style.background = 'var(--card)';
          tab.style.color = '';
          tab.style.borderColor = 'var(--border)';
        }
        var span = tab.querySelector('.tab-count');
        if (span) {
          if (isActive) {
            span.style.background = 'rgba(255,255,255,.25)';
            span.style.color = '#fff';
          } else {
            span.style.background = 'rgba(0,0,0,.08)';
            span.style.color = 'var(--text-secondary)';
          }
        }
      });
      this.renderCurrent();
    },

    setSearch: function (q) {
      this.state.search = (q || '').trim();
      this.state.page = 1;
      this.renderCurrent();
    },

    resetFilters: function () {
      this.state.search = '';
      this.state.statusFilter = 'all';
      this.state.sortBy = 'name';
      this.state.sortDir = 'asc';
      this.state.page = 1;
      var input = document.getElementById('userSearchInput');
      if (input) input.value = '';
      document.querySelectorAll('.user-filter-tab').forEach(function (tab) {
        var isAll = tab.getAttribute('data-status') === 'all';
        tab.classList.toggle('active', isAll);
        if (isAll) {
          tab.style.background = '#2E7D32';
          tab.style.color = '#fff';
          tab.style.borderColor = '#2E7D32';
        } else {
          tab.style.background = 'var(--card)';
          tab.style.color = '';
          tab.style.borderColor = 'var(--border)';
        }
        var span = tab.querySelector('.tab-count');
        if (span) {
          if (isAll) {
            span.style.background = 'rgba(255,255,255,.25)';
            span.style.color = '#fff';
          } else {
            span.style.background = 'rgba(0,0,0,.08)';
            span.style.color = 'var(--text-secondary)';
          }
        }
      });
      this.renderCurrent();
    },

    setSortBy: function (key) {
      if (this.state.sortBy === key) {
        this.state.sortDir = this.state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.state.sortBy = key;
        this.state.sortDir = 'asc';
      }
      this.renderCurrent();
    },

    renderCurrent: function () {
      if (typeof window.renderCurrentUsers === 'function') {
        window.renderCurrentUsers();
      }
    },

    getUser: function (id) {
      return this.state.users.find(function (u) { return u.id === id; });
    },

    persist: function () {
      this.allUsers = deepClone(this.state.users);
      save(this.state.users);
    },

    deleteUser: function (id) {
      var u = this.getUser(id);
      if (!u) return;
      if (!confirm('Delete user ' + u.name + '?')) return;
      if (typeof DeleteHistory !== 'undefined') DeleteHistory.log(u.name, 'User', u.name, Object.assign({}, u));
      this.state.users = this.state.users.filter(function (x) { return x.id !== id; });
      this.persist();
      this.renderCurrent();
    },

    /* ---- Detail ---- */
    _countryCurrency: function (country) {
      var map = { india: '\u20B9', uae: 'AED ', us: '$', singapore: 'S$' };
      return map[country] || '';
    },

    _mockOrders: function (u) {
      return [
        { id: '#ORD-1042', date: '12 Aug 2026', amount: this._countryCurrency(u.country) + '2,140', status: 'Delivered' },
        { id: '#ORD-1031', date: '28 Jul 2026', amount: this._countryCurrency(u.country) + '980', status: 'Delivered' },
        { id: '#ORD-1026', date: '21 Jul 2026', amount: this._countryCurrency(u.country) + '1,560', status: 'Shipped' },
        { id: '#ORD-1018', date: '02 Jul 2026', amount: this._countryCurrency(u.country) + '720', status: 'Processing' }
      ];
    },

    _mockProducts: function () {
      return ['Fresh Vegetables', 'Organic Fruits', 'Groceries Pack', 'Spices Combo', 'Beverages'];
    },

    _mockNotes: function (u) {
      return [
        { text: 'Customer prefers morning delivery slots.', date: '10 Aug 2026' },
        { text: 'Requested packaging notes for large orders.', date: '24 Jul 2026' },
        { text: 'Good repeat customer, priority support.', date: '15 Jun 2026' }
      ];
    },

    _mockActivity: function (u) {
      return [
        { text: 'Account verified', time: '12 Aug 2026, 10:24 AM' },
        { text: 'Order placed #ORD-1042', time: '12 Aug 2026, 09:55 AM' },
        { text: 'Logged in', time: '12 Aug 2026, 09:30 AM' },
        { text: 'Updated profile', time: '05 Aug 2026, 02:10 PM' }
      ];
    },

    _statusPill: function (status) {
      var color = status === 'Delivered' ? '#22C55E' : status === 'Shipped' ? '#3B82F6' : '#CA8A04';
      return '<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;color:' + color + ';background:' + color + '1A">' + status + '</span>';
    },

    openUserDetail: function (id) {
      var u = this.getUser(id);
      if (!u) return;
      var content = document.getElementById('userDetailContent');
      var modal = document.getElementById('userDetailModal');
      if (!content || !modal) return;
      var statusText = u.status.charAt(0).toUpperCase() + u.status.slice(1);
      var statusColor = u.status === 'active' ? '#22C55E' : u.status === 'pending' ? '#CA8A04' : '#EF4444';

      var orders = this._mockOrders(u);
      var products = this._mockProducts();
      var notes = this._mockNotes(u);
      var activity = this._mockActivity(u);

      var ordersHtml = orders.map(function (o) {
        return '<tr>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#111;font-size:13px;white-space:nowrap">' + o.id + '</td>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;white-space:nowrap">' + o.date + '</td>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#111;font-size:13px;white-space:nowrap">' + o.amount + '</td>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #f1f5f9">' + this._statusPill(o.status) + '</td>' +
        '</tr>';
      }, this).join('');

      var productsHtml = products.map(function (p) {
        return '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;margin-bottom:8px">' +
          '<div style="width:34px;height:34px;border-radius:8px;background:rgba(22,163,74,.12);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:13px"><i class="fas fa-box"></i></div>' +
          '<div><div style="font-weight:600;color:#111;font-size:13px">' + p + '</div></div></div>';
      }).join('');

      var notesHtml = notes.map(function (n) {
        return '<div style="display:flex;gap:10px;padding:11px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;margin-bottom:8px">' +
          '<div style="color:#d97706;font-size:13px;margin-top:2px"><i class="fas fa-sticky-note"></i></div>' +
          '<div><div style="font-size:13px;color:#111">' + n.text + '</div><div style="font-size:11px;color:#64748b;margin-top:3px">' + n.date + '</div></div></div>';
      }).join('');

      var activityHtml = activity.map(function (a) {
        return '<div style="display:flex;gap:10px;padding:10px 0">' +
          '<div style="width:8px;height:8px;border-radius:50%;background:var(--accent);margin-top:5px;flex-shrink:0"></div>' +
          '<div style="flex:1"><div style="font-size:13px;color:#111">' + a.text + '</div><div style="font-size:11px;color:#64748b;margin-top:2px">' + a.time + '</div></div></div>';
      }).join('');

      var addressesHtml = this._detailRow('Home Address', u.address);

      content.innerHTML =
        /* ---- USER DETAILS (top) ---- */
        '<div style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:20px">' +
          '<div style="background:#134B2F;padding:20px 22px;color:#fff;display:flex;gap:16px;align-items:center;flex-wrap:wrap">' +
            '<div style="width:62px;height:62px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">' +
            '<img src="' + this._flagImg(u.country) + '" alt="' + (COUNTRY_INFO[u.country] ? COUNTRY_INFO[u.country].name : '') + ' flag" style="width:30px;height:20px;object-fit:cover;border-radius:4px;border:1px solid rgba(255,255,255,.5);flex-shrink:0">' +
          '</div>' +
            '<div style="flex:1;min-width:180px">' +
              '<h3 style="margin:0;font-size:20px;font-weight:700;color:#fff">' + u.name + '</h3>' +
              '<div style="font-size:13px;color:rgba(255,255,255,.85);margin-top:3px">' + u.email + ' \u00B7 ' + u.phone + '</div>' +
              '<span style="display:inline-block;margin-top:8px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;color:#fff;background:' + statusColor + ';">' + statusText + '</span>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;min-width:280px">' +
              '<div style="background:rgba(255,255,255,.15);border-radius:10px;padding:12px 14px;text-align:center"><div style="font-size:10px;color:rgba(255,255,255,.8);text-transform:uppercase;letter-spacing:.5px">Orders</div><div style="font-size:20px;font-weight:800;color:#fff;margin-top:3px">' + u.orders + '</div></div>' +
              '<div style="background:rgba(255,255,255,.15);border-radius:10px;padding:12px 14px;text-align:center"><div style="font-size:10px;color:rgba(255,255,255,.8);text-transform:uppercase;letter-spacing:.5px">Total Spent</div><div style="font-size:16px;font-weight:800;color:#fff;margin-top:3px">' + u.totalSpent + '</div></div>' +
              '<div style="background:rgba(255,255,255,.15);border-radius:10px;padding:12px 14px;text-align:center"><div style="font-size:10px;color:rgba(255,255,255,.8);text-transform:uppercase;letter-spacing:.5px">Verification</div><div style="font-size:14px;font-weight:800;color:#fff;margin-top:3px">' + u.verification.charAt(0).toUpperCase() + u.verification.slice(1) + '</div></div>' +
            '</div>' +
          '</div>' +
          '<div style="padding:20px 22px">' +
            '<h4 style="margin:0 0 14px;font-size:16px;font-weight:700;color:#111">User Information</h4>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px" class="user-detail-grid">' +
              this._detailRow('Full Name', u.name) +
              this._detailRow('Email', u.email) +
              this._detailRow('Phone', u.phone) +
              this._detailRow('Country', this.getCountryLabel(u.country)) +
              this._detailRow('Joined', u.joined || '—') +
              this._detailRow('Status', statusText) +
            '</div>' +
          '</div>' +
        '</div>' +

        /* ---- TAB BAR ---- */
        '<div class="user-tabs" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
          '<button class="user-tab active" data-tab="overview" onclick="UserManager.switchUserTab(\'overview\')" style="padding:8px 16px;border-radius:20px;border:1px solid var(--border);background:var(--accent);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit"><i class="fas fa-chart-pie" style="margin-right:6px"></i>Overview</button>' +
          '<button class="user-tab" data-tab="orders" onclick="UserManager.switchUserTab(\'orders\')" style="padding:8px 16px;border-radius:20px;border:1px solid var(--border);background:var(--bg);color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit"><i class="fas fa-box-open" style="margin-right:6px"></i>Order History</button>' +
          '<button class="user-tab" data-tab="products" onclick="UserManager.switchUserTab(\'products\')" style="padding:8px 16px;border-radius:20px;border:1px solid var(--border);background:var(--bg);color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit"><i class="fas fa-box" style="margin-right:6px"></i>Products Purchased</button>' +
          '<button class="user-tab" data-tab="notes" onclick="UserManager.switchUserTab(\'notes\')" style="padding:8px 16px;border-radius:20px;border:1px solid var(--border);background:var(--bg);color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit"><i class="fas fa-sticky-note" style="margin-right:6px"></i>Notes &amp; Activity</button>' +
          '<button class="user-tab" data-tab="addresses" onclick="UserManager.switchUserTab(\'addresses\')" style="padding:8px 16px;border-radius:20px;border:1px solid var(--border);background:var(--bg);color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit"><i class="fas fa-map-marker-alt" style="margin-right:6px"></i>Addresses</button>' +
        '</div>' +

        /* ---- TAB PANELS ---- */
        '<div id="userTab-overview" class="user-tab-panel">' +
          '<div class="user-subtabs" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
            '<button class="user-subtab active" data-subtab="info" onclick="UserManager.switchUserSubTab(\'info\')" style="padding:8px 16px;border-radius:20px;border:1px solid var(--border);background:var(--accent);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit"><i class="fas fa-user" style="margin-right:6px"></i>User Information</button>' +
            '<button class="user-subtab" data-subtab="recent-orders" onclick="UserManager.switchUserSubTab(\'recent-orders\')" style="padding:8px 16px;border-radius:20px;border:1px solid var(--border);background:var(--bg);color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit"><i class="fas fa-shopping-bag" style="margin-right:6px"></i>Recent Orders</button>' +
            '<button class="user-subtab" data-subtab="payment" onclick="UserManager.switchUserSubTab(\'payment\')" style="padding:8px 16px;border-radius:20px;border:1px solid var(--border);background:var(--bg);color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit"><i class="fas fa-credit-card" style="margin-right:6px"></i>Payment Summary</button>' +
          '</div>' +
          '<div id="userSub-info" class="user-subtab-panel">' +
            '<h4 style="margin:0 0 4px;font-size:16px;font-weight:700;color:#111"><i class="fas fa-user" style="margin-right:6px;color:var(--accent)"></i>User Information</h4>' +
            '<div style="display:grid;grid-template-columns:1fr;row-gap:2px" class="user-detail-grid">' +
              this._infoCell('Full Name', u.name) +
              this._infoCell('Email', u.email) +
              this._infoCell('Phone', u.phone) +
              this._infoCell('Country', this.getCountryLabel(u.country)) +
              this._infoCell('Joined', u.joined || '—') +
              this._infoCell('Status', statusText) +
            '</div>' +
          '</div>' +
          '<div id="userSub-recent-orders" class="user-subtab-panel" style="display:none">' +
            '<h4 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#111"><i class="fas fa-shopping-bag" style="margin-right:6px;color:#3B82F6"></i>Recent Orders</h4>' +
'<div class="user-table-wrap" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">' +
              '<table style="width:100%;border-collapse:collapse">' +
                '<thead><tr style="background:#f8fafc">' +
                  '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Order</th>' +
                  '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Date</th>' +
                  '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Amount</th>' +
                  '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Status</th>' +
                '</tr></thead>' +
                '<tbody>' + ordersHtml + '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
          '<div id="userSub-payment" class="user-subtab-panel" style="display:none">' +
            '<h4 style="margin:0 0 4px;font-size:16px;font-weight:700;color:#111"><i class="fas fa-credit-card" style="margin-right:6px;color:#8B5CF6"></i>Payment Summary</h4>' +
            '<div style="display:grid;grid-template-columns:1fr;row-gap:2px" class="user-detail-grid">' +
              this._infoCell('Total Spent', u.totalSpent) +
              this._infoCell('Total Orders', u.orders) +
              this._infoCell('Avg. Order Value', this._countryCurrency(u.country) + '0') +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div id="userTab-orders" class="user-tab-panel" style="display:none">' +
          '<h4 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#111"><i class="fas fa-shopping-bag" style="margin-right:8px;color:#3B82F6"></i>Order History</h4>' +
          '<div class="user-table-wrap" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">' +
            '<table style="width:100%;border-collapse:collapse">' +
              '<thead><tr style="background:#f8fafc">' +
                '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Order</th>' +
                '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Date</th>' +
                '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Amount</th>' +
                '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Status</th>' +
              '</tr></thead>' +
              '<tbody>' + ordersHtml + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

        '<div id="userTab-products" class="user-tab-panel" style="display:none">' +
          '<h4 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#111"><i class="fas fa-box" style="margin-right:8px;color:#8B5CF6"></i>Products Purchased</h4>' + productsHtml +
        '</div>' +

        '<div id="userTab-addresses" class="user-tab-panel" style="display:none">' +
          '<h4 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#111"><i class="fas fa-map-marker-alt" style="margin-right:8px;color:#EF4444"></i>Addresses</h4>' +
          '<div style="border:1px solid #e2e8f0;border-radius:10px;background:#fff;padding:12px 14px">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><i class="fas fa-home" style="color:var(--accent);font-size:13px"></i><span style="font-size:12px;font-weight:600;color:#111">Home</span><span style="margin-left:auto;font-size:11px;color:#64748b">Default</span></div>' +
            '<div style="font-size:13px;color:#334155;line-height:1.5">' + u.address + '</div>' +
          '</div>' +
        '</div>' +

        '<div id="userTab-notes" class="user-tab-panel" style="display:none">' +
          '<h4 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#111"><i class="fas fa-sticky-note" style="margin-right:8px;color:#d97706"></i>Notes</h4>' + notesHtml +
          '<h4 style="margin:22px 0 12px;font-size:16px;font-weight:700;color:#111"><i class="fas fa-activity" style="margin-right:8px;color:#3B82F6"></i>Activity</h4>' +
          '<div style="border:1px solid #e2e8f0;border-radius:10px;background:#fff;padding:14px 16px">' + activityHtml + '</div>' +
        '</div>';

      modal.style.display = 'flex';
    },

    switchUserTab: function (tab) {
      var isMobile = window.innerWidth < 768;
      var active = document.getElementById('userTab-' + tab);
      var wasOpen = active && active.style.getPropertyValue('display') !== 'none';

      if (isMobile && wasOpen) {
        if (active) active.style.setProperty('display', 'none', 'important');
        document.querySelectorAll('#userDetailContent .user-tab').forEach(function (btn) {
          btn.classList.remove('active');
          btn.style.background = 'var(--bg)';
          btn.style.color = 'var(--text-secondary)';
          btn.style.borderColor = 'var(--border)';
        });
        return;
      }

      var panels = document.querySelectorAll('#userDetailContent .user-tab-panel');
      panels.forEach(function (p) { p.style.setProperty('display', 'none', 'important'); });
      if (active) active.style.setProperty('display', 'block', 'important');
      document.querySelectorAll('#userDetailContent .user-tab').forEach(function (btn) {
        var isActive = btn.getAttribute('data-tab') === tab;
        btn.classList.toggle('active', isActive);
        btn.style.background = isActive ? 'var(--accent)' : 'var(--bg)';
        btn.style.color = isActive ? '#fff' : 'var(--text-secondary)';
        btn.style.borderColor = isActive ? 'var(--accent)' : 'var(--border)';
      });
    },

    switchUserSubTab: function (subtab) {
      document.querySelectorAll('#userDetailContent .user-subtab-panel').forEach(function (p) { p.style.setProperty('display', 'none', 'important'); });
      var active = document.getElementById('userSub-' + subtab);
      if (active) active.style.setProperty('display', 'block', 'important');
      document.querySelectorAll('#userDetailContent .user-subtab').forEach(function (btn) {
        var isActive = btn.getAttribute('data-subtab') === subtab;
        btn.classList.toggle('active', isActive);
        btn.style.background = isActive ? 'var(--accent)' : 'var(--bg)';
        btn.style.color = isActive ? '#fff' : 'var(--text-secondary)';
        btn.style.borderColor = isActive ? 'var(--accent)' : 'var(--border)';
      });
    },

    _detailRow: function (label, value) {
      return '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:11px 13px">' +
        '<div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + label + '</div>' +
        '<div style="font-size:13px;font-weight:600;color:#111">' + value + '</div></div>';
    },

    _lineRow: function (label, value) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 0">' +
        '<div style="font-size:13px;color:#64748b;flex-shrink:0">' + label + '</div>' +
        '<div style="font-size:13px;font-weight:600;color:#111;text-align:right">' + value + '</div></div>';
    },

    _infoCell: function (label, value) {
      return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0">' +
        '<div style="font-size:13px;color:#64748b;white-space:nowrap;flex-shrink:0">' + label + '</div>' +
        '<div style="font-size:13px;font-weight:600;color:#111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + value + '</div></div>';
    },

    closeUserDetail: function () {
      var modal = document.getElementById('userDetailModal');
      if (modal) modal.style.display = 'none';
    },

    /* ---- Edit ---- */
    editUser: function (id) {
      var u = this.getUser(id);
      if (!u) return;
      var modal = document.getElementById('userEditModal');
      if (!modal) return;
      this.state.editingId = id;
      document.getElementById('editUserId').value = u.id;
      document.getElementById('editUserName').value = u.name;
      document.getElementById('editUserEmail').value = u.email;
      document.getElementById('editUserPhone').value = u.phone || '';
      document.getElementById('editUserCountry').value = u.country || 'india';
      document.getElementById('editUserAddress').value = u.address || '';
      document.getElementById('editUserStatus').value = u.status || 'active';
      document.getElementById('editUserVerification').value = u.verification || 'verified';
      modal.style.display = 'flex';
    },

    closeUserEdit: function () {
      var modal = document.getElementById('userEditModal');
      if (modal) modal.style.display = 'none';
    },

    confirmUserEdit: function () {
      var id = document.getElementById('editUserId').value;
      var u = this.getUser(id);
      if (!u) return;
      u.name = document.getElementById('editUserName').value || u.name;
      u.email = document.getElementById('editUserEmail').value || u.email;
      u.phone = document.getElementById('editUserPhone').value || u.phone;
      u.country = document.getElementById('editUserCountry').value || u.country;
      u.address = document.getElementById('editUserAddress').value || u.address;
      u.status = document.getElementById('editUserStatus').value || u.status;
      u.verification = document.getElementById('editUserVerification').value || u.verification;
      this.persist();
      this.closeUserEdit();
      this.renderCurrent();
    },

    /* ---- Add ---- */
    addUser: function () {
      var modal = document.getElementById('userAddModal');
      if (!modal) return;
      modal.style.display = 'flex';
    },

    openUserAdd: function () {
      var modal = document.getElementById('userAddModal');
      if (modal) modal.style.display = 'flex';
    },

    closeUserAdd: function () {
      var modal = document.getElementById('userAddModal');
      if (modal) modal.style.display = 'none';
    },

    confirmUserAdd: function () {
      var name = (document.getElementById('addUserName').value || '').trim();
      var email = (document.getElementById('addUserEmail').value || '').trim();
      if (!name || !email) {
        alert('Full Name and Email are required.');
        return;
      }
      var country = document.getElementById('addUserCountry').value || 'india';
      var user = {
        id: 'USR-' + country.toUpperCase() + '-' + String(Date.now()).slice(-4),
        name: name,
        email: email,
        phone: document.getElementById('addUserPhone').value || '—',
        address: document.getElementById('addUserAddress').value || '—',
        country: country,
        orders: 0,
        totalSpent: ({ india: '\u20B9', uae: 'AED ', us: '$', singapore: 'S$' }[country] || '\u20B9') + '0',
        lastOrders: [],
        status: 'active',
        verification: 'pending',
        joined: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      this.state.users.push(user);
      this.persist();
      this.closeUserAdd();
      this.renderCurrent();
    },

    /* ---- Export ---- */
    exportCSV: function (opts) {
      opts = opts || {};
      var users = this.state.users;
      if (opts.country) {
        users = users.filter(function (u) { return countryName(u.country) === opts.country; });
      }
      var rows = users.map(function (u) {
        return [u.name, u.email, u.phone, (u.address || '').replace(/,/g, ' '), COUNTRY_INFO[u.country] ? COUNTRY_INFO[u.country].name : u.country, u.orders, u.totalSpent, (u.lastOrders || []).join(' | '), u.status].join(',');
      });
      var csv = 'User,Email,Phone,Address,Country,Orders,Total Spent,Last Orders,Status\n' + rows.join('\n');
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var aEl = document.createElement('a');
      aEl.href = url;
      aEl.download = opts.country ? ('users-' + opts.country.toLowerCase() + '.csv') : 'users.csv';
      document.body.appendChild(aEl);
      aEl.click();
      document.body.removeChild(aEl);
      URL.revokeObjectURL(url);
    },

    /* ---- Print ---- */
    printUsers: function (opts) {
      opts = opts || {};
      var users = this.state.users;
      if (opts.country) {
        users = users.filter(function (u) { return countryName(u.country) === opts.country; });
      }
      var html = '<html><head><title>' + (opts.title || 'Users') + '</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left}th{background:#f8fafc}</style></head><body>';
      html += '<h2>' + (opts.title || 'Users Report') + '</h2><table><thead><tr><th>User</th><th>Phone</th><th>Address</th><th>Country</th><th>Orders</th><th>Total Spent</th><th>Last Orders</th></tr></thead><tbody>';
      users.forEach(function (u) {
        html += '<tr><td>' + u.name + ' (' + u.email + ')</td><td>' + u.phone + '</td><td>' + u.address + '</td><td>' + (COUNTRY_INFO[u.country] ? COUNTRY_INFO[u.country].name : u.country) + '</td><td>' + u.orders + '</td><td>' + u.totalSpent + '</td><td>' + (u.lastOrders || []).join(', ') + '</td></tr>';
      });
      html += '</tbody></table></body></html>';
      var win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        win.print();
      }
    }
  };

  window.UserManager = UserManager;

  document.addEventListener('click', function () {
    if (typeof UserManager.closeAllMenus === 'function') UserManager.closeAllMenus();
  });
})();
