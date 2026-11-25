/* VPNexues ActivityLogManager
 * Self-contained activity log management for the super admin dashboard.
 * Persists to localStorage under 'vpnexues_logs'.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var STORAGE_KEY = 'vpnexues_logs';
  var STORAGE_VERSION = 1;

  var COUNTRY_INFO = {
    india: { name: 'India', flag: '\uD83C\uDDEE\uD83C\uDDF3', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/in-flag.svg' },
    uae: { name: 'UAE', flag: '\uD83C\uDDE6\uD83C\uDDEA', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/uae%20flag.png' },
    us: { name: 'United States', flag: '\uD83C\uDDFA\uD83C\uDDF8', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/us%20flag.png' },
    singapore: { name: 'Singapore', flag: '\uD83C\uDDF8\uD83C\uDDEC', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/sg-flag.png' }
  };

  var DEFAULT_LOGS = [
    { id: 'LOG-001', timestamp: '14 Aug 2026, 09:42', user: 'Priya Sharma', role: 'Sub Admin', category: 'login', details: 'Logged in successfully from admin panel', country: 'india', ipAddress: '103.21.158.221', status: 'success', action: 'Login' },
    { id: 'LOG-002', timestamp: '14 Aug 2026, 09:15', user: 'Ravi Kumar', role: 'Sub Admin', category: 'product', details: 'Updated price of Organic Tomatoes', country: 'india', ipAddress: '106.51.34.190', status: 'success', action: 'Update Price' },
    { id: 'LOG-003', timestamp: '14 Aug 2026, 08:58', user: 'Michael Brown', role: 'Manager', category: 'login', details: 'Failed login attempt - invalid password', country: 'us', ipAddress: '74.125.240.101', status: 'failed', action: 'Login Failed' },
    { id: 'LOG-004', timestamp: '14 Aug 2026, 08:31', user: 'Wei Lin Tan', role: 'Viewer', category: 'country', details: 'Viewed Singapore country dashboard', country: 'singapore', ipAddress: '128.106.84.12', status: 'success', action: 'View Dashboard' },
    { id: 'LOG-005', timestamp: '14 Aug 2026, 08:05', user: 'Ahmed Al-Farsi', role: 'Sub Admin', category: 'settings', details: 'Changed storefront currency to AED', country: 'uae', ipAddress: '94.200.44.77', status: 'success', action: 'Update Settings' },
    { id: 'LOG-006', timestamp: '13 Aug 2026, 22:47', user: 'Kavita Menon', role: 'Admin', category: 'admin', details: 'Created new sub admin account for Singapore', country: 'singapore', ipAddress: '202.156.18.44', status: 'success', action: 'Create Admin' },
    { id: 'LOG-007', timestamp: '13 Aug 2026, 21:20', user: 'System', role: 'Cron', category: 'admin', details: 'Daily backup completed successfully', country: 'india', ipAddress: '127.0.0.1', status: 'success', action: 'Backup' },
    { id: 'LOG-008', timestamp: '13 Aug 2026, 20:53', user: 'Priya Sharma', role: 'Sub Admin', category: 'logout', details: 'Logged out from admin panel', country: 'india', ipAddress: '103.21.158.221', status: 'success', action: 'Logout' },
    { id: 'LOG-009', timestamp: '13 Aug 2026, 19:40', user: 'Sara Haddad', role: 'Manager', category: 'product', details: 'Added new product category: Beverages', country: 'uae', ipAddress: '94.200.33.112', status: 'success', action: 'Add Product' },
    { id: 'LOG-010', timestamp: '13 Aug 2026, 18:26', user: 'Michael Brown', role: 'Manager', category: 'login', details: 'Logged in successfully from admin panel', country: 'us', ipAddress: '74.125.240.101', status: 'success', action: 'Login' },
    { id: 'LOG-011', timestamp: '13 Aug 2026, 17:55', user: 'Wei Lin Tan', role: 'Viewer', category: 'product', details: 'Exported product inventory report', country: 'singapore', ipAddress: '128.106.84.12', status: 'success', action: 'Export Report' },
    { id: 'LOG-012', timestamp: '13 Aug 2026, 16:33', user: 'Ahmed Al-Farsi', role: 'Sub Admin', category: 'login', details: 'Failed login attempt - account locked', country: 'uae', ipAddress: '94.200.44.77', status: 'failed', action: 'Login Failed' },
    { id: 'LOG-013', timestamp: '13 Aug 2026, 15:12', user: 'Ravi Kumar', role: 'Sub Admin', category: 'country', details: 'Updated India delivery zones', country: 'india', ipAddress: '106.51.34.190', status: 'success', action: 'Update Country' },
    { id: 'LOG-014', timestamp: '13 Aug 2026, 14:45', user: 'Kavita Menon', role: 'Admin', category: 'settings', details: 'Updated notification preferences', country: 'singapore', ipAddress: '202.156.18.44', status: 'success', action: 'Update Settings' },
    { id: 'LOG-015', timestamp: '13 Aug 2026, 13:58', user: 'System', role: 'Cron', category: 'admin', details: 'Payment gateway health check passed', country: 'us', ipAddress: '127.0.0.1', status: 'success', action: 'Health Check' },
    { id: 'LOG-016', timestamp: '13 Aug 2026, 12:31', user: 'Priya Sharma', role: 'Sub Admin', category: 'product', details: 'Deleted discontinued product item', country: 'india', ipAddress: '103.21.158.221', status: 'success', action: 'Delete Product' },
    { id: 'LOG-017', timestamp: '13 Aug 2026, 11:47', user: 'Michael Brown', role: 'Manager', category: 'settings', details: 'Modified US tax rate settings', country: 'us', ipAddress: '74.125.240.101', status: 'success', action: 'Update Settings' },
    { id: 'LOG-018', timestamp: '13 Aug 2026, 10:22', user: 'Wei Lin Tan', role: 'Viewer', category: 'login', details: 'Logged in successfully from admin panel', country: 'singapore', ipAddress: '128.106.84.12', status: 'success', action: 'Login' },
    { id: 'LOG-019', timestamp: '13 Aug 2026, 09:50', user: 'Ahmed Al-Farsi', role: 'Sub Admin', category: 'product', details: 'Updated stock for Fresh Dates', country: 'uae', ipAddress: '94.200.44.77', status: 'success', action: 'Update Stock' },
    { id: 'LOG-020', timestamp: '13 Aug 2026, 08:14', user: 'Ravi Kumar', role: 'Sub Admin', category: 'admin', details: 'Reset password for support agent', country: 'india', ipAddress: '106.51.34.190', status: 'success', action: 'Reset Password' },
    { id: 'LOG-021', timestamp: '12 Aug 2026, 23:05', user: 'Kavita Menon', role: 'Admin', category: 'logout', details: 'Logged out from admin panel', country: 'singapore', ipAddress: '202.156.18.44', status: 'success', action: 'Logout' },
    { id: 'LOG-022', timestamp: '12 Aug 2026, 21:39', user: 'System', role: 'Cron', category: 'admin', details: 'Weekly analytics aggregation completed', country: 'india', ipAddress: '127.0.0.1', status: 'success', action: 'Aggregate Data' },
    { id: 'LOG-023', timestamp: '12 Aug 2026, 20:18', user: 'Priya Sharma', role: 'Sub Admin', category: 'country', details: 'Changed India currency display symbol', country: 'india', ipAddress: '103.21.158.221', status: 'success', action: 'Update Country' },
    { id: 'LOG-024', timestamp: '12 Aug 2026, 18:44', user: 'Sara Haddad', role: 'Manager', category: 'login', details: 'Logged in successfully from admin panel', country: 'uae', ipAddress: '94.200.33.112', status: 'success', action: 'Login' },
    { id: 'LOG-025', timestamp: '12 Aug 2026, 17:29', user: 'Michael Brown', role: 'Manager', category: 'product', details: 'Added product: Organic Avocados', country: 'us', ipAddress: '74.125.240.101', status: 'success', action: 'Add Product' },
    { id: 'LOG-026', timestamp: '12 Aug 2026, 16:02', user: 'Wei Lin Tan', role: 'Viewer', category: 'login', details: 'Failed login attempt - session expired', country: 'singapore', ipAddress: '128.106.84.12', status: 'failed', action: 'Login Failed' },
    { id: 'LOG-027', timestamp: '12 Aug 2026, 14:37', user: 'Ahmed Al-Farsi', role: 'Sub Admin', category: 'settings', details: 'Enabled new delivery partner for UAE', country: 'uae', ipAddress: '94.200.44.77', status: 'success', action: 'Update Settings' },
    { id: 'LOG-028', timestamp: '12 Aug 2026, 13:12', user: 'Ravi Kumar', role: 'Sub Admin', category: 'admin', details: 'Updated admin profile information', country: 'india', ipAddress: '106.51.34.190', status: 'success', action: 'Update Profile' },
    { id: 'LOG-029', timestamp: '12 Aug 2026, 11:48', user: 'Kavita Menon', role: 'Admin', category: 'country', details: 'Added Singapore delivery zone', country: 'singapore', ipAddress: '202.156.18.44', status: 'success', action: 'Add Zone' },
    { id: 'LOG-030', timestamp: '12 Aug 2026, 10:21', user: 'System', role: 'Cron', category: 'admin', details: 'Security scan completed - no threats found', country: 'us', ipAddress: '127.0.0.1', status: 'success', action: 'Security Scan' },
    { id: 'LOG-031', timestamp: '12 Aug 2026, 09:06', user: 'Priya Sharma', role: 'Sub Admin', category: 'login', details: 'Logged in successfully from admin panel', country: 'india', ipAddress: '103.21.158.221', status: 'success', action: 'Login' },
    { id: 'LOG-032', timestamp: '12 Aug 2026, 08:40', user: 'Michael Brown', role: 'Manager', category: 'logout', details: 'Logged out from admin panel', country: 'us', ipAddress: '74.125.240.101', status: 'success', action: 'Logout' },
    { id: 'LOG-033', timestamp: '11 Aug 2026, 22:55', user: 'Wei Lin Tan', role: 'Viewer', category: 'product', details: 'Viewed top selling products report', country: 'singapore', ipAddress: '128.106.84.12', status: 'success', action: 'View Report' },
    { id: 'LOG-034', timestamp: '11 Aug 2026, 21:18', user: 'Ahmed Al-Farsi', role: 'Sub Admin', category: 'admin', details: 'Archived old support tickets', country: 'uae', ipAddress: '94.200.44.77', status: 'success', action: 'Archive Tickets' },
    { id: 'LOG-035', timestamp: '11 Aug 2026, 19:44', user: 'Ravi Kumar', role: 'Sub Admin', category: 'settings', details: 'Changed storefront theme color', country: 'india', ipAddress: '106.51.34.190', status: 'success', action: 'Update Settings' },
    { id: 'LOG-036', timestamp: '11 Aug 2026, 18:20', user: 'Sara Haddad', role: 'Manager', category: 'product', details: 'Updated product description', country: 'uae', ipAddress: '94.200.33.112', status: 'success', action: 'Update Product' },
    { id: 'LOG-037', timestamp: '11 Aug 2026, 16:57', user: 'Kavita Menon', role: 'Admin', category: 'admin', details: 'Deleted inactive user account', country: 'singapore', ipAddress: '202.156.18.44', status: 'success', action: 'Delete User' },
    { id: 'LOG-038', timestamp: '11 Aug 2026, 15:33', user: 'System', role: 'Cron', category: 'admin', details: 'Inventory sync with warehouse completed', country: 'india', ipAddress: '127.0.0.1', status: 'success', action: 'Sync Inventory' },
    { id: 'LOG-039', timestamp: '11 Aug 2026, 14:11', user: 'Michael Brown', role: 'Manager', category: 'login', details: 'Failed login attempt - 2FA required', country: 'us', ipAddress: '74.125.240.101', status: 'failed', action: 'Login Failed' },
    { id: 'LOG-040', timestamp: '11 Aug 2026, 12:45', user: 'Priya Sharma', role: 'Sub Admin', category: 'country', details: 'Generated India sales report', country: 'india', ipAddress: '103.21.158.221', status: 'success', action: 'Export Report' }
  ];

  function deepClone(arr) {
    return JSON.parse(JSON.stringify(arr || []));
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
    var fresh = deepClone(DEFAULT_LOGS);
    save(fresh);
    return fresh;
  }

  function save(arr) {
    try {
      var wrapper = { data: JSON.parse(JSON.stringify(arr)), __v: STORAGE_VERSION };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
    } catch (e) {}
  }

  var ActivityLogManager = {
    allLogs: load(),
    state: {
      logs: deepClone(load()),
      search: '',
      categoryFilter: 'all',
      page: 1,
      perPage: 10
    },

    _flagHtml: function (key) {
      var info = COUNTRY_INFO[key];
      if (!info) return key;
      if (info.flagImg) {
        return '<img src="' + info.flagImg + '" title="' + info.name + '" style="width:24px;height:16px;object-fit:cover;border-radius:3px;border:1px solid var(--border)" alt="' + info.name + ' flag"> <span style="font-weight:600;color:var(--text)">' + info.name + '</span>';
      }
      return '<span style="font-size:16px;line-height:1" title="' + info.name + '">' + info.flag + '</span> <span style="font-weight:600;color:var(--text)">' + info.name + '</span>';
    },

    _statusBadge: function (status) {
      var map = {
        success: 'rgba(22,163,74,.1)',
        failed: 'rgba(239,68,68,.1)',
        pending: 'rgba(245,158,11,.1)'
      };
      var color = {
        success: '#16a34a',
        failed: '#ef4444',
        pending: '#f59e0b'
      };
      var label = status.charAt(0).toUpperCase() + status.slice(1);
      return '<span style="display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;background:' + (map[status] || 'rgba(100,116,139,.1)') + ';color:' + (color[status] || '#64748b') + '">' + label + '</span>';
    },

    _rowHtml: function (l) {
      return '' +
        '<tr>' +
        '<td><span style="font-size:12px;color:var(--text);white-space:nowrap">' + esc(l.timestamp) + '</span></td>' +
        '<td><div><span style="font-weight:600;color:var(--text)">' + esc(l.user) + '</span><div style="font-size:11px;color:var(--text-secondary)">' + esc(l.role) + '</div></div></td>' +
        '<td><span style="font-size:12px;color:var(--text)">' + esc(l.category.charAt(0).toUpperCase() + l.category.slice(1)) + '</span></td>' +
        '<td style="max-width:280px"><span style="font-size:12px;color:var(--text);display:block;white-space:normal;line-height:1.4">' + esc(l.details) + '</span></td>' +
        '<td>' + this._flagHtml(l.country) + '</td>' +
        '<td><span style="font-family:monospace;font-size:12px;color:var(--text)">' + esc(l.ipAddress) + '</span></td>' +
        '<td>' + this._statusBadge(l.status) + '</td>' +
        '<td><div style="display:flex;gap:6px;align-items:center">' +
          '<button class="action-btn view" title="View" onclick="event.stopPropagation();ActivityLogManager.viewLog(\'' + l.id + '\')"><i class="fas fa-eye"></i></button>' +
        '</div></td>' +
        '</tr>';
    },

    getFiltered: function () {
      var self = this;
      var list = self.state.logs.slice();

      if (self.state.categoryFilter !== 'all') {
        list = list.filter(function (l) {
          return l.category === self.state.categoryFilter;
        });
      }

      if (self.state.search) {
        var q = self.state.search.toLowerCase();
        list = list.filter(function (l) {
          return (l.user + ' ' + l.category + ' ' + l.details + ' ' + l.action + ' ' + (l.ipAddress || '') + ' ' + (l.status || '') + ' ' + (COUNTRY_INFO[l.country] ? COUNTRY_INFO[l.country].name : '')).toLowerCase().indexOf(q) !== -1;
        });
      }

      var COUNTRY_ORDER = { singapore: 0, us: 1, uae: 2, india: 3 };
      list.sort(function (a, b) {
        return (COUNTRY_ORDER[a.country] || 99) - (COUNTRY_ORDER[b.country] || 99);
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

    renderLogsTable: function (opts) {
      opts = opts || {};
      var tbody = document.getElementById(opts.tbodyId || 'activityTableBody');
      var paginationEl = document.getElementById(opts.paginationId || 'activityPagination');
      var summaryEl = document.getElementById(opts.summaryId || 'activitySummary');

      var result = this.getPaged();
      var totalPages = result.pages;
      if (this.state.page > totalPages) {
        this.state.page = totalPages;
        result = this.getPaged();
      }

      this.updateFilterTabCounts();

      if (summaryEl) {
        var start = result.total ? (this.state.page - 1) * this.state.perPage + 1 : 0;
        var end = Math.min(this.state.page * this.state.perPage, result.total);
        summaryEl.textContent = 'Showing ' + start + '-' + end + ' of ' + result.total + ' logs';
      }

      if (!tbody) return;

      if (!result.rows.length) {
        tbody.innerHTML = '<tr><td colspan="' + (opts.colCount || 8) + '" style="text-align:center;padding:40px;color:var(--text-secondary)">No activity logs found</td></tr>';
      } else {
        var html = '';
        var self = this;
        result.rows.forEach(function (l) {
          html += self._rowHtml(l);
        });
        tbody.innerHTML = html;
        var actRows = tbody.querySelectorAll('tr');
        actRows.forEach(function(row, i) { row.classList.remove('visible'); row.style.animationDelay = (i * 0.06) + 's'; });
        if (window._actObserver) window._actObserver.disconnect();
        window._actObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); window._actObserver.unobserve(e.target); } });
        }, { threshold: 0.01, rootMargin: '200px' });
        actRows.forEach(function(row) { window._actObserver.observe(row); });
      }

      if (paginationEl) {
        paginationEl.innerHTML = this._paginationHtml(totalPages);
      }
    },

    updateFilterTabCounts: function () {
      var tabs = document.querySelectorAll('.activity-filter-tab');
      var all = this.state.logs.length;
      var counts = {};
      this.state.logs.forEach(function (l) {
        counts[l.category] = (counts[l.category] || 0) + 1;
      });
      tabs.forEach(function (tab) {
        var cat = tab.getAttribute('data-category');
        var count = cat === 'all' ? all : (counts[cat] || 0);
        var span = tab.querySelector('.tab-count');
        if (span) span.textContent = count;
      });
    },

    _paginationHtml: function (totalPages) {
      var page = this.state.page;
      var html = '';
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="ActivityLogManager.goToPage(' + (page - 1) + ')"' + (page <= 1 ? ' disabled' : '') + '>Prev</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button class="btn ' + (i === page ? 'btn-primary' : 'btn-secondary') + '" style="padding:6px 12px;font-size:12px" onclick="ActivityLogManager.goToPage(' + i + ')">' + i + '</button>';
      }
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="ActivityLogManager.goToPage(' + (page + 1) + ')"' + (page >= totalPages ? ' disabled' : '') + '>Next</button>';
      return html;
    },

    goToPage: function (p) {
      var totalPages = Math.max(1, Math.ceil(this.getFiltered().length / this.state.perPage));
      if (p < 1) p = 1;
      if (p > totalPages) p = totalPages;
      this.state.page = p;
      if (typeof window.renderCurrentActivityLogs === 'function') window.renderCurrentActivityLogs();
    },

    setCategoryFilter: function (cat) {
      this.state.categoryFilter = cat;
      this.state.page = 1;
      document.querySelectorAll('.activity-filter-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-category') === cat);
      });
      if (typeof window.renderCurrentActivityLogs === 'function') window.renderCurrentActivityLogs();
    },

    setSearch: function (q) {
      this.state.search = (q || '').trim();
      this.state.page = 1;
      if (typeof window.renderCurrentActivityLogs === 'function') window.renderCurrentActivityLogs();
    },

    _activitySection: function (title, icon, rows) {
      var html = '<div class="act-detail-section" style="border:1px solid rgba(255,255,255,.10);border-radius:12px;overflow:hidden;margin-bottom:14px;background:rgba(255,255,255,.06);opacity:0;transform:translateY(14px)">';
      html += '<div style="background:rgba(255,255,255,.08);padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.10);font-size:12px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:8px"><i class="' + icon + '" style="color:#86efac"></i>' + title + '</div>';
      html += '<div style="padding:4px 14px">';
      rows.forEach(function (r) {
        var valHtml = r[2] || r[1] || '';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08)"><span style="font-size:13px;color:rgba(255,255,255,.65);flex-shrink:0">' + esc(r[0]) + '</span>' + valHtml + '</div>';
      });
      html += '</div></div>';
      return html;
    },

    _activityValue: function (val) {
      return '<span style="font-size:13px;font-weight:600;color:#fff;text-align:right;word-break:break-word">' + esc(val) + '</span>';
    },

    _activityBadge: function (val, color) {
      return '<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:' + (color || 'rgba(134,239,172,.16)') + ';color:' + (color ? '#fff' : '#86efac') + '">' + esc(val) + '</span>';
    },

    viewLog: function (id) {
      var l = this.state.logs.find(function (x) { return x.id === id; });
      if (!l) return;

      var statusText = l.status.charAt(0).toUpperCase() + l.status.slice(1);
      var statusColor = l.status === 'success' ? '#16a34a' : l.status === 'failed' ? '#dc2626' : '#d97706';
      var catText = l.category.charAt(0).toUpperCase() + l.category.slice(1);
      var session = 'SES-' + String(l.id).replace(/[^A-Z0-9]/g, '').slice(-5) + '-A';
      var device = l.country === 'india' ? 'Android · Chrome' : l.country === 'us' ? 'iPhone · Safari' : l.country === 'uae' ? 'Windows · Edge' : 'Mac · Chrome';
      var browser = l.country === 'india' ? 'Chrome 126' : l.country === 'us' ? 'Safari 17' : l.country === 'uae' ? 'Edge 125' : 'Chrome 126';
      var countryName = COUNTRY_INFO[l.country] ? COUNTRY_INFO[l.country].name : l.country;

      var html = '';

      html += this._activitySection('Activity Details', 'fas fa-circle-info', [
        ['Activity Type', this._activityValue(l.action), ''],
        ['Timestamp', this._activityValue(l.timestamp), ''],
        ['Status', this._activityBadge(statusText, statusColor), ''],
        ['Category', this._activityValue(catText), '']
      ]);

      html += this._activitySection('Activity Information', 'fas fa-clock', [
        ['Log ID', this._activityValue(l.id), ''],
        ['Action', this._activityValue(l.action), ''],
        ['Outcome', this._activityBadge(statusText === 'Success' ? 'Successful' : statusText, statusColor), ''],
        ['Duration', this._activityValue('1.2s'), ''],
        ['Location', this._activityValue(countryName), '']
      ]);

      html += this._activitySection('User Information', 'fas fa-user', [
        ['Full Name', this._activityValue(l.user), ''],
        ['Role', this._activityValue(l.role), ''],
        ['Country', this._activityValue(countryName), ''],
        ['Status', this._activityBadge(statusText, statusColor), '']
      ]);

      html += this._activitySection('Target Information', 'fas fa-crosshairs', [
        ['Target Account', this._activityValue('Target-' + l.id), ''],
        ['Target Type', this._activityValue('System Resource'), ''],
        ['Resource', this._activityValue(l.category + ' module'), ''],
        ['Region', this._activityValue(countryName), ''],
        ['Verification', this._activityBadge(statusText, statusColor), '']
      ]);

      html += this._activitySection('Request Information', 'fas fa-network-wired', [
        ['IP Address', this._activityValue(l.ipAddress), ''],
        ['Device', this._activityValue(device), ''],
        ['Browser', this._activityValue(browser), ''],
        ['Request Method', this._activityValue('POST /api/' + l.category), ''],
        ['Session ID', this._activityValue(session), '']
      ]);

      html += this._activitySection('Additional Information', 'fas fa-layer-group', [
        ['Details', this._activityValue(l.details), ''],
        ['Action', this._activityValue(l.action), ''],
        ['Category', this._activityValue(catText), ''],
        ['Status', this._activityBadge(statusText, statusColor), '']
      ]);

      var modal = document.getElementById('activityLogDetailModal');
      var content = document.getElementById('activityLogDetailContent');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'activityLogDetailModal';
        modal.style.cssText = 'display:none;position:fixed;top:0;right:0;bottom:0;left:0;z-index:10002;background:rgba(0,0,0,.45)';
        modal.innerHTML =
          '<div style="position:absolute;top:0;right:0;bottom:0;width:520px;max-width:100%;background:linear-gradient(135deg,#14472F,#0d3018);box-shadow:-12px 0 40px rgba(0,0,0,.18);display:flex;flex-direction:column">' +
            '<div style="background:linear-gradient(135deg,#065f46,#047857);padding:18px 22px;color:#fff;display:flex;justify-content:space-between;align-items:center;flex-shrink:0">' +
              '<div><h2 style="margin:0;font-size:17px;font-weight:700"><i class="fas fa-user-clock" style="margin-right:8px"></i> Activity Details</h2><div style="font-size:12px;color:rgba(255,255,255,.85);margin-top:3px">' + esc(l.user) + ' \u00B7 ' + esc(countryName) + '</div></div>' +
              '<button onclick="ActivityLogManager.closeLogDetail()" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:16px;line-height:1">&times;</button>' +
            '</div>' +
            '<div style="flex:1;overflow-y:auto;padding:18px 20px" id="activityLogDetailContent"></div>' +
          '</div>';
        document.body.appendChild(modal);
      }
      content = document.getElementById('activityLogDetailContent');
      content.innerHTML = html;
      modal.style.display = 'block';
      var sections = content.querySelectorAll('.act-detail-section');
      sections.forEach(function(sec, i) {
        sec.style.animationDelay = (i * 0.1) + 's';
        sec.classList.add('act-slide-up');
      });
    },

    closeLogDetail: function () {
      var modal = document.getElementById('activityLogDetailModal');
      if (modal) modal.style.display = 'none';
    },

    toggleMenu: function (id, btn) {
      var self = this;
      document.querySelectorAll('.al-menu').forEach(function (m) {
        if (m.id !== 'alMenu-' + id) m.style.display = 'none';
      });
      var menu = document.getElementById('alMenu-' + id);
      if (!menu) return;
      if (menu.style.display === 'none') {
        var trigger = btn || document.getElementById('alDotBtn-' + id);
        var r = trigger ? trigger.getBoundingClientRect() : null;
        menu.style.display = 'block';
        var mh = menu.offsetHeight || 120;
        var mw = menu.offsetWidth || 180;
        if (r) {
          var left = r.left;
          if (left + mw > window.innerWidth - 8) left = window.innerWidth - mw - 8;
          if (left < 8) left = 8;
          menu.style.left = left + 'px';
          var spaceBelow = window.innerHeight - r.bottom - 8;
          if (spaceBelow < mh && r.top > mh) {
            menu.style.top = (r.top - 4 - mh) + 'px';
          } else {
            menu.style.top = (r.bottom + 4) + 'px';
          }
        }
      } else {
        menu.style.display = 'none';
      }
    },

    closeAllMenus: function () {
      document.querySelectorAll('.al-menu').forEach(function (m) {
        m.style.display = 'none';
      });
    },

    editLog: function (id) {
      var l = this.state.logs.find(function (x) { return x.id === id; });
      if (!l) return;
      var action = prompt('Edit log action for ' + l.id + ':', l.action);
      if (action === null) return;
      if (action.trim() === '') { alert('Action cannot be empty.'); return; }
      l.action = action.trim();
      this.persist();
      if (typeof window.renderCurrentActivityLogs === 'function') window.renderCurrentActivityLogs();
    },

    deleteLog: function (id) {
      var l = this.state.logs.find(function (x) { return x.id === id; });
      if (!l) return;
      if (!confirm('Delete this activity log (' + l.id + ')?')) return;
      if (typeof DeleteHistory !== 'undefined') DeleteHistory.log(l.user + ' — ' + l.category, 'Activity Log', l.user, Object.assign({}, l));
      this.state.logs = this.state.logs.filter(function (x) { return x.id !== id; });
      this.allLogs = this.state.logs.slice();
      this.persist();
      if (typeof window.renderCurrentActivityLogs === 'function') window.renderCurrentActivityLogs();
    },

    exportLog: function (id) {
      var l = this.state.logs.find(function (x) { return x.id === id; });
      if (!l) return;
      var csv = 'Timestamp,User,Role,Category,Details,Country,IP Address,Status,Action\n' +
        [l.timestamp, l.user, l.role, l.category, (l.details || '').replace(/,/g, ' '), COUNTRY_INFO[l.country] ? COUNTRY_INFO[l.country].name : l.country, l.ipAddress, l.status, l.action].join(',');
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var aEl = document.createElement('a');
      aEl.href = url;
      aEl.download = 'log-' + l.id + '.csv';
      document.body.appendChild(aEl);
      aEl.click();
      document.body.removeChild(aEl);
      URL.revokeObjectURL(url);
    },

    persist: function () {
      save(this.state.logs);
    },

    /* ---- Export ---- */
    exportCSV: function () {
      var rows = this.state.logs.map(function (l) {
        return [l.timestamp, l.user, l.role, l.category, (l.details || '').replace(/,/g, ' '), COUNTRY_INFO[l.country] ? COUNTRY_INFO[l.country].name : l.country, l.ipAddress, l.status, l.action].join(',');
      });
      var csv = 'Timestamp,User,Role,Category,Details,Country,IP Address,Status,Action\n' + rows.join('\n');
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var aEl = document.createElement('a');
      aEl.href = url;
      aEl.download = 'activity-logs.csv';
      document.body.appendChild(aEl);
      aEl.click();
      document.body.removeChild(aEl);
      URL.revokeObjectURL(url);
    },

    /* ---- Print ---- */
    printLogs: function () {
      var html = '<html><head><title>Activity Logs</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left}th{background:#f8fafc}</style></head><body>';
      html += '<h2>Activity Logs Report</h2><table><thead><tr><th>Timestamp</th><th>User</th><th>Category</th><th>Details</th><th>Country</th><th>IP Address</th><th>Status</th><th>Action</th></tr></thead><tbody>';
      this.state.logs.forEach(function (l) {
        html += '<tr><td>' + esc(l.timestamp) + '</td><td>' + esc(l.user) + ' (' + esc(l.role) + ')</td><td>' + esc(l.category) + '</td><td>' + esc(l.details) + '</td><td>' + esc(COUNTRY_INFO[l.country] ? COUNTRY_INFO[l.country].name : l.country) + '</td><td>' + esc(l.ipAddress) + '</td><td>' + esc(l.status) + '</td><td>' + esc(l.action) + '</td></tr>';
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

  window.ActivityLogManager = ActivityLogManager;

  document.addEventListener('click', function () {
    if (typeof ActivityLogManager.closeAllMenus === 'function') ActivityLogManager.closeAllMenus();
  });
})();
