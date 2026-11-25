/* VPNexues SubAdminManager
 * Self-contained sub-admin management for admin dashboards.
 * Persists to localStorage under 'vpnexues_subadmins'.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'vpnexues_subadmins';
  var STORAGE_VERSION = 3;

  var COUNTRY_INFO = {
    india: { name: 'India', flag: '\uD83C\uDDEE\uD83C\uDDF3', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/in-flag.svg' },
    uae: { name: 'UAE', flag: '\uD83C\uDDE6\uD83C\uDDEA', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/uae%20flag.png' },
    us: { name: 'United States', flag: '\uD83C\uDDFA\uD83C\uDDF8', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/us%20flag.png' },
    singapore: { name: 'Singapore', flag: '\uD83C\uDDF8\uD83C\uDDEC', flagImg: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/sg-flag.png' }
  };

  var DASHBOARD_PAGES = {
    india: 'sub-admin-india.html',
    uae: 'sub-admin-uae.html',
    us: 'sub-admin-us.html',
    singapore: 'sub-admin-singapore.html'
  };

  var DEFAULT_SUBADMINS = [
    {
      id: 'SA-IN-001',
      name: 'Ramesh Kumar',
      email: 'ramesh.kumar@vpnexues.com',
      phone: '+91 98456 12345',
      password: 'admin123',
      country: 'india',
      role: 'sub-admin',
      modules: ['dashboard', 'orders', 'products'],
      permissions: ['view', 'edit'],
      status: 'active',
      lastLogin: '13 Aug 2026, 10:24 AM',
      createdDate: '05 Jan 2025'
    },
    {
      id: 'SA-AE-001',
      name: 'Fatima Al Maktoum',
      email: 'fatima@vpnexues.com',
      phone: '+971 55 123 4567',
      password: 'admin123',
      country: 'uae',
      role: 'admin',
      modules: ['dashboard', 'orders', 'products', 'users'],
      permissions: ['view', 'edit', 'delete'],
      status: 'active',
      lastLogin: '13 Aug 2026, 09:12 AM',
      createdDate: '12 Feb 2025'
    },
    {
      id: 'SA-US-001',
      name: 'John Carter',
      email: 'john.carter@vpnexues.com',
      phone: '+1 (555) 234-5678',
      password: 'admin123',
      country: 'us',
      role: 'manager',
      modules: ['dashboard', 'orders'],
      permissions: ['view'],
      status: 'active',
      lastLogin: '12 Aug 2026, 06:45 PM',
      createdDate: '20 Mar 2025'
    },
    {
      id: 'SA-SG-001',
      name: 'Wei Ling Tan',
      email: 'wei.ling@vpnexues.com',
      phone: '+65 9123 4567',
      password: 'admin123',
      country: 'singapore',
      role: 'viewer',
      modules: ['dashboard'],
      permissions: ['view'],
      status: 'inactive',
      lastLogin: '10 Aug 2026, 03:30 PM',
      createdDate: '01 Apr 2025'
    }
  ];

  var MODULES = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'orders', label: 'Orders' },
    { key: 'products', label: 'Products' },
    { key: 'users', label: 'Users' },
    { key: 'reports', label: 'Reports' },
    { key: 'support', label: 'Support' }
  ];

  var PERMISSIONS = [
    { key: 'view', label: 'View' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
    { key: 'export', label: 'Export' }
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
    var fresh = deepClone(DEFAULT_SUBADMINS);
    save(fresh);
    return fresh;
  }

  function save(arr) {
    try {
      var wrapper = { data: JSON.parse(JSON.stringify(arr)), __v: STORAGE_VERSION };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
    } catch (e) {}
  }

  var SubAdminManager = {
    allSubAdmins: load(),
    state: {
      subAdmins: deepClone(load()),
      search: '',
      statusFilter: 'all',
      countryFilter: 'all',
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
        return '<img src="' + esc(info.flagImg) + '" title="' + esc(info.name) + '" style="width:34px;height:24px;object-fit:cover;border-radius:4px;border:1px solid var(--border)" alt="' + esc(info.name) + ' flag"> <span style="font-weight:600;color:var(--text)">' + esc(info.name) + '</span>';
      }
      return '<span style="font-size:20px;line-height:1" title="' + esc(info.name) + '">' + info.flag + '</span> <span style="font-weight:600;color:var(--text)">' + esc(info.name) + '</span>';
    },

    getFiltered: function () {
      var self = this;
      var list = self.state.subAdmins.slice();

      if (self.state.statusFilter !== 'all') {
        list = list.filter(function (a) {
          return a.status === self.state.statusFilter;
        });
      }

      if (self.state.countryFilter !== 'all') {
        list = list.filter(function (a) {
          return a.country === self.state.countryFilter;
        });
      }

      if (self.state.search) {
        var q = self.state.search.toLowerCase();
        list = list.filter(function (a) {
          return (a.name + ' ' + a.email + ' ' + a.phone + ' ' + (COUNTRY_INFO[a.country] ? COUNTRY_INFO[a.country].name : '')).toLowerCase().indexOf(q) !== -1;
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

    renderSubAdminsTable: function (opts) {
      opts = opts || {};
      var tbody = document.getElementById(opts.tbodyId || 'subAdminsTableBody');
      var paginationEl = document.getElementById(opts.paginationId || 'subAdminsPagination');
      var summaryEl = document.getElementById(opts.summaryId || 'subAdminsSummary');

      var result = this.getPaged();
      var totalPages = result.pages;
      if (this.state.page > totalPages) {
        this.state.page = totalPages;
        result = this.getPaged();
      }

      this.updateFilterTabCounts();

      if (summaryEl) {
        summaryEl.textContent = result.total + ' sub-admins';
      }

      if (!tbody) return;

      if (!result.rows.length) {
        tbody.innerHTML = '<tr><td colspan="' + (opts.colCount || 7) + '" style="text-align:center;padding:40px;color:var(--text-secondary)">No sub-admins found</td></tr>';
      } else {
        var html = '';
        var self = this;
        result.rows.forEach(function (a) {
          html += self._rowHtml(a);
        });
        tbody.innerHTML = html;
      }

      if (paginationEl) {
        paginationEl.innerHTML = this._paginationHtml(totalPages);
      }

      setTimeout(function() {
        if (window._subAdminRowObs) window._subAdminRowObs.disconnect();
        var rows = tbody.querySelectorAll('tr');
        rows.forEach(function(row, i) { row.classList.remove('visible'); row.style.animationDelay = (i * 0.06) + 's'; });
        window._subAdminRowObs = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); window._subAdminRowObs.unobserve(e.target); } });
        }, { threshold: 0.01, rootMargin: '200px' });
        rows.forEach(function(row) { window._subAdminRowObs.observe(row); });
      }, 20);
    },

    _rowHtml: function (a) {
      var statusClass = a.status === 'active' ? 'active' : 'inactive';
      var statusText = a.status.charAt(0).toUpperCase() + a.status.slice(1);
      var roleClass = 'role-badge ' + (a.role || 'sub-admin');
      var dashUrl = DASHBOARD_PAGES[a.country] || 'sub-admin-dashboard.html';
      return '' +
        '<tr>' +
        '<td><div style="display:flex;align-items:center;gap:10px"><div style="width:34px;height:34px;border-radius:50%;background:rgba(22,163,74,.12);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">' + esc(a.name ? a.name.charAt(0).toUpperCase() : '?') + '</div><div><div style="font-weight:600;color:var(--text)">' + esc(a.name) + '</div></div></div></td>' +
        '<td>' + esc(a.email) + '</td>' +
        '<td>' + esc(a.phone) + '</td>' +
        '<td>' + this._flagHtml(a.country) + '</td>' +
        '<td>' + esc(a.lastLogin || '—') + '</td>' +
        '<td><a class="btn btn-secondary" style="padding:6px 12px;font-size:12px;text-decoration:none;cursor:pointer" href="' + dashUrl + '" onclick="event.preventDefault();SubAdminManager.openSubAdminDashboard(\'' + a.id + '\')"><i class="fas fa-external-link-alt"></i> Dashboard</a></td>' +
        '<td><div style="display:flex;gap:6px;align-items:center">' +
          '<button class="action-btn view" title="View" onclick="event.stopPropagation();SubAdminManager.openSubAdminDetail(\'' + a.id + '\')"><i class="fas fa-eye"></i></button>' +
        '</div></td>' +
        '</tr>';
    },

    toggleMenu: function (id, btn) {
      var self = this;
      document.querySelectorAll('.sa-menu').forEach(function (m) {
        if (m.id !== 'saMenu-' + id) m.style.display = 'none';
      });
      var menu = document.getElementById('saMenu-' + id);
      if (!menu) return;
      if (menu.style.display === 'none') {
        var trigger = btn || document.getElementById('saDotBtn-' + id);
        var r = trigger ? trigger.getBoundingClientRect() : null;
        menu.style.display = 'block';
        var mh = menu.offsetHeight || 180;
        var mw = menu.offsetWidth || 200;
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

    openSubAdminDashboard: function (id) {
      var rec = null;
      for (var i = 0; i < this.allSubAdmins.length; i++) {
        if (this.allSubAdmins[i].id === id) { rec = this.allSubAdmins[i]; break; }
      }
      if (!rec) {
        for (var j = 0; j < this.allSubAdmins.length; j++) {
          if (this.allSubAdmins[j].country) { rec = this.allSubAdmins[j]; break; }
        }
      }
      if (!rec) return;
      var page = DASHBOARD_PAGES[rec.country] || 'sub-admin-dashboard.html';

      var preview = localStorage.getItem('vpnexuesPreviewAdmin');
      if (!preview) {
        localStorage.setItem('vpnexuesPreviewAdmin', JSON.stringify({
          auth: localStorage.getItem('vpnexuesAuth'),
          role: localStorage.getItem('vpnexuesRole'),
          email: localStorage.getItem('vpnexuesEmail'),
          name: localStorage.getItem('vpnexuesName')
        }));
      }
      localStorage.setItem('vpnexuesAuth', 'true');
      localStorage.setItem('vpnexuesRole', 'sub-admin');
      localStorage.setItem('vpnexuesEmail', rec.email);
      localStorage.setItem('vpnexuesName', rec.name);
      window.location.href = page;
    },

    closeAllMenus: function () {
      document.querySelectorAll('.sa-menu').forEach(function (m) {
        m.style.display = 'none';
      });
    },

    _paginationHtml: function (totalPages) {
      var page = this.state.page;
      var html = '';
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="SubAdminManager.goToPage(' + (page - 1) + ')"' + (page <= 1 ? ' disabled' : '') + '>Prev</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button class="btn ' + (i === page ? 'btn-primary' : 'btn-secondary') + '" style="padding:6px 12px;font-size:12px" onclick="SubAdminManager.goToPage(' + i + ')">' + i + '</button>';
      }
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="SubAdminManager.goToPage(' + (page + 1) + ')"' + (page >= totalPages ? ' disabled' : '') + '>Next</button>';
      return html;
    },

    updateFilterTabCounts: function () {
      var tabs = document.querySelectorAll('.subadmin-filter-tab');
      var all = this.state.subAdmins.length;
      var active = this.state.subAdmins.filter(function (a) { return a.status === 'active'; }).length;
      var inactive = this.state.subAdmins.filter(function (a) { return a.status === 'inactive'; }).length;
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
      document.querySelectorAll('.subadmin-filter-tab').forEach(function (tab) {
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

    setCountryFilter: function (val) {
      this.state.countryFilter = val;
      this.state.page = 1;
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
      this.state.countryFilter = 'all';
      this.state.sortBy = 'name';
      this.state.sortDir = 'asc';
      this.state.page = 1;
      var input = document.getElementById('subAdminSearchInput');
      if (input) input.value = '';
      var countrySelect = document.getElementById('subAdminCountryFilter');
      if (countrySelect) countrySelect.value = 'all';
      document.querySelectorAll('.subadmin-filter-tab').forEach(function (tab) {
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
      if (typeof window.renderCurrentSubAdmins === 'function') {
        window.renderCurrentSubAdmins();
      }
    },

    getSubAdmin: function (id) {
      return this.state.subAdmins.find(function (a) { return a.id === id; });
    },

    persist: function () {
      this.allSubAdmins = deepClone(this.state.subAdmins);
      save(this.state.subAdmins);
    },

    toggleStatus: function (id) {
      var a = this.getSubAdmin(id);
      if (a) {
        a.status = a.status === 'active' ? 'inactive' : 'active';
        this.persist();
        this.renderCurrent();
      }
    },

    deleteSubAdmin: function (id) {
      var a = this.getSubAdmin(id);
      if (!a) return;
      if (!confirm('Delete ' + a.name + '?')) return;
      if (typeof DeleteHistory !== 'undefined') DeleteHistory.log(a.name, 'Sub Admin', a.name, Object.assign({}, a));
      this.state.subAdmins = this.state.subAdmins.filter(function (x) { return x.id !== id; });
      this.persist();
      this.renderCurrent();
    },

    /* ---- Detail ---- */
    openSubAdminDetail: function (id) {
      var a = this.getSubAdmin(id);
      if (!a) return;
      var content = document.getElementById('subAdminDetailContent');
      var modal = document.getElementById('subAdminDetailModal');
      if (!content || !modal) return;
      var statusText = a.status.charAt(0).toUpperCase() + a.status.slice(1);
      var roleText = (a.role || 'sub-admin').replace('-', ' ');
      content.innerHTML =
        '<div style="display:flex;min-height:340px;overflow:hidden">' +
          '<div style="width:34%;background:#134B2F;padding:32px 22px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff">' +
            '<div style="width:76px;height:76px;border-radius:50%;background:#2E7D32;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;color:#fff">' + esc(a.name.charAt(0).toUpperCase()) + '</div>' +
            '<h3 style="margin:16px 0 6px;font-size:20px;font-weight:700;color:#fff">' + esc(a.name) + '</h3>' +
            '<span style="padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(255,255,255,.2);color:#fff">' + esc(roleText) + '</span>' +
          '</div>' +
          '<div style="flex:1;padding:24px 22px;background:#fff;color:#111">' +
            '<h4 style="margin:0 0 14px;font-size:17px;font-weight:700;color:#111">Sub Admin Information</h4>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
              this._detailRow('Full Name', a.name) +
              this._detailRow('Email', a.email) +
              this._detailRow('Phone', a.phone) +
              this._detailRow('Country', this.getCountryLabel(a.country)) +
              this._detailRow('Role', roleText) +
              this._detailRow('Status', statusText) +
              this._detailRow('Last Login', a.lastLogin || '—') +
              this._detailRow('Created Date', a.createdDate || '—') +
            '</div>' +
            '<h5 style="margin:20px 0 10px;font-size:14px;font-weight:700;color:#111">Assigned Modules</h5>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px">' + (a.modules && a.modules.length ? a.modules.map(function (m) { return '<span class="role-badge sub-admin">' + esc(m.charAt(0).toUpperCase() + m.slice(1)) + '</span>'; }).join('') : '<span style="font-size:13px;color:var(--text-secondary)">None</span>') + '</div>' +
            '<h5 style="margin:18px 0 10px;font-size:14px;font-weight:700;color:#111">Permissions</h5>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px">' + (a.permissions && a.permissions.length ? a.permissions.map(function (p) { return '<span class="role-badge viewer">' + esc(p.charAt(0).toUpperCase() + p.slice(1)) + '</span>'; }).join('') : '<span style="font-size:13px;color:var(--text-secondary)">None</span>') + '</div>' +
          '</div>' +
        '</div>';
      modal.style.display = 'flex';
    },

    _detailRow: function (label, value) {
      return '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:11px 13px">' +
        '<div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + esc(label) + '</div>' +
        '<div style="font-size:13px;font-weight:600;color:#111">' + esc(value) + '</div></div>';
    },

    closeSubAdminDetail: function () {
      var modal = document.getElementById('subAdminDetailModal');
      if (modal) modal.style.display = 'none';
    },

    /* ---- Edit ---- */
    editSubAdmin: function (id) {
      var a = this.getSubAdmin(id);
      if (!a) return;
      var modal = document.getElementById('subAdminEditModal');
      if (!modal) return;
      this.state.editingId = id;
      document.getElementById('editSubAdminId').value = a.id;
      document.getElementById('editSubAdminName').value = a.name;
      document.getElementById('editSubAdminEmail').value = a.email;
      document.getElementById('editSubAdminPhone').value = a.phone || '';
      document.getElementById('editSubAdminRole').value = a.role || 'sub-admin';
      document.getElementById('editSubAdminCountry').value = a.country || 'india';
      this.renderCheckboxes('editModuleCheckboxes', a.modules);
      this.renderCheckboxes('editPermissionCheckboxes', a.permissions);
      modal.style.display = 'flex';
    },

    closeSubAdminEdit: function () {
      var modal = document.getElementById('subAdminEditModal');
      if (modal) modal.style.display = 'none';
    },

    confirmSubAdminEdit: function () {
      var id = document.getElementById('editSubAdminId').value;
      var a = this.getSubAdmin(id);
      if (!a) return;
      a.name = document.getElementById('editSubAdminName').value || a.name;
      a.email = document.getElementById('editSubAdminEmail').value || a.email;
      a.phone = document.getElementById('editSubAdminPhone').value || a.phone;
      a.role = document.getElementById('editSubAdminRole').value || a.role;
      a.country = document.getElementById('editSubAdminCountry').value || a.country;
      a.modules = this.readCheckboxes('editModuleCheckboxes');
      a.permissions = this.readCheckboxes('editPermissionCheckboxes');
      this.persist();
      this.closeSubAdminEdit();
      this.renderCurrent();
    },

    /* ---- Add ---- */
    addSubAdmin: function () {
      var modal = document.getElementById('subAdminAddModal');
      if (!modal) return;
      this.renderCheckboxes('addModuleCheckboxes', ['dashboard', 'orders']);
      this.renderCheckboxes('addPermissionCheckboxes', ['view']);
      modal.style.display = 'flex';
    },

    closeSubAdminAdd: function () {
      var modal = document.getElementById('subAdminAddModal');
      if (modal) modal.style.display = 'none';
    },

    confirmSubAdminAdd: function () {
      var name = (document.getElementById('addSubAdminName').value || '').trim();
      var email = (document.getElementById('addSubAdminEmail').value || '').trim();
      if (!name || !email) {
        alert('Full Name and Email are required.');
        return;
      }
      var country = document.getElementById('addSubAdminCountry').value || 'india';
      var subAdmin = {
        id: 'SA-' + country.toUpperCase() + '-' + String(Date.now()).slice(-4),
        name: name,
        email: email,
        phone: document.getElementById('addSubAdminPhone').value || '—',
        password: document.getElementById('addSubAdminPassword').value || 'admin123',
        country: country,
        role: document.getElementById('addSubAdminRole').value || 'sub-admin',
        modules: this.readCheckboxes('addModuleCheckboxes'),
        permissions: this.readCheckboxes('addPermissionCheckboxes'),
        status: 'active',
        lastLogin: 'Never',
        createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      this.state.subAdmins.push(subAdmin);
      this.persist();
      this.closeSubAdminAdd();
      this.renderCurrent();
    },

    renderCheckboxes: function (containerId, selected) {
      var container = document.getElementById(containerId);
      if (!container) return;
      selected = selected || [];
      var list = containerId.indexOf('Module') !== -1 ? MODULES : PERMISSIONS;
      container.innerHTML = list.map(function (item) {
        var checked = selected.indexOf(item.key) !== -1 ? ' checked' : '';
        return '<label style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid var(--border);border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;background:#fff">' +
          '<input type="checkbox" value="' + item.key + '"' + checked + ' style="accent-color:var(--accent)"> ' + item.label + '</label>';
      }).join('');
    },

    readCheckboxes: function (containerId) {
      var container = document.getElementById(containerId);
      if (!container) return [];
      var out = [];
      container.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
        out.push(cb.value);
      });
      return out;
    },

    /* ---- Reset Password ---- */
    resetPassword: function (id) {
      var a = this.getSubAdmin(id);
      if (!a) return;
      var modal = document.getElementById('subAdminResetModal');
      if (!modal) return;
      document.getElementById('resetAdminId').value = a.id;
      document.getElementById('resetAdminName').textContent = a.name;
      document.getElementById('resetAdminEmail').textContent = a.email;
      modal.style.display = 'flex';
    },

    closeSubAdminReset: function () {
      var modal = document.getElementById('subAdminResetModal');
      if (modal) modal.style.display = 'none';
    },

    confirmSubAdminReset: function () {
      var id = document.getElementById('resetAdminId').value;
      var a = this.getSubAdmin(id);
      if (!a) return;
      a.password = document.getElementById('resetNewPassword').value || 'admin123';
      this.persist();
      this.closeSubAdminReset();
      this.renderCurrent();
    },

    /* ---- Export ---- */
    exportCSV: function () {
      var rows = this.state.subAdmins.map(function (a) {
        return [a.name, a.email, a.phone, COUNTRY_INFO[a.country] ? COUNTRY_INFO[a.country].name : a.country, a.role, a.status, a.lastLogin].join(',');
      });
      var csv = 'Sub Admin,Email,Phone,Country,Role,Status,Last Login\n' + rows.join('\n');
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var aEl = document.createElement('a');
      aEl.href = url;
      aEl.download = 'sub-admins.csv';
      document.body.appendChild(aEl);
      aEl.click();
      document.body.removeChild(aEl);
      URL.revokeObjectURL(url);
    },

    /* ---- Print ---- */
    printSubAdmins: function () {
      var html = '<html><head><title>Sub Admins</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left}th{background:#f8fafc}</style></head><body>';
      html += '<h2>Sub Admin List</h2><table><thead><tr><th>Sub Admin</th><th>Email</th><th>Phone</th><th>Country</th><th>Role</th><th>Status</th><th>Last Login</th></tr></thead><tbody>';
      this.state.subAdmins.forEach(function (a) {
        html += '<tr><td>' + esc(a.name) + '</td><td>' + esc(a.email) + '</td><td>' + esc(a.phone) + '</td><td>' + esc(COUNTRY_INFO[a.country] ? COUNTRY_INFO[a.country].name : a.country) + '</td><td>' + esc(a.role) + '</td><td>' + esc(a.status) + '</td><td>' + esc(a.lastLogin) + '</td></tr>';
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

  window.SubAdminManager = SubAdminManager;

  document.addEventListener('click', function () {
    if (typeof SubAdminManager.closeAllMenus === 'function') SubAdminManager.closeAllMenus();
  });
})();