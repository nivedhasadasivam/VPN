/* VPNexues CountryManager
 * Self-contained country management for admin dashboards.
 * Persists to localStorage under 'vpnexues_countries'.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'vpnexues_countries';
  var STORAGE_VERSION = 4;

  var DEFAULT_COUNTRIES = [
    {
      id: 'IN',
      name: 'India',
      code: 'IN',
      flag: '\uD83C\uDDEE\uD83C\uDDF3',
      flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/in-flag.svg',
      currency: 'Indian Rupee',
      currencyCode: 'INR',
      currencySymbol: '\u20B9',
      phoneCode: '+91',
      language: 'English',
      timezone: 'Asia/Kolkata (UTC+5:30)',
      orders: 0,
      revenue: 0,
      customers: 0,
      admin: 'India Admin',
      adminEmail: 'india@gmail.com',
      cities: 'Mumbai, Delhi, Bengaluru, Chennai',
      createdDate: '01 Jan 2024',
      lastUpdatedDate: '13 Aug 2026',
      status: 'active',
      details: 'India is the primary market with nationwide organic farm delivery.'
    },
    {
      id: 'SG',
      name: 'Singapore',
      code: 'SG',
      flag: '\uD83C\uDDF8\uD83C\uDDEC',
      flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/sg-flag.png',
      currency: 'Singapore Dollar',
      currencyCode: 'SGD',
      currencySymbol: 'S$',
      phoneCode: '+65',
      language: 'English',
      timezone: 'Asia/Singapore (UTC+8)',
      orders: 0,
      revenue: 0,
      customers: 0,
      admin: 'Singapore Admin',
      adminEmail: 'singapore@gmail.com',
      cities: 'Singapore',
      createdDate: '15 Mar 2024',
      lastUpdatedDate: '13 Aug 2026',
      status: 'active',
      details: 'Singapore market with fast city deliveries.'
    },
    {
      id: 'AE',
      name: 'UAE',
      code: 'AE',
      flag: '\uD83C\uDDE6\uD83C\uDDEA',
      flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/uae%20flag.png',
      currency: 'UAE Dirham',
      currencyCode: 'AED',
      currencySymbol: 'AED ',
      phoneCode: '+971',
      language: 'English',
      timezone: 'Asia/Dubai (UTC+4)',
      orders: 0,
      revenue: 0,
      customers: 0,
      admin: 'UAE Admin',
      adminEmail: 'uae@gmail.com',
      cities: 'Dubai, Abu Dhabi, Sharjah',
      createdDate: '20 Apr 2024',
      lastUpdatedDate: '13 Aug 2026',
      status: 'active',
      details: 'United Arab Emirates operations across all emirates.'
    },
    {
      id: 'US',
      name: 'United States',
      code: 'US',
      flag: '\uD83C\uDDFA\uD83C\uDDF8',
      flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/us%20flag.png',
      currency: 'US Dollar',
      currencyCode: 'USD',
      currencySymbol: '$',
      phoneCode: '+1',
      language: 'English',
      timezone: 'America/New_York (UTC-5)',
      orders: 0,
      revenue: 0,
      customers: 0,
      admin: 'US Admin',
      adminEmail: 'us@gmail.com',
      cities: 'New York, Los Angeles, Chicago',
      createdDate: '10 Jun 2024',
      lastUpdatedDate: '13 Aug 2026',
      status: 'active',
      details: 'United States market with multi-state coverage.'
    }
  ];

  function deepClone(arr) {
    return JSON.parse(JSON.stringify(arr || []));
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    var fresh = deepClone(DEFAULT_COUNTRIES);
    save(fresh);
    return fresh;
  }

  function save(arr) {
    try {
      var wrapper = { data: JSON.parse(JSON.stringify(arr)), __v: STORAGE_VERSION };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
    } catch (e) {}
  }

  var CountryManager = {
    allCountries: load(),
    state: {
      countries: deepClone(load()),
      search: '',
      statusFilter: 'all',
      sortBy: 'name',
      sortDir: 'asc',
      page: 1,
      perPage: 10,
      editingId: null
    },

    getFiltered: function () {
      var self = this;
      var list = self.state.countries.slice();

      if (self.state.statusFilter !== 'all') {
        list = list.filter(function (c) {
          return c.status === self.state.statusFilter;
        });
      }

      if (self.state.search) {
        var q = self.state.search.toLowerCase();
        list = list.filter(function (c) {
          return (c.name + ' ' + c.code + ' ' + c.currencyCode + ' ' + c.currency + ' ' + c.adminEmail + ' ' + c.phoneCode + ' ' + c.language + ' ' + c.timezone).toLowerCase().indexOf(q) !== -1;
        });
      }

      var key = self.state.sortBy;
      var dir = self.state.sortDir === 'asc' ? 1 : -1;
      list.sort(function (a, b) {
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

    renderCountriesTable: function (opts) {
      opts = opts || {};
      var tbody = document.getElementById(opts.tbodyId || 'countriesTableBody');
      var paginationEl = document.getElementById(opts.paginationId || 'countriesPagination');
      var summaryEl = document.getElementById(opts.summaryId || 'countriesSummary');

      var result = this.getPaged();
      var totalPages = result.pages;
      if (this.state.page > totalPages) {
        this.state.page = totalPages;
        result = this.getPaged();
      }

      this.updateFilterTabCounts();

      if (summaryEl) {
        summaryEl.textContent = '';
      }

      if (!tbody) return;

      if (!result.rows.length) {
        tbody.innerHTML = '<tr><td colspan="' + (opts.colCount || 10) + '" style="text-align:center;padding:40px;color:var(--text-secondary)">No countries found</td></tr>';
      } else {
        var html = '';
        var self = this;
        result.rows.forEach(function (c) {
          html += self._rowHtml(c);
        });
        tbody.innerHTML = html;
      }

      if (paginationEl) {
        paginationEl.innerHTML = this._paginationHtml(totalPages);
      }

      setTimeout(function() {
        if (window._countryRowObs) window._countryRowObs.disconnect();
        var rows = tbody.querySelectorAll('tr');
        rows.forEach(function(row, i) { row.classList.remove('visible'); row.style.animationDelay = (i * 0.06) + 's'; });
        window._countryRowObs = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); window._countryRowObs.unobserve(e.target); } });
        }, { threshold: 0.01, rootMargin: '200px' });
        rows.forEach(function(row) { window._countryRowObs.observe(row); });
      }, 20);
    },

    _rowHtml: function (c) {
      var flagEl = c.flagImg
        ? '<img src="' + esc(c.flagImg) + '" style="width:32px;height:22px;object-fit:cover;border-radius:4px;flex-shrink:0" alt="' + esc(c.name) + ' flag">'
        : '<span style="font-size:22px;line-height:1">' + (c.flag || '') + '</span>';
      return '' +
        '<tr>' +
        '<td><div style="display:flex;align-items:center;gap:10px;cursor:pointer" onclick="CountryManager.openCountryDetail(\'' + esc(c.id) + '\')" title="View ' + esc(c.name) + ' details">' + flagEl + '<div><div style="font-weight:600;color:var(--text)">' + esc(c.name) + '</div></div></div></td>' +
        '<td><div style="font-weight:600;color:var(--text)">' + esc(c.currencySymbol) + ' ' + esc(c.currencyCode) + '</div><div style="font-size:11px;color:var(--text-secondary)">' + esc(c.currency) + '</div></td>' +
        '<td>' + esc(c.phoneCode) + '</td>' +
        '<td>' + esc(c.language) + '</td>' +
        '<td>' + esc(c.timezone) + '</td>' +
        '<td><div style="font-weight:600;color:var(--text)">' + esc(c.orders) + '</div></td>' +
        '<td><div style="font-weight:600;color:var(--text)">' + esc(c.currencySymbol + c.revenue) + '</div></td>' +
        '<td><div style="font-weight:600;color:var(--text)">' + esc(c.admin) + '</div><div style="font-size:11px;color:var(--text-secondary)">' + esc(c.adminEmail) + '</div></td>' +
        '<td><div style="display:flex;gap:6px">' +
          '<button class="action-btn view" title="View" onclick="CountryManager.openCountryDetail(\'' + c.id + '\')"><i class="fas fa-eye"></i></button>' +
        '</div></td>' +
        '</tr>';
    },

    _paginationHtml: function (totalPages) {
      var self = this;
      var page = this.state.page;
      var html = '';
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="CountryManager.goToPage(' + (page - 1) + ')"' + (page <= 1 ? ' disabled' : '') + '>Prev</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button class="btn ' + (i === page ? 'btn-primary' : 'btn-secondary') + '" style="padding:6px 12px;font-size:12px" onclick="CountryManager.goToPage(' + i + ')">' + i + '</button>';
      }
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="CountryManager.goToPage(' + (page + 1) + ')"' + (page >= totalPages ? ' disabled' : '') + '>Next</button>';
      return html;
    },

    updateFilterTabCounts: function () {
      var tabs = document.querySelectorAll('.country-filter-tab');
      var self = this;
      var all = this.state.countries.length;
      var active = this.state.countries.filter(function (c) { return c.status === 'active'; }).length;
      var inactive = this.state.countries.filter(function (c) { return c.status === 'inactive'; }).length;
      tabs.forEach(function (tab) {
        var status = tab.getAttribute('data-status');
        var count = status === 'all' ? all : status === 'active' ? active : inactive;
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
      document.querySelectorAll('.country-filter-tab').forEach(function (tab) {
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
      var input = document.getElementById('countrySearchInput');
      if (input) input.value = '';
      document.querySelectorAll('.country-filter-tab').forEach(function (tab) {
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
      if (typeof window.renderCurrentCountries === 'function') {
        window.renderCurrentCountries();
      }
    },

    getCountry: function (id) {
      return this.state.countries.find(function (c) { return c.id === id; });
    },

    persist: function () {
      this.allCountries = deepClone(this.state.countries);
      save(this.state.countries);
    },

    updateOrders: function (id, value) {
      var c = this.getCountry(id);
      if (c) {
        c.orders = Math.max(0, parseInt(value || 0, 10) || 0);
        this.persist();
      }
    },

    updateRevenue: function (id, value) {
      var c = this.getCountry(id);
      if (c) {
        c.revenue = Math.max(0, parseFloat(value || 0) || 0);
        this.persist();
      }
    },

    toggleStatus: function (id) {
      var c = this.getCountry(id);
      if (c) {
        c.status = c.status === 'active' ? 'inactive' : 'active';
        this.persist();
        this.renderCurrent();
      }
    },

    deleteCountry: function (id) {
      var c = this.getCountry(id);
      if (!c) return;
      if (!confirm('Delete ' + c.name + '?')) return;
      if (typeof DeleteHistory !== 'undefined') DeleteHistory.log(c.name, 'Country', c.name, Object.assign({}, c));
      this.state.countries = this.state.countries.filter(function (x) { return x.id !== id; });
      this.persist();
      this.renderCurrent();
    },

    /* ---- Detail ---- */
    openCountryDetail: function (id) {
      var c = this.getCountry(id);
      if (!c) return;
      var content = document.getElementById('countryDetailContent');
      var modal = document.getElementById('countryDetailModal');
      if (!content || !modal) return;
      var statusClass = c.status === 'active' ? 'active' : 'inactive';
      var flagEl = c.flagImg
        ? '<div style="width:200px;height:130px;border-radius:16px;overflow:hidden;background:#2E7D32;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.25);flex-shrink:0"><img src="' + esc(c.flagImg) + '" style="width:100%;height:100%;object-fit:cover;display:block" alt="' + esc(c.name) + ' flag"></div>'
        : '<span style="font-size:90px;line-height:1">' + (c.flag || '') + '</span>';
      var statusText = c.status.charAt(0).toUpperCase() + c.status.slice(1);
      content.innerHTML =
        '<div style="display:flex;min-height:460px;overflow:hidden">' +
          /* LEFT - green flag panel */
          '<div style="width:34%;background:#134B2F;padding:36px 28px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff">' +
            flagEl +
            '<h3 style="margin:18px 0 6px;font-size:24px;font-weight:700;color:#fff">' + esc(c.name) + '</h3>' +
            '<span style="padding:5px 16px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(255,255,255,.18);color:#fff">' + esc(statusText) + '</span>' +
          '</div>' +
          /* RIGHT - white details panel */
          '<div style="flex:1;padding:28px 24px;background:#fff;color:#111">' +
            '<h4 style="margin:0 0 14px;font-size:18px;font-weight:700;color:#111">Country Details</h4>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">' +
              this._detailRow('Country Name', c.name) +
              this._detailRow('Country Code', c.code) +
              this._detailRow('Currency', c.currencySymbol + c.currencyCode) +
              this._detailRow('Phone Code', c.phoneCode) +
              this._detailRow('Language', c.language) +
              this._detailRow('Timezone', c.timezone) +
              this._detailRow('Orders', c.orders) +
              this._detailRow('Total Orders', c.orders) +
              this._detailRow('Revenue', c.currencySymbol + c.revenue) +
              this._detailRow('Customers', c.customers || 0) +
            '</div>' +
            '<h5 style="margin:22px 0 12px;font-size:15px;font-weight:700;color:#111">Additional Information</h5>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">' +
              this._detailRow('Cities', c.cities || '—') +
              this._detailRow('Created Date', c.createdDate || '—') +
              this._detailRow('Last Updated', c.lastUpdatedDate || '—') +
            '</div>' +
          '</div>' +
        '</div>';
      modal.style.display = 'flex';
    },

    _detailRow: function (label, value) {
      return '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px">' +
        '<div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + esc(label) + '</div>' +
        '<div style="font-size:13px;font-weight:600;color:#111">' + esc(value) + '</div></div>';
    },

    closeCountryDetail: function () {
      var modal = document.getElementById('countryDetailModal');
      if (modal) modal.style.display = 'none';
    },

    /* ---- Edit ---- */
    editCountry: function (id) {
      var c = this.getCountry(id);
      if (!c) return;
      var modal = document.getElementById('countryEditModal');
      if (!modal) return;
      this.state.editingId = id;
      document.getElementById('editCountryId').value = c.id;
      document.getElementById('editCountryName').value = c.name;
      document.getElementById('editCountryCode').value = c.code;
      document.getElementById('editPhoneCode').value = c.phoneCode;
      document.getElementById('editLanguage').value = c.language;
      document.getElementById('editCurrency').value = c.currency;
      document.getElementById('editCurrencyCode').value = c.currencyCode;
      document.getElementById('editCurrencySymbol').value = c.currencySymbol;
      document.getElementById('editTimezone').value = c.timezone;
      document.getElementById('editDetails').value = c.details || '';
      document.getElementById('editAdmin').value = c.admin || '';
      document.getElementById('editAdminEmail').value = c.adminEmail || '';
      modal.style.display = 'flex';
    },

    closeCountryEdit: function () {
      var modal = document.getElementById('countryEditModal');
      if (modal) modal.style.display = 'none';
    },

    confirmCountryEdit: function () {
      var id = document.getElementById('editCountryId').value;
      var c = this.getCountry(id);
      if (!c) return;
      c.name = document.getElementById('editCountryName').value || c.name;
      c.code = document.getElementById('editCountryCode').value || c.code;
      c.phoneCode = document.getElementById('editPhoneCode').value || c.phoneCode;
      c.language = document.getElementById('editLanguage').value || c.language;
      c.currency = document.getElementById('editCurrency').value || c.currency;
      c.currencyCode = document.getElementById('editCurrencyCode').value || c.currencyCode;
      c.currencySymbol = document.getElementById('editCurrencySymbol').value || c.currencySymbol;
      c.timezone = document.getElementById('editTimezone').value || c.timezone;
      c.details = document.getElementById('editDetails').value || '';
      c.admin = document.getElementById('editAdmin').value || c.admin;
      c.adminEmail = document.getElementById('editAdminEmail').value || c.adminEmail;
      this.persist();
      this.closeCountryEdit();
      this.renderCurrent();
    },

    /* ---- Add ---- */
    addCountry: function () {
      var modal = document.getElementById('countryAddModal');
      if (!modal) return;
      modal.style.display = 'flex';
    },

    closeCountryAdd: function () {
      var modal = document.getElementById('countryAddModal');
      if (modal) modal.style.display = 'none';
    },

    confirmCountryAdd: function () {
      var name = (document.getElementById('addCountryName').value || '').trim();
      var code = (document.getElementById('addCountryCode').value || '').trim().toUpperCase();
      if (!name || !code) {
        alert('Country Name and Country Code are required.');
        return;
      }
      if (this.getCountry(code)) {
        alert('Country with code ' + code + ' already exists.');
        return;
      }
      var country = {
        id: code,
        name: name,
        code: code,
        flag: '\uD83C\uDDF0\uD83C\uDDF7',
        currency: document.getElementById('addCurrency').value || '—',
        currencyCode: (document.getElementById('addCurrencyCode').value || '').trim().toUpperCase() || code,
        currencySymbol: document.getElementById('addCurrencySymbol').value || '',
        phoneCode: document.getElementById('addPhoneCode').value || '+0',
        language: document.getElementById('addLanguage').value || 'English',
        timezone: document.getElementById('addTimezone').value || 'UTC',
        orders: 0,
        revenue: 0,
        admin: document.getElementById('addAdmin').value || name + ' Admin',
        adminEmail: document.getElementById('addAdminEmail').value || code.toLowerCase() + '@gmail.com',
        status: 'active',
        details: document.getElementById('addDetails').value || ''
      };
      this.state.countries.push(country);
      this.persist();
      this.closeCountryAdd();
      this.renderCurrent();
    },

    /* ---- Export ---- */
    exportCSV: function () {
      var rows = this.state.countries.map(function (c) {
        return [c.name, c.code, c.currency, c.currencyCode, c.currencySymbol, c.phoneCode, c.language, c.timezone, c.orders, c.revenue, c.admin, c.adminEmail, c.status].join(',');
      });
      var csv = 'Country,Code,Currency,CurrencyCode,Symbol,PhoneCode,Language,Timezone,Orders,Revenue,Admin,AdminEmail,Status\n' + rows.join('\n');
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'countries.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    /* ---- Print ---- */
    printCountries: function () {
      var html = '<html><head><title>Countries</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left}th{background:#f8fafc}</style></head><body>';
      html += '<h2>Country List</h2><table><thead><tr><th>Country</th><th>Currency</th><th>Phone Code</th><th>Language</th><th>Timezone</th><th>Orders</th><th>Revenue</th><th>Admin</th><th>Status</th></tr></thead><tbody>';
      this.state.countries.forEach(function (c) {
        html += '<tr><td>' + esc(c.name) + '</td><td>' + esc(c.currencySymbol) + ' ' + esc(c.currencyCode) + '</td><td>' + esc(c.phoneCode) + '</td><td>' + esc(c.language) + '</td><td>' + esc(c.timezone) + '</td><td>' + esc(c.orders) + '</td><td>' + esc(c.currencySymbol + c.revenue) + '</td><td>' + esc(c.adminEmail) + '</td><td>' + esc(c.status) + '</td></tr>';
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

  window.CountryManager = CountryManager;
})();
