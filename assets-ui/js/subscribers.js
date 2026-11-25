/* VPNexues Subscribers
 * Subscriber list for sub admin dashboards (per country).
 * Shows only details of people who subscribed to VPNexues -
 * no plans, amounts or payment methods.
 * Persists to localStorage under 'vpnexues_subs_list_<country>'.
 */
(function () {
  'use strict';

  var state = {
    country: 'India',
    rootId: 'subRoot',
    data: [],
    search: '',
    statusFilter: 'all',
    page: 1,
    perPage: 10,
    activeSub: null
  };

  var COUNTRY_CODES = { India: '+91', UAE: '+971', US: '+1', Singapore: '+65' };
  var CC = { India: 'IN', UAE: 'AE', US: 'US', Singapore: 'SG' };

  function deepClone(arr) {
    return JSON.parse(JSON.stringify(arr || []));
  }

  function storeKey() {
    return 'vpnexues_subs_list_' + state.country;
  }

  function load() {
    try {
      var raw = localStorage.getItem(storeKey());
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length && parsed[0].subscribed) return parsed;
      }
    } catch (e) {}
    var seeded = seed();
    save(seeded);
    return seeded;
  }

  function save(arr) {
    try { localStorage.setItem(storeKey(), JSON.stringify(arr)); } catch (e) {}
  }

  function seed() {
    var names = {
      India: ['Rahul Sharma', 'Priya Patel', 'Ravi Kumar', 'Ananya Singh', 'Vikram Reddy', 'Sneha Iyer', 'Arjun Nair', 'Kavya Menon', 'Rohan Gupta', 'Meera Pillai', 'Aditya Rao', 'Divya Krishnan'],
      UAE: ['Ahmed Al-Rashid', 'Fatima Al Mansoori', 'Omar Hassan', 'Layla Khalid', 'Khalid Al Farsi', 'Noor Al Suwaidi', 'Yousef Habib', 'Aisha Al Marri', 'Zayed Al Nasser', 'Mariam Al Hashimi'],
      US: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Jessica Miller', 'James Taylor', 'Ashley Moore', 'Robert Thomas', 'Stephanie White'],
      Singapore: ['Wei Lin Tan', 'Kavita Menon', 'Marcus Lee', 'Priya Nair', 'Jun Wei Lim', 'Sarah Chua', 'Dinesh Kumar', 'Mei Ling Ng', 'Adrian Koh', 'Hui Min Teo']
    };
    var hosts = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    var sources = ['Website Footer', 'Home Page Popup', 'Checkout Page', 'Blog Newsletter'];
    var cc = COUNTRY_CODES[state.country] || '+91';
    var code = CC[state.country] || 'IN';
    var out = [];
    (names[state.country] || names.India).forEach(function (name, i) {
      var sub = new Date();
      sub.setDate(sub.getDate() - ((i * 13) % 240));
      out.push({
        id: 'SUB-' + code + '-' + (200 + i),
        name: name,
        email: name.toLowerCase().replace(/[^a-z ]/g, '').replace(/ +/g, '.') + '@' + hosts[i % hosts.length],
        phone: cc + ' 9' + (800000000 + i * 1373),
        country: state.country,
        source: sources[i % sources.length],
        subscribed: sub.toISOString(),
        status: i % 5 === 4 ? 'unsubscribed' : 'subscribed'
      });
    });
    return out;
  }

  function fmtDate(iso) {
    if (!iso) return '\u2014';
    var d = new Date(iso);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function statusPill(status) {
    var colors = { subscribed: '#16A34A', unsubscribed: '#DC2626' };
    var c = colors[status] || '#64748B';
    var label = status.charAt(0).toUpperCase() + status.slice(1);
    return '<span class="sb-pill" style="color:' + c + ';background:' + c + '14;border-color:' + c + '33">' + label + '</span>';
  }

  /* ---- Filtering ---- */
  function getFiltered() {
    var q = state.search.toLowerCase();
    return state.data.filter(function (s) {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false;
      if (q && (s.name + ' ' + s.email + ' ' + s.id + ' ' + s.phone).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function getPaged() {
    var list = getFiltered();
    var totalPages = Math.max(1, Math.ceil(list.length / state.perPage));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * state.perPage;
    return { rows: list.slice(start, start + state.perPage), total: list.length, totalPages: totalPages };
  }

  /* ---- Render ---- */
  function render() {
    var root = document.getElementById(state.rootId);
    if (!root) return;
    if (!document.getElementById('sb-style')) {
      var s = document.createElement('style');
      s.id = 'sb-style';
      s.textContent = styleHtml().replace(/<style[^>]*>/, '').replace(/<\/style>\s*$/, '');
      document.head.appendChild(s);
    }
    var list = getFiltered();
    var paged = getPaged();
    var html = '';
    html += pageHeaderHtml();
    html += kpiHtml(list);
    html += filterBarHtml();
    html += tableHtml(paged);
    root.innerHTML = html;
    ensureDrawer();
    if (state.activeSub) openDrawer(state.activeSub);
  }

  function styleHtml() {
    return '' +
      '<style id="sb-style">' +
      '#subRoot{font-family:inherit;color:#111827}' +
      '.sb-breadcrumb{font-size:12px;color:#6B7280;margin-bottom:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}' +
      '.sb-breadcrumb a{color:#065F46;text-decoration:none;font-weight:600}' +
      '.sb-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}' +
      '.sb-title-row h2{margin:0;font-size:22px;font-weight:800;color:#111827;display:flex;align-items:center;gap:10px}' +
      '.sb-country-badge{font-size:12px;font-weight:700;color:#065F46;background:#065F4614;border:1px solid #065F4626;padding:4px 12px;border-radius:20px}' +
      '.sb-subtitle{font-size:13px;color:#6B7280;margin-top:4px}' +
      '.sb-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:18px}' +
      '.sb-kpi{background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;box-shadow:0 1px 2px rgba(17,24,39,.04)}' +
      '.sb-kpi .sb-kpi-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}' +
      '.sb-kpi .sb-kpi-label{font-size:12px;font-weight:600;color:#6B7280}' +
      '.sb-kpi .sb-kpi-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px}' +
      '.sb-kpi .sb-kpi-value{font-size:22px;font-weight:800;color:#111827;line-height:1.1}' +
      '.sb-kpi .sb-kpi-sub{font-size:12px;color:#9CA3AF;margin-top:4px}' +
      '.sb-card{background:#fff;border:1px solid #E5E7EB;border-radius:14px;margin-bottom:18px;box-shadow:0 1px 2px rgba(17,24,39,.04);overflow:hidden}' +
      '.sb-card-header{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #F3F4F6}' +
      '.sb-field label{display:block;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}' +
      '.sb-field input,.sb-field select{width:100%;padding:8px 11px;border:1px solid #D1D5DB;border-radius:9px;font-size:13px;font-family:inherit;background:#fff;color:#111827;outline:none;transition:border-color .15s,box-shadow .15s}' +
      '.sb-field input:focus,.sb-field select:focus{border-color:#065F46;box-shadow:0 0 0 3px rgba(6,95,70,.12)}' +
      '.sb-btn{padding:8px 14px;border-radius:9px;border:1px solid #D1D5DB;background:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:7px;color:#374151;transition:all .15s;white-space:nowrap}' +
      '.sb-btn:hover{border-color:#065F46;color:#065F46}' +
      '.sb-table-wrap{overflow-x:auto}' +
      '.sb-table{width:100%;border-collapse:collapse;font-size:13px;min-width:600px}' +
      '.sb-table thead th{background:#166534;padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.5px;border-bottom:none;white-space:nowrap}' +
      '.sb-table tbody td{padding:12px 14px;border-bottom:1px solid #e8f5e9;color:#374151;vertical-align:middle;background:#f0fdf4}' +
      '.sb-table tbody tr:hover td{background:#dcfce7;cursor:pointer}' +
      '.sb-cust{display:flex;align-items:center;gap:10px}' +
      '.sb-avatar{width:36px;height:36px;border-radius:50%;background:#065F4612;color:#065F46;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}' +
      '.sb-cust .sb-cust-name{font-weight:700;color:#111827}' +
      '.sb-cust .sb-cust-mail{font-size:11px;color:#9CA3AF;margin-top:1px}' +
      '.sb-num{font-weight:700;color:#111827}' +
      '.sb-action{display:flex;gap:6px;align-items:center}' +
      '.sb-action-btn{width:32px;height:32px;border-radius:8px;border:1px solid #E5E7EB;background:#fff;color:#6B7280;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s}' +
      '.sb-action-btn:hover{border-color:#065F46;color:#065F46}' +
      '.sb-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:capitalize}' +
      '.sb-empty{padding:50px 20px;text-align:center;color:#9CA3AF;font-size:14px}' +
      '.sb-pager{display:flex;align-items:center;justify-content:center;gap:6px;padding:13px 18px;border-top:1px solid #F3F4F6;flex-wrap:wrap}' +
      '.sb-pager button{padding:6px 12px;font-size:12px;border-radius:8px;border:1px solid #E5E7EB;background:#fff;color:#374151;cursor:pointer;font-family:inherit;font-weight:600}' +
      '.sb-pager button.active{background:#065F46;border-color:#065F46;color:#fff}' +
      '.sb-pager button:disabled{opacity:.4;cursor:not-allowed}' +
      '.sb-summary{font-size:13px;color:#6B7280}' +
      '.sb-drawer-overlay{position:fixed;inset:0;background:rgba(8,30,16,.55);opacity:0;visibility:hidden;transition:opacity .25s;z-index:12000}' +
      '.sb-drawer-overlay.open{opacity:1;visibility:visible}' +
      '.sb-drawer{position:fixed;top:0;right:-520px;width:520px;max-width:100vw;height:100%;background:linear-gradient(135deg,#14472F,#0d3018);color:#fff;z-index:12001;box-shadow:-8px 0 30px rgba(8,30,16,.55);transition:right .3s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column}' +
      '.sb-drawer.open{right:0}' +
      '.sb-drawer-x{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:15px;z-index:5;transition:background .2s}' +
      '.sb-drawer-x:hover{background:rgba(255,255,255,.16)}' +
      '.sb-drawer-scroll{flex:1;overflow-y:auto;padding:18px}' +
      '.sb-drawer-scroll::-webkit-scrollbar{width:5px}' +
      '.sb-drawer-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:8px}' +
      '.sb-drawer-head{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:16px;margin-bottom:14px;padding-right:44px}' +
      '.sb-drawer-avatar{width:56px;height:56px;border-radius:50%;background:rgba(242,178,51,.18);color:#F2B233;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;flex-shrink:0}' +
      '.sb-drawer-name{font-size:17px;font-weight:800;color:#fff;display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
      '.sb-drawer-meta{font-size:12px;color:rgba(255,255,255,.65);margin-top:4px}' +
      '.sb-sec{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:16px;margin-bottom:14px}' +
      '.sb-sec-title{font-size:12px;font-weight:800;color:#F2B233;text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:8px;margin-bottom:12px}' +
      '.sb-info{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:13px}' +
      '.sb-info:last-child{border-bottom:none}' +
      '.sb-info-l{color:rgba(255,255,255,.65)}' +
      '.sb-info-r{font-weight:600;color:#fff;text-align:right}' +
      '.sb-info-r.gold{color:#F2B233}' +
      '.sb-drawer-foot{padding:14px 18px;border-top:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);display:flex;gap:8px;flex-wrap:wrap}' +
      '.sb-act{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;padding:9px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:all .2s}' +
      '.sb-act:hover{border-color:#F2B233;color:#F2B233}' +
      '.sb-act-danger{border-color:rgba(239,68,68,.5);color:#fca5a5}' +
      '.sb-act-danger:hover{background:rgba(239,68,68,.15);border-color:#ef4444;color:#fecaca}' +
      '@media(max-width:640px){.sb-kpis{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}.sb-drawer{right:-100vw;width:100vw}.sb-drawer.open{right:0}.sb-table thead{display:none}.sb-table{min-width:0}.sb-table,.sb-table tbody,.sb-table tr,.sb-table td{display:block;width:100%}.sb-table tbody tr{border:1px solid #E5E7EB;border-radius:12px;margin-bottom:10px;padding:8px 4px;background:#f0fdf4}.sb-table tbody tr:hover{background:#dcfce7}.sb-table tbody td{border:none;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:right;border-bottom:1px dashed #e8f5e9}.sb-table tbody td:last-child{border-bottom:none}.sb-table tbody td::before{content:attr(data-label);font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px}.sb-cust{justify-content:flex-end}}' +
      '</style>';
  }

  function pageHeaderHtml() {
    return '' +
      '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px 24px;margin-bottom:18px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
          '<div>' +
            '<h2 style="margin:0;font-size:22px;font-weight:800;color:#111827;display:flex;align-items:center;gap:10px"><i class="fas fa-user-check" style="color:#065F46"></i> Subscribers <span style="font-size:12px;font-weight:700;color:#065F46;background:#065F4614;border:1px solid #065F4626;padding:4px 12px;border-radius:20px">' + esc(state.country) + '</span></h2>' +
          '</div>' +
          '<div style="display:flex;gap:8px">' +
            '<button class="sb-btn" onclick="Subscribers.exportCSV()"><i class="fas fa-download"></i> Export CSV</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function kpiHtml(list) {
    var total = state.data.length;
    var active = state.data.filter(function (s) { return s.status === 'subscribed'; }).length;
    var unsub = state.data.filter(function (s) { return s.status === 'unsubscribed'; }).length;
    return '' +
      '<div class="sb-kpis">' +
        kpiCard('Total Subscribers', total, 'fa-users', 'rgba(6,95,70,.12)', '#065F46', 'Across ' + esc(state.country)) +
        kpiCard('Active Subscribers', active, 'fa-check-circle', 'rgba(22,163,74,.12)', '#16A34A', Math.round(total ? (active / total) * 100 : 0) + '% of total') +
        kpiCard('Unsubscribed', unsub, 'fa-user-minus', 'rgba(220,38,38,.12)', '#DC2626', 'Opted out of updates') +
      '</div>';
  }

  function kpiCard(label, value, icon, bg, color, sub) {
    return '<div class="sb-kpi">' +
      '<div class="sb-kpi-top"><span class="sb-kpi-label">' + label + '</span><span class="sb-kpi-icon" style="background:' + bg + ';color:' + color + '"><i class="fas ' + icon + '"></i></span></div>' +
      '<div class="sb-kpi-value">' + value + '</div>' +
      '<div class="sb-kpi-sub">' + sub + '</div>' +
    '</div>';
  }

  function filterBarHtml() {
    return '' +
      '<div class="sb-card" style="margin-bottom:16px">' +
        '<div style="padding:14px 18px;display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +
          '<div class="sb-field" style="flex:1;min-width:200px">' +
            '<label>Search</label>' +
            '<div style="position:relative"><i class="fas fa-search" style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#9CA3AF;font-size:12px"></i>' +
            '<input type="text" value="' + esc(state.search) + '" placeholder="Search by name, email, ID..." oninput="Subscribers.setSearch(this.value)" style="padding-left:34px"></div>' +
          '</div>' +
          '<div class="sb-field" style="min-width:150px">' +
            '<label>Status</label>' +
            '<select onchange="Subscribers.setStatus(this.value)">' +
              '<option value="all"' + (state.statusFilter === 'all' ? ' selected' : '') + '>All Status</option>' +
              '<option value="subscribed"' + (state.statusFilter === 'subscribed' ? ' selected' : '') + '>Subscribed</option>' +
              '<option value="unsubscribed"' + (state.statusFilter === 'unsubscribed' ? ' selected' : '') + '>Unsubscribed</option>' +
            '</select>' +
          '</div>' +
          '<div>' +
            '<button class="sb-btn" onclick="Subscribers.resetFilters()"><i class="fas fa-redo"></i> Reset</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function tableHtml(paged) {
    var rows = paged.rows;
    var body;
    if (!rows.length) {
      body = '<tr><td colspan="5" class="sb-empty">No subscribers found matching your filters</td></tr>';
    } else {
      body = rows.map(function (s) {
        return '<tr onclick="Subscribers.openDetail(\'' + s.id + '\')">' +
          '<td data-label="Customer ID" class="sb-num">' + esc(s.id) + '</td>' +
          '<td data-label="Name"><div class="sb-cust">' +
            '<div class="sb-avatar">' + esc(s.name.charAt(0)) + '</div>' +
            '<div class="sb-cust-name">' + esc(s.name) + '</div>' +
          '</div></td>' +
          '<td data-label="Email">' + esc(s.email) + '</td>' +
          '<td data-label="Phone Number" class="sb-num">' + esc(s.phone) + '</td>' +
          '<td data-label="Actions" class="sb-action"><button class="sb-action-btn" title="View details" onclick="event.stopPropagation();Subscribers.openDetail(\'' + s.id + '\')"><i class="fas fa-eye"></i></button></td>' +
        '</tr>';
      }).join('');
    }
    return '' +
      '<div class="sb-card">' +
        '<div class="sb-card-header">' +
          '<h3 style="margin:0;font-size:15px;font-weight:700;color:#111827"><i class="fas fa-list" style="color:#065F46;margin-right:7px"></i> Subscriber List</h3>' +
        '</div>' +
        '<div class="sb-table-wrap">' +
          '<table class="sb-table">' +
            '<thead><tr>' +
              '<th>Customer ID</th><th>Name</th><th>Email</th><th>Phone Number</th><th></th>' +
            '</tr></thead>' +
            '<tbody>' + body + '</tbody>' +
          '</table>' +
        '</div>' +
        pagerHtml(paged) +
      '</div>';
  }

  function pagerHtml(paged) {
    var btns = '';
    btns += '<button onclick="Subscribers.goPage(' + (state.page - 1) + ')" ' + (state.page <= 1 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i></button>';
    for (var i = 1; i <= paged.totalPages; i++) {
      btns += '<button class="' + (i === state.page ? 'active' : '') + '" onclick="Subscribers.goPage(' + i + ')">' + i + '</button>';
    }
    btns += '<button onclick="Subscribers.goPage(' + (state.page + 1) + ')" ' + (state.page >= paged.totalPages ? 'disabled' : '') + '><i class="fas fa-chevron-right"></i></button>';
    return '<div class="sb-pager">' + btns + '</div>';
  }

  /* ---- Drawer ---- */
  function drawerHtml() {
    return '' +
      '<div class="sb-drawer-overlay" id="sbOverlay" onclick="Subscribers.closeDetail()"></div>' +
      '<div class="sb-drawer" id="sbDrawer"><button class="sb-drawer-x" onclick="Subscribers.closeDetail()"><i class="fas fa-times"></i></button><div class="sb-drawer-scroll"></div><div class="sb-drawer-foot"></div></div>';
  }

  function ensureDrawer() {
    if (!document.getElementById('sbDrawer')) {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = drawerHtml();
      while (wrapper.firstChild) {
        document.body.appendChild(wrapper.firstChild);
      }
    }
  }

  function renderDrawer(s) {
    var body = document.getElementById('sbDrawer');
    if (!body) return;
    body.querySelector('.sb-drawer-scroll').innerHTML =
      '<div class="sb-drawer-head">' +
        '<div class="sb-drawer-avatar">' + esc(s.name.charAt(0)) + '</div>' +
        '<div style="min-width:0">' +
          '<div class="sb-drawer-name">' + esc(s.name) + ' ' + statusPill(s.status) + '</div>' +
          '<div class="sb-drawer-meta">' + esc(s.id) + ' · ' + esc(s.email) + '</div>' +
          '<div class="sb-drawer-meta"><i class="fas fa-phone" style="color:#F2B233"></i> ' + esc(s.phone) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sb-sec">' +
        '<div class="sb-sec-title"><i class="fas fa-user"></i> Subscriber Details</div>' +
        '<div class="sb-info"><span class="sb-info-l">Full Name</span><span class="sb-info-r">' + esc(s.name) + '</span></div>' +
        '<div class="sb-info"><span class="sb-info-l">Email</span><span class="sb-info-r">' + esc(s.email) + '</span></div>' +
        '<div class="sb-info"><span class="sb-info-l">Phone</span><span class="sb-info-r">' + esc(s.phone) + '</span></div>' +
        '<div class="sb-info"><span class="sb-info-l">Country</span><span class="sb-info-r">' + esc(s.country) + '</span></div>' +
        '<div class="sb-info"><span class="sb-info-l">Subscriber ID</span><span class="sb-info-r">' + esc(s.id) + '</span></div>' +
      '</div>' +
      '<div class="sb-sec">' +
        '<div class="sb-sec-title"><i class="fas fa-envelope-open-text"></i> Subscription Info</div>' +
        '<div class="sb-info"><span class="sb-info-l">Subscribed On</span><span class="sb-info-r">' + fmtDate(s.subscribed) + '</span></div>' +
        '<div class="sb-info"><span class="sb-info-l">Source</span><span class="sb-info-r gold">' + esc(s.source || 'Website') + '</span></div>' +
        '<div class="sb-info"><span class="sb-info-l">Status</span><span class="sb-info-r">' + statusPill(s.status) + '</span></div>' +
      '</div>';
    body.querySelector('.sb-drawer-foot').innerHTML =
      (s.status === 'subscribed'
        ? '<button class="sb-act sb-act-danger" onclick="Subscribers.toggleStatus(\'' + s.id + '\')"><i class="fas fa-user-minus"></i> Mark Unsubscribed</button>'
        : '<button class="sb-act" onclick="Subscribers.toggleStatus(\'' + s.id + '\')"><i class="fas fa-user-check"></i> Mark Subscribed</button>') +
      '<button class="sb-act" onclick="Subscribers.closeDetail()"><i class="fas fa-times"></i> Close</button>';
  }

  function openDetail(id) {
    var s = null;
    state.data.forEach(function (x) { if (x.id === id) s = x; });
    if (!s) return;
    state.activeSub = id;
    var overlay = document.getElementById('sbOverlay');
    var drawer = document.getElementById('sbDrawer');
    if (drawer) {
      renderDrawer(s);
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    if (overlay) overlay.classList.add('open');
  }

  function closeDetail() {
    var overlay = document.getElementById('sbOverlay');
    var drawer = document.getElementById('sbDrawer');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    state.activeSub = null;
    document.body.style.overflow = '';
  }

  function updateSub(id, patch) {
    var i = -1;
    state.data.forEach(function (s, idx) { if (s.id === id) i = idx; });
    if (i === -1) return null;
    for (var k in patch) state.data[i][k] = patch[k];
    save(state.data);
    return state.data[i];
  }

  /* ---- Public API ---- */
  window.Subscribers = {
    configure: function (opts) {
      opts = opts || {};
      state.country = opts.country || 'India';
      state.rootId = opts.rootId || 'subRoot';
      state.data = load();
      state.search = '';
      state.statusFilter = 'all';
      state.page = 1;
      state.activeSub = null;
    },
    render: function () { render(); },
    setSearch: function (v) { state.search = v || ''; state.page = 1; render(); },
    setStatus: function (v) { state.statusFilter = v || 'all'; state.page = 1; render(); },
    resetFilters: function () { state.search = ''; state.statusFilter = 'all'; state.page = 1; render(); },
    goPage: function (p) { state.page = p; render(); },
    openDetail: function (id) { openDetail(id); },
    closeDetail: function () { closeDetail(); },
    toggleStatus: function (id) {
      var cur = state.data.filter(function (x) { return x.id === id; })[0];
      if (!cur) return;
      var s = updateSub(id, { status: cur.status === 'subscribed' ? 'unsubscribed' : 'subscribed' });
      if (s) { render(); openDetail(id); }
    },
    exportCSV: function () {
      var headers = ['Subscriber ID', 'Name', 'Email', 'Phone'];
      var rows = state.data.map(function (s) {
        return [s.id, s.name, s.email, s.phone];
      });
      var csv = '\uFEFF' + [headers].concat(rows).map(function (r) {
        return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
      var a = document.createElement('a');
      a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      a.download = 'subscribers_' + state.country.toLowerCase() + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
})();
