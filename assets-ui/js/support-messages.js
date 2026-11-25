/* VPNexues SupportManager
 * Support message management for super admin and sub admin dashboards.
 * Persists to localStorage under 'vpnexues_messages'.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'vpnexues_messages';
  var STORAGE_VERSION = 3;

  /* In-memory fallback so the support view still renders demo messages when
   * localStorage is empty or unavailable (e.g. pages opened via file://). */
  var _seedData = null;

  function deepClone(arr) {
    return JSON.parse(JSON.stringify(arr || []));
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.__v === STORAGE_VERSION && Array.isArray(parsed.data)) return parsed.data;
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return _seedData ? deepClone(_seedData) : [];
  }

  function save(arr) {
    try {
      var wrapper = { data: deepClone(arr), __v: STORAGE_VERSION };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
    } catch (e) {}
  }

  function simpleHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h).toString(16).slice(0, 8);
  }

  function deriveCategory(subject, message) {
    var s = (subject + ' ' + message).toLowerCase();
    if (s.indexOf('refund') !== -1 || s.indexOf('damaged') !== -1 || s.indexOf('return') !== -1) return 'Order Issue';
    if (s.indexOf('deliver') !== -1 || s.indexOf('shipping') !== -1 || s.indexOf('address') !== -1) return 'Delivery';
    if (s.indexOf('track') !== -1 || s.indexOf('status') !== -1) return 'Product Query';
    if (s.indexOf('payment') !== -1 || s.indexOf('charge') !== -1 || s.indexOf('bill') !== -1) return 'Payment';
    return 'General';
  }

  function genPhone(country) {
    var phones = {
      India: '+91 98' + Math.floor(10000000 + Math.random() * 89999999),
      UAE: '+971 50 ' + Math.floor(100 + Math.random() * 899) + ' ' + Math.floor(1000 + Math.random() * 8999),
      US: '+1 (' + Math.floor(200 + Math.random() * 799) + ') ' + Math.floor(200 + Math.random() * 799) + '-' + Math.floor(1000 + Math.random() * 8999),
      Singapore: '+65 ' + Math.floor(80000000 + Math.random() * 19999999)
    };
    return phones[country] || '+1 555-0' + Math.floor(1000 + Math.random() * 8999);
  }

  function ensureSeed() {
    if (load().length) return;
    if (typeof window.DashboardAPI === 'object' && window.DashboardAPI && window.DashboardAPI.FX) {
      var countries = window.DashboardAPI.COUNTRIES;
      var code = window.DashboardAPI.COUNTRY_CODE;
      var names = {
        India: ['Rahul Sharma', 'Priya Patel', 'Ravi Kumar', 'Ananya Singh'],
        UAE: ['Ahmed Al-Rashid', 'Fatima Al Mansoori', 'Omar Hassan', 'Layla Khalid'],
        US: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis'],
        Singapore: ['Wei Lin Tan', 'Kavita Menon', 'Marcus Lee', 'Priya Nair']
      };
      var subjects = [
        'Delivery delayed for my last order',
        'Requesting refund for damaged item',
        'Question about order tracking',
        'Change delivery address for order'
      ];
      var messages = [
        'My order was expected yesterday but I have not received any update. Please check the status.',
        'The items arrived damaged. I would like a refund or replacement as soon as possible.',
        'Can you share the live tracking details for my order? The link in my email is not working.',
        'I need to change the delivery address for my latest order before it ships out.'
      ];
      var priorityPool = ['high', 'medium', 'low'];
      var statusPool = ['open', 'open', 'in-progress', 'resolved', 'waiting', 'closed'];
      var adminPool = ['Admin', 'Support Lead', 'Agent Alpha', 'Agent Beta'];
      var now = Date.now();
      var all = [];
      countries.forEach(function (country) {
        var cc = code[country];
        var local = names[country];
        for (var i = 0; i < local.length; i++) {
          var seq = 100 + i * 2;
          var days = 1 + (i * 4) % 13;
          var d = new Date();
          d.setDate(d.getDate() - days);
          var name = local[i];
          var email = name.toLowerCase().replace(/[^a-z ]/g, '').replace(/ +/g, '.') + '@email.com';
          var curStatus = statusPool[i % statusPool.length];
          var created = d.toISOString();
          var lastResp = null;
          var resTime = null;
          var replies = [];
          if (curStatus === 'resolved' || curStatus === 'closed') {
            var resolveDate = new Date(d.getTime() + (1 + (i * 3) % 5) * 86400000);
            resTime = Math.round((resolveDate.getTime() - d.getTime()) / 3600000) + 'h';
            lastResp = resolveDate.toISOString();
            replies.push({ from: 'Admin', body: 'Your issue has been resolved. Let us know if you need anything else.', date: resolveDate.toISOString() });
          } else if (curStatus === 'in-progress' || curStatus === 'waiting') {
            var respDate = new Date(d.getTime() + ((i + 1) * 12) * 3600000);
            lastResp = respDate.toISOString();
            replies.push({ from: 'Admin', body: 'We are looking into this and will update you shortly.', date: respDate.toISOString() });
          }
          var attachs = [];
          if (i % 3 === 0) {
            attachs.push({ name: 'screenshot.png', size: '245 KB', type: 'image/png' });
          }
          all.push({
            id: 'SUP-' + cc + '-' + seq,
            from: name,
            email: email,
            subject: subjects[i % subjects.length],
            message: messages[i % messages.length],
            date: created,
            country: country,
            priority: priorityPool[(i * 2 + 1) % priorityPool.length],
            status: curStatus,
            replies: replies,
            category: deriveCategory(subjects[i % subjects.length], messages[i % messages.length]),
            assignedTo: adminPool[i % adminPool.length],
            resolutionTime: resTime,
            lastResponse: lastResp,
            customerId: 'CID-' + simpleHash(email),
            customerPhone: genPhone(country),
            attachments: attachs
          });
        }
      });
      save(all);
      _seedData = deepClone(all);
    }
  }

  function statusColor(status) {
    var map = { open: '#065F46', 'new': '#065F46', 'in-progress': '#15803D', waiting: '#166534', resolved: '#22C55E', replied: '#15803D', closed: '#64748B' };
    return map[status] || '#64748B';
  }

  function statusPill(status) {
    var c = statusColor(status);
    return '<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;color:' + c + ';background:' + c + '1A">' + statusLabel(status) + '</span>';
  }

  function statusLabel(status) {
    return (status || '').charAt(0).toUpperCase() + (status || '').slice(1);
  }

  function priorityPill(p) {
    var map = { high: '#065F46', medium: '#15803D', low: '#64748B' };
    var c = map[p] || '#64748B';
    return '<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;color:' + c + ';background:' + c + '1A">' + statusLabel(p) + '</span>';
  }

  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return iso; }
  }

  var SupportManager = {
    allMessages: [],
    state: {
      messages: [],
      search: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      sortBy: 'date',
      sortDir: 'desc',
      page: 1,
      perPage: 10,
      country: null
    },

    init: function () {
      ensureSeed();
      this.allMessages = load();
      this.autoDeleteOld();
      this.state.messages = deepClone(this.allMessages);
      this.injectDrawerCSS();
    },

    autoDeleteOld: function () {
      var now = Date.now();
      var fifteenDays = 15 * 24 * 60 * 60 * 1000;
      this.allMessages = this.allMessages.filter(function (m) {
        var msgDate = new Date(m.date).getTime();
        return (now - msgDate) < fifteenDays;
      });
      this.state.messages = deepClone(this.allMessages);
      this.persist();
    },

    injectDrawerCSS: function () {
      if (document.getElementById('sd-style')) return;
      var css =
        '.sd-overlay{position:fixed;inset:0;background:rgba(8,30,16,.55);z-index:12000;opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s ease}' +
        '.sd-overlay.open{opacity:1;visibility:visible}' +
        '.sd-drawer{position:fixed;top:0;right:0;height:100%;width:520px;max-width:100vw;background:linear-gradient(135deg,#14472F,#0d3018);color:#fff;z-index:12001;box-shadow:-8px 0 30px rgba(8,30,16,.55);transform:translateX(105%);transition:transform .3s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column}' +
        '.sd-drawer.open{transform:translateX(0)}' +
        '@media(max-width:640px){.sd-drawer{width:100vw}}' +
        '.sd-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);flex-shrink:0}' +
        '.sd-head h2{margin:0;font-size:17px;font-weight:800;display:flex;align-items:center;gap:10px}' +
        '.sd-x{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:16px;flex-shrink:0}' +
        '.sd-x:hover{background:rgba(255,255,255,.16)}' +
        '.sd-scroll{flex:1;overflow-y:auto;padding:18px 20px}' +
        '.sd-scroll::-webkit-scrollbar{width:5px}' +
        '.sd-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:8px}' +
        '.sd-foot{padding:14px 20px;border-top:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0}' +
        '.sd-btn{padding:8px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:13px;font-weight:500;font-family:inherit;display:inline-flex;align-items:center;gap:6px}' +
        '.sd-btn:hover{border-color:#F2B233;color:#F2B233}' +
        '.sd-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
        '.sd-detail-item{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:8px 10px}' +
        '.sd-detail-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.3px}' +
        '.sd-detail-val{font-size:13px;font-weight:600;color:#fff;margin-top:2px}' +
        '.sd-conv{max-height:300px;overflow-y:auto;padding:12px;background:rgba(255,255,255,.04);border-radius:8px;margin:10px 0;border:1px solid rgba(255,255,255,.10)}' +
        '.sd-msg-bubble{padding:10px 14px;border-radius:10px;margin-bottom:8px;font-size:13px;max-width:85%}' +
        '.sd-msg-incoming{background:rgba(34,197,94,.15);color:#fff;margin-right:auto;border:1px solid rgba(34,197,94,.25)}' +
        '.sd-msg-outgoing{background:#065f46;color:#fff;margin-left:auto}' +
        '.sd-msg-meta{font-size:10px;color:rgba(255,255,255,.6);margin-top:4px}' +
        '.sd-assign-row{display:flex;gap:8px;align-items:center;margin-top:8px}' +
        '.sd-status-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}' +
        '.sd-status-btn{padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}' +
        '.sd-status-btn.active{background:#065f46;color:#fff;border-color:#065f46}' +
        '.sd-status-btn:hover{border-color:#065f46}' +
        '.sd-section{margin-bottom:18px}' +
        '.sd-section-title{font-size:11px;font-weight:700;color:#F2B233;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;display:flex;align-items:center;gap:6px}' +
        '.sd-attach-item{display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:8px;margin-bottom:6px}' +
        '.sd-attach-icon{width:32px;height:32px;border-radius:6px;background:rgba(242,178,51,.15);display:flex;align-items:center;justify-content:center;color:#F2B233;font-size:14px}' +
        '.sd-attach-info{flex:1}' +
        '.sd-attach-name{font-size:12px;font-weight:600;color:#fff}' +
        '.sd-attach-size{font-size:10px;color:rgba(255,255,255,.6)}' +
        '.sd-admin-form{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-top:12px}' +
        '.sd-admin-form label{display:block;font-size:11px;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:4px;text-transform:uppercase;letter-spacing:.3px}' +
        '.sd-admin-form select,.sd-admin-form textarea{width:100%;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.08);color:#fff;font-size:13px;font-family:inherit;resize:vertical}' +
        '.sd-admin-form textarea{min-height:80px}' +
        '.sd-admin-form select option{background:#1a3a2a;color:#fff}' +
        '.sd-send-btn{margin-top:8px;padding:8px 18px;border-radius:8px;border:none;background:#F2B233;color:#1a1a1a;font-size:13px;font-weight:700;cursor:pointer;transition:background .2s}' +
        '.sd-send-btn:hover{background:#e0a820}';
      var s = document.createElement('style');
      s.id = 'sd-style';
      s.textContent = css;
      document.head.appendChild(s);
    },

    _filtered: function () {
      var self = this;
      var list = self.state.messages.slice();
      if (self.state.country) {
        list = list.filter(function (m) { return m.country === self.state.country; });
      }
      if (self.state.statusFilter !== 'all') {
        var sf = self.state.statusFilter;
        list = list.filter(function (m) {
          if (sf === 'new') return m.status === 'open';
          if (sf === 'replied') return m.status === 'in-progress' || m.status === 'waiting' || m.status === 'resolved';
          return m.status === sf;
        });
      }
      if (self.state.priorityFilter !== 'all') {
        list = list.filter(function (m) { return m.priority === self.state.priorityFilter; });
      }
      if (self.state.search) {
        var q = self.state.search.toLowerCase();
        list = list.filter(function (m) {
          return (m.from + ' ' + m.email + ' ' + m.subject + ' ' + m.message).toLowerCase().indexOf(q) !== -1;
        });
      }
      var key = self.state.sortBy === 'name' ? 'from' : self.state.sortBy;
      var dir = self.state.sortDir === 'asc' ? 1 : -1;
      list.sort(function (a, b) {
        var av = a[key], bv = b[key];
        if (key === 'date') {
          return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
        }
        if (typeof av === 'string') { av = av.toLowerCase(); bv = String(bv).toLowerCase(); }
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
      return list;
    },

    getMessages: function (country) {
      if (!country) return this.state.messages.slice();
      return this.state.messages.filter(function (m) { return m.country === country; });
    },

    renderMessagesTable: function (opts) {
      opts = opts || {};
      this.init();
      this.state.country = opts.country || null;
      var tbody = document.getElementById(opts.tbodyId || 'supportTableBody');
      var paginationEl = document.getElementById(opts.paginationId || 'supportPagination');
      var summaryEl = document.getElementById(opts.summaryId || 'supportSummary');
      var showCountry = !opts.country;

      this.updateFilterTabCounts();

      var filtered = this._filtered();
      var totalPages = Math.max(1, Math.ceil(filtered.length / this.state.perPage));
      if (this.state.page > totalPages) this.state.page = totalPages;
      var start = (this.state.page - 1) * this.state.perPage;
      var rows = filtered.slice(start, start + this.state.perPage);

      if (summaryEl) {
        var end = Math.min(start + rows.length, filtered.length);
        summaryEl.textContent = filtered.length ? ('Showing ' + (start + 1) + '-' + end + ' of ' + filtered.length + ' messages') : 'No messages found';
      }

      if (!tbody) return;

      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="' + (opts.colCount || (showCountry ? 11 : 10)) + '" style="text-align:center;padding:40px;color:var(--text-secondary)">No messages found</td></tr>';
      } else {
        var self = this;
        tbody.innerHTML = rows.map(function (m) { return self._rowHtml(m, showCountry); }).join('');
        var supRows = tbody.querySelectorAll('tr');
        supRows.forEach(function(row, i) { row.classList.remove('visible'); row.style.animationDelay = (i * 0.06) + 's'; });
        if (window._supObserver) window._supObserver.disconnect();
        window._supObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); window._supObserver.unobserve(e.target); } });
        }, { threshold: 0.01, rootMargin: '200px' });
        supRows.forEach(function(row) { window._supObserver.observe(row); });
      }

      if (paginationEl) {
        paginationEl.innerHTML = this._paginationHtml(totalPages);
      }

      this._lastOpts = opts;
    },

    _rowHtml: function (m, showCountry) {
      var actions =
        '<div style="display:flex;gap:6px;align-items:center">' +
          '<button class="action-btn view" title="View" onclick="SupportManager.openMessageDetail(\'' + m.id + '\')"><i class="fas fa-eye"></i></button>' +
          '<button class="action-btn" title="Reply" onclick="SupportManager.replyTo(\'' + m.id + '\')"><i class="fas fa-reply"></i></button>' +
          '<button class="action-btn delete" title="Delete" onclick="SupportManager.deleteMessage(\'' + m.id + '\')"><i class="fas fa-trash-alt"></i></button>' +
        '</div>';
      var catMap = { 'Order Issue': '#15803D', 'Product Query': '#065F46', Payment: '#166534', Delivery: '#22C55E', General: '#64748B' };
      var catBadge = '<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;color:' + (catMap[m.category] || '#64748B') + ';background:' + (catMap[m.category] || '#64748B') + '1A">' + (m.category || 'General') + '</span>';
      var lastRespCell = m.lastResponse ? '<td><span style="font-size:12px;color:var(--text-secondary)">' + fmtDate(m.lastResponse) + '</span></td>' : '<td><span style="font-size:12px;color:var(--text-secondary)">-</span></td>';

      var cols;
      if (showCountry) {
        cols =
          '<td><span style="font-size:12px;font-weight:600;color:var(--text)">' + m.id + '</span></td>' +
          '<td><div style="font-weight:600;color:var(--text)">' + m.subject + '</div></td>' +
          '<td><div style="font-weight:600;color:var(--text)">' + m.from + '</div><div style="font-size:11px;color:var(--text-secondary)">' + m.email + '</div></td>' +
          '<td>' + catBadge + '</td>' +
          '<td><span style="font-weight:600;color:var(--text)">' + m.country + '</span></td>' +
          '<td>' + statusPill(m.status) + '</td>' +
          '<td><span style="font-size:12px;color:var(--text-secondary)">' + (m.assignedTo || 'Admin') + '</span></td>' +
          '<td><span style="font-size:12px;color:var(--text-secondary)">' + fmtDate(m.date) + '</span></td>' +
          '<td>' + actions + '</td>';
      } else {
        cols =
          '<td><span style="font-size:12px;font-weight:600;color:var(--text)">' + m.id + '</span></td>' +
          '<td><div style="font-weight:600;color:var(--text)">' + m.subject + '</div></td>' +
          '<td><div style="font-weight:600;color:var(--text)">' + m.from + '</div><div style="font-size:11px;color:var(--text-secondary)">' + m.email + '</div></td>' +
          '<td>' + catBadge + '</td>' +
          '<td>' + statusPill(m.status) + '</td>' +
          '<td><span style="font-size:12px;color:var(--text-secondary)">' + (m.assignedTo || 'Admin') + '</span></td>' +
          '<td><span style="font-size:12px;color:var(--text-secondary)">' + fmtDate(m.date) + '</span></td>' +
          '<td>' + actions + '</td>';
      }
      return '<tr>' + cols + '</tr>';
    },

    _paginationHtml: function (totalPages) {
      var page = this.state.page;
      var html = '';
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="SupportManager.goToPage(' + (page - 1) + ')"' + (page <= 1 ? ' disabled' : '') + '>Prev</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button class="btn ' + (i === page ? 'btn-primary' : 'btn-secondary') + '" style="padding:6px 12px;font-size:12px" onclick="SupportManager.goToPage(' + i + ')">' + i + '</button>';
      }
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="SupportManager.goToPage(' + (page + 1) + ')"' + (page >= totalPages ? ' disabled' : '') + '>Next</button>';
      return html;
    },

    updateFilterTabCounts: function () {
      var self = this;
      var tabs = document.querySelectorAll('.support-filter-tab');
      if (!tabs.length) return;
      var list = this.state.country ? this.getMessages(this.state.country) : this.state.messages;
      var counts = { all: list.length, new: 0, replied: 0, closed: 0 };
      list.forEach(function (m) {
        if (m.status === 'open') counts.new++;
        else if (m.status === 'in-progress' || m.status === 'waiting' || m.status === 'resolved') counts.replied++;
        else if (m.status === 'closed') counts.closed++;
      });
      tabs.forEach(function (tab) {
        var status = tab.getAttribute('data-status');
        var span = tab.querySelector('.tab-count');
        if (span) span.textContent = counts[status] !== undefined ? counts[status] : 0;
      });
    },

    goToPage: function (p) {
      var totalPages = Math.max(1, Math.ceil(this._filtered().length / this.state.perPage));
      if (p < 1) p = 1;
      if (p > totalPages) p = totalPages;
      this.state.page = p;
      this.renderCurrent();
    },

    setStatusFilter: function (status) {
      this.state.statusFilter = status;
      this.state.page = 1;
      document.querySelectorAll('.support-filter-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-status') === status);
      });
      this.renderCurrent();
    },

    setSearch: function (q) {
      this.state.search = (q || '').trim();
      this.state.page = 1;
      this.renderCurrent();
    },

    setPriorityFilter: function (p) {
      this.state.priorityFilter = p || 'all';
      this.state.page = 1;
      this.renderCurrent();
    },

    setSortBy: function (key) {
      var mapped = key === 'name' ? 'from' : key;
      if (this.state.sortBy === mapped) {
        this.state.sortDir = this.state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.state.sortBy = mapped;
        this.state.sortDir = 'desc';
      }
      this.renderCurrent();
    },

    resetFilters: function () {
      this.state.search = '';
      this.state.statusFilter = 'all';
      this.state.priorityFilter = 'all';
      this.state.sortBy = 'date';
      this.state.sortDir = 'desc';
      this.state.page = 1;
      var input = document.getElementById('supportSearchInput');
      if (input) input.value = '';
      var prio = document.getElementById('supportPriorityFilter');
      if (prio) prio.value = 'all';
      document.querySelectorAll('.support-filter-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-status') === 'all');
      });
      this.renderCurrent();
    },

    getMessage: function (id) {
      return this.state.messages.find(function (m) { return m.id === id; });
    },

    persist: function () {
      this.allMessages = deepClone(this.state.messages);
      save(this.state.messages);
      if (typeof window.dispatchEvent === 'function') {
        try { window.dispatchEvent(new Event('vpnexues-data-updated')); } catch (e) {}
      }
    },

    renderCurrent: function () {
      if (typeof window.renderCurrentSupport === 'function') {
        window.renderCurrentSupport();
      } else if (this._lastOpts) {
        this.renderMessagesTable(this._lastOpts);
      }
    },

    /* ---- Detail ---- */
    openMessageDetail: function (id) {
      var m = this.getMessage(id);
      if (!m) return;
      this.injectDrawerCSS();
      var content = document.getElementById('supportDetailContent');
      var drawer = document.getElementById('supportDetailModal');
      var overlay = document.getElementById('supportOverlay');
      if (!content || !drawer) return;

      var detailItem = function (label, value) {
        return '<div class="sd-detail-item">' +
          '<div class="sd-detail-label">' + label + '</div>' +
          '<div class="sd-detail-val">' + value + '</div></div>';
      };

      var catMap = { 'Order Issue': '#15803D', 'Product Query': '#065F46', Payment: '#166534', Delivery: '#22C55E', General: '#64748B' };
      var catBadge = '<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;color:' + (catMap[m.category] || '#64748B') + ';background:' + (catMap[m.category] || '#64748B') + '1A">' + (m.category || 'General') + '</span>';
      var statusBadge = statusPill(m.status);
      var priorityBadge = priorityPill(m.priority);
      var lastRespVal = m.lastResponse ? fmtDate(m.lastResponse) : '<span style="color:rgba(255,255,255,.45)">No response yet</span>';
      var resTimeVal = m.resolutionTime ? m.resolutionTime : '<span style="color:rgba(255,255,255,.45)">Pending</span>';

      var initialMsg = '<div class="sd-msg-bubble sd-msg-incoming">' +
        '<div>' + m.message + '</div>' +
        '<div class="sd-msg-meta">' + m.from + ' &middot; ' + fmtDate(m.date) + '</div></div>';

      var repliesHtml = '';
      if (m.replies && m.replies.length) {
        repliesHtml = m.replies.map(function (r) {
          var isAdmin = r.from === 'Admin' || r.from === 'Support Lead' || r.from === 'Agent Alpha' || r.from === 'Agent Beta';
          var cls = isAdmin ? 'sd-msg-outgoing' : 'sd-msg-incoming';
          return '<div class="sd-msg-bubble ' + cls + '">' +
            '<div>' + r.body + '</div>' +
            '<div class="sd-msg-meta">' + r.from + ' &middot; ' + fmtDate(r.date) + '</div></div>';
        }).join('');
      }

      var attachHtml = '';
      if (m.attachments && m.attachments.length) {
        attachHtml = '<div class="sd-section">' +
          '<div class="sd-section-title"><i class="fas fa-paperclip"></i> Attachments</div>';
        m.attachments.forEach(function (a) {
          attachHtml += '<div class="sd-attach-item">' +
            '<div class="sd-attach-icon"><i class="fas fa-file"></i></div>' +
            '<div class="sd-attach-info"><div class="sd-attach-name">' + a.name + '</div><div class="sd-attach-size">' + a.size + '</div></div></div>';
        });
        attachHtml += '</div>';
      }

      var statusOptions = ['open', 'in-progress', 'waiting', 'resolved', 'closed'];
      var adminOptions = ['Admin', 'Support Lead', 'Agent Alpha', 'Agent Beta'];
      var priorityOptions = ['high', 'medium', 'low'];
      var statusSelect = '<select id="sd-admin-status" class="sd-admin-form-select" style="margin-top:4px">';
      statusOptions.forEach(function (s) {
        statusSelect += '<option value="' + s + '"' + (m.status === s ? ' selected' : '') + '>' + statusLabel(s) + '</option>';
      });
      statusSelect += '</select>';

      var assignSelect = '<select id="sd-admin-assign" class="sd-admin-form-select" style="margin-top:4px">';
      adminOptions.forEach(function (a) {
        assignSelect += '<option value="' + a + '"' + (m.assignedTo === a ? ' selected' : '') + '>' + a + '</option>';
      });
      assignSelect += '</select>';

      var prioSelect = '<select id="sd-admin-priority" class="sd-admin-form-select" style="margin-top:4px">';
      priorityOptions.forEach(function (p) {
        prioSelect += '<option value="' + p + '"' + (m.priority === p ? ' selected' : '') + '>' + statusLabel(p) + '</option>';
      });
      prioSelect += '</select>';

      content.innerHTML =
        '<div class="sd-section">' +
          '<div class="sd-section-title"><i class="fas fa-ticket-alt"></i> Ticket Details</div>' +
          '<div class="sd-detail-grid">' +
            detailItem('Ticket ID', m.id) +
            detailItem('Category', catBadge) +
            detailItem('Priority', priorityBadge) +
            detailItem('Status', statusBadge) +
            detailItem('Assigned To', m.assignedTo || 'Admin') +
            detailItem('Created', fmtDate(m.date)) +
            detailItem('Last Response', lastRespVal) +
            detailItem('Resolution Time', resTimeVal) +
          '</div>' +
        '</div>' +
        '<div class="sd-section">' +
          '<div class="sd-section-title"><i class="fas fa-user"></i> Customer Information</div>' +
          '<div class="sd-detail-grid">' +
            detailItem('Customer ID', m.customerId || 'N/A') +
            detailItem('Name', m.from) +
            detailItem('Email', m.email) +
            detailItem('Phone', m.customerPhone || 'N/A') +
          '</div>' +
        '</div>' +
        '<div class="sd-section">' +
          '<div class="sd-section-title"><i class="fas fa-envelope"></i> Original Message</div>' +
          '<div style="border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:14px;background:rgba(255,255,255,.06)">' +
            '<div style="font-size:14px;color:#fff;line-height:1.6">' + m.message + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="sd-section">' +
          '<div class="sd-section-title"><i class="fas fa-comments"></i> Conversation History</div>' +
          '<div class="sd-conv">' +
            initialMsg +
            repliesHtml +
            (!repliesHtml ? '<div style="font-size:13px;color:rgba(255,255,255,.5);text-align:center;padding:12px">No replies yet</div>' : '') +
          '</div>' +
        '</div>' +
        attachHtml +
        '<div class="sd-section">' +
          '<div class="sd-section-title"><i class="fas fa-cog"></i> Admin Response</div>' +
          '<div class="sd-admin-form">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
              '<div><label>Status</label>' + statusSelect + '</div>' +
              '<div><label>Assign To</label>' + assignSelect + '</div>' +
            '</div>' +
            '<div style="margin-bottom:10px"><label>Priority</label>' + prioSelect + '</div>' +
            '<div style="margin-bottom:10px"><label>Reply Message</label>' +
              '<textarea id="sd-admin-reply" placeholder="Type your reply here..." style="margin-top:4px"></textarea>' +
            '</div>' +
            '<button class="sd-send-btn" onclick="SupportManager.sendDetailReply(\'' + m.id + '\')"><i class="fas fa-paper-plane" style="margin-right:6px"></i>Send Reply & Update</button>' +
          '</div>' +
        '</div>';

      drawer.style.display = 'block';
      document.body.style.overflow = 'hidden';
      var sections = content.querySelectorAll('.sd-section');
      sections.forEach(function(sec, i) {
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(14px)';
        sec.style.animation = 'actSlideUp .35s ease forwards';
        sec.style.animationDelay = (i * 0.1) + 's';
      });
    },

    closeMessageDetail: function () {
      var drawer = document.getElementById('supportDetailModal');
      if (drawer) drawer.style.display = 'none';
      document.body.style.overflow = '';
    },

    /* ---- Reply ---- */
    replyTo: function (id) {
      var m = this.getMessage(id);
      if (!m) return;
      var modal = document.getElementById('supportReplyModal');
      if (!modal) return;
      var set = function (elId, val) {
        var el = document.getElementById(elId);
        if (el) el.textContent = val;
      };
      set('replyMessageId', m.id);
      set('replySubject', m.subject);
      set('replyTo', m.from + ' <' + m.email + '>');
      var body = document.getElementById('replyBody');
      if (body) body.value = '';
      modal.style.display = 'flex';
    },

    closeReplyModal: function () {
      var modal = document.getElementById('supportReplyModal');
      if (modal) modal.style.display = 'none';
    },

    sendReply: function () {
      var idEl = document.getElementById('replyMessageId');
      var bodyEl = document.getElementById('replyBody');
      if (!idEl || !bodyEl) return;
      var m = this.getMessage(idEl.textContent);
      if (!m) return;
      var body = (bodyEl.value || '').trim();
      if (!body) {
        if (typeof window.showToast === 'function') window.showToast('Please type a reply');
        return;
      }
      var from = localStorage.getItem('vpnexuesName') || 'Admin';
      m.replies = m.replies || [];
      m.replies.push({ from: from, body: body, date: new Date().toISOString() });
      m.status = 'in-progress';
      m.lastResponse = new Date().toISOString();
      this.persist();
      this.closeReplyModal();
      this.renderCurrent();
      if (typeof window.showToast === 'function') window.showToast('Reply sent to ' + m.from);
    },

    sendDetailReply: function (id) {
      var m = this.getMessage(id);
      if (!m) return;
      var statusEl = document.getElementById('sd-admin-status');
      var assignEl = document.getElementById('sd-admin-assign');
      var prioEl = document.getElementById('sd-admin-priority');
      var replyEl = document.getElementById('sd-admin-reply');
      var body = (replyEl ? replyEl.value : '').trim();
      if (!body) {
        if (typeof window.showToast === 'function') window.showToast('Please type a reply');
        return;
      }
      var from = localStorage.getItem('vpnexuesName') || 'Admin';
      m.replies = m.replies || [];
      m.replies.push({ from: from, body: body, date: new Date().toISOString() });
      m.status = statusEl ? statusEl.value : 'in-progress';
      m.assignedTo = assignEl ? assignEl.value : m.assignedTo;
      m.priority = prioEl ? prioEl.value : m.priority;
      m.lastResponse = new Date().toISOString();
      if (m.status === 'resolved' || m.status === 'closed') {
        var created = new Date(m.date).getTime();
        m.resolutionTime = Math.round((Date.now() - created) / 3600000) + 'h';
      }
      this.persist();
      this.closeMessageDetail();
      this.renderCurrent();
      if (typeof window.showToast === 'function') window.showToast('Reply sent and ticket updated for ' + m.from);
    },

    /* ---- Delete ---- */
    deleteMessage: function (id) {
      var m = this.getMessage(id);
      if (!m) return;
      if (!confirm('Delete message ' + id + '?')) return;
      if (typeof DeleteHistory !== 'undefined') DeleteHistory.log(m.subject || id, 'Support Message', m.from, Object.assign({}, m));
      this.state.messages = this.state.messages.filter(function (x) { return x.id !== id; });
      this.persist();
      this.renderCurrent();
    },

    /* ---- Export ---- */
    exportCSV: function (opts) {
      opts = opts || {};
      var list = opts.country ? this.getMessages(opts.country) : this.state.messages;
      var rows = list.map(function (m) {
        return [m.id, m.from, m.email, m.subject.replace(/,/g, ' '), m.message.replace(/,/g, ' ').replace(/\n/g, ' '), m.country, m.priority, m.status, m.category || 'General', m.assignedTo || 'Admin', fmtDate(m.date), m.lastResponse ? fmtDate(m.lastResponse) : '', m.resolutionTime || ''].join(',');
      });
      var csv = 'Ticket ID,From,Email,Subject,Message,Country,Priority,Status,Category,Assigned To,Date,Last Response,Resolution Time\n' + rows.join('\n');
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = opts.country ? ('support-' + opts.country.toLowerCase() + '.csv') : 'support-messages.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    printMessages: function (opts) {
      opts = opts || {};
      var list = opts.country ? this.getMessages(opts.country) : this.state.messages;
      var html = '<html><head><title>' + (opts.title || 'Support Messages') + '</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left}th{background:#f8fafc}</style></head><body>';
      html += '<h2>' + (opts.title || 'Support Messages Report') + '</h2><table><thead><tr><th>Ticket</th><th>From</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Country</th><th>Date</th><th>Last Response</th></tr></thead><tbody>';
      list.forEach(function (m) {
        html += '<tr><td>' + m.id + '</td><td>' + m.from + ' (' + m.email + ')</td><td>' + m.subject + '</td><td>' + (m.category || 'General') + '</td><td>' + statusLabel(m.priority) + '</td><td>' + statusLabel(m.status) + '</td><td>' + (m.assignedTo || 'Admin') + '</td><td>' + m.country + '</td><td>' + fmtDate(m.date) + '</td><td>' + (m.lastResponse ? fmtDate(m.lastResponse) : '-') + '</td></tr>';
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

  SupportManager.init();
  window.SupportManager = SupportManager;
})();