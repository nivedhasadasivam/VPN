/* VPNexues GlobalSearch
 * Top-bar search across all modules.
 * Clicking a result navigates to the correct page and auto-opens the
 * View detail popup for that item.
 */
(function () {
  'use strict';

  function q(v) { return String(v || '').toLowerCase(); }

  function pageCountry() {
    if (typeof window.OrderManager === 'object' && window.OrderManager && window.OrderManager.state && window.OrderManager.state.country) {
      return window.OrderManager.state.country;
    }
    var map = { IN: 'India', AE: 'UAE', US: 'US', SG: 'Singapore' };
    var c = localStorage.getItem('country');
    if (c && map[c.toUpperCase()]) return map[c.toUpperCase()];
    return c || null;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getOrders() {
    if (typeof window.OrderManager === 'object' && window.OrderManager && window.OrderManager.getOrders) {
      return window.OrderManager.getOrders();
    }
    if (typeof window.DashboardAPI === 'object' && window.DashboardAPI && window.DashboardAPI.getOrders) {
      return window.DashboardAPI.getOrders();
    }
    return [];
  }

  function getMessages() {
    if (typeof window.SupportManager === 'object' && window.SupportManager && window.SupportManager.getMessages) {
      return window.SupportManager.getMessages();
    }
    return [];
  }

  function getUsers() {
    if (typeof window.UserManager === 'object' && window.UserManager && window.UserManager.state && window.UserManager.state.users) {
      return window.UserManager.state.users;
    }
    return [];
  }

  function getSubAdmins() {
    if (typeof window.SubAdminManager === 'object' && window.SubAdminManager && window.SubAdminManager.state && window.SubAdminManager.state.subAdmins) {
      return window.SubAdminManager.state.subAdmins;
    }
    if (typeof window.SubAdminManager === 'object' && window.SubAdminManager && window.SubAdminManager.allSubAdmins) {
      return window.SubAdminManager.allSubAdmins;
    }
    return [];
  }

  function getActivityLogs() {
    if (typeof window.ActivityLogManager === 'object' && window.ActivityLogManager && window.ActivityLogManager.state && window.ActivityLogManager.state.logs) {
      return window.ActivityLogManager.state.logs;
    }
    return [];
  }

  function getPayments() {
    if (typeof window.PaymentManager === 'object' && window.PaymentManager && window.PaymentManager._state) {
      if (!window.PaymentManager._state.transactions.length && typeof window.PaymentManager._seed === 'function') {
        window.PaymentManager._seed();
      }
      return window.PaymentManager._state.transactions;
    }
    return [];
  }

  function section(title, icon, items, view) {
    if (!items.length) return '';
    var rows = items.map(function (it) {
      return '<a href="#" onmousedown="event.preventDefault();event.stopPropagation();GlobalSearch.goToAndOpen(\'' + view + '\',\'' + esc(it.id) + '\')" style="display:flex;gap:10px;padding:9px 12px;text-decoration:none;align-items:center;transition:background .15s;border-radius:6px">' +
        '<div style="width:30px;height:30px;border-radius:8px;background:' + it.color + '14;color:' + it.color + ';display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0"><i class="fas ' + icon + '"></i></div>' +
        '<div style="min-width:0"><div style="font-size:13px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(it.title) + '</div>' +
        '<div style="font-size:11px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(it.sub) + '</div></div>' +
        '<i class="fas fa-chevron-right" style="margin-left:auto;color:#cbd5e1;font-size:10px;flex-shrink:0"></i></a>';
    }).join('');
    return '<div style="padding:6px 12px 4px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px">' + title + ' (' + items.length + ')</div>' + rows;
  }

  var GlobalSearch = {
    performSearch: function (val) {
      var query = q(val);
      var target = document.getElementById('globalSearchDropdown') || document.getElementById('globalSearchResults');
      if (!target) return;
      if (!query) {
        target.innerHTML = '';
        target.style.display = 'none';
        return;
      }
      var pc = pageCountry();

      var orders = getOrders().filter(function (o) {
        if (pc && o.country !== pc) return false;
        return q(o.id).indexOf(query) !== -1 || q(o.customer).indexOf(query) !== -1 || q(o.email).indexOf(query) !== -1 || q(o.phone).indexOf(query) !== -1 || q(o.payment).indexOf(query) !== -1;
      }).slice(0, 5).map(function (o) {
        return { id: o.id, title: o.id + ' \u00B7 ' + o.customer, sub: o.country + ' \u00B7 ' + (o.totalText || o.total) + ' \u00B7 ' + o.status, color: '#16a34a' };
      });

      var users = getUsers().filter(function (u) {
        if (pc && q(u.country) !== q(pc)) return false;
        return q(u.name).indexOf(query) !== -1 || q(u.email).indexOf(query) !== -1 || q(u.phone).indexOf(query) !== -1 || q(u.id).indexOf(query) !== -1 || q(u.address).indexOf(query) !== -1;
      }).slice(0, 5).map(function (u) {
        return { id: u.id, title: u.name, sub: (u.id || '') + ' \u00B7 ' + u.email + ' \u00B7 ' + (u.status || ''), color: '#2563eb' };
      });

      var messages = getMessages().filter(function (m) {
        if (pc && m.country !== pc) return false;
        return q(m.from).indexOf(query) !== -1 || q(m.email).indexOf(query) !== -1 || q(m.subject).indexOf(query) !== -1 || q(m.id).indexOf(query) !== -1 || q(m.category).indexOf(query) !== -1;
      }).slice(0, 5).map(function (m) {
        return { id: m.id, title: m.id + ' \u00B7 ' + m.from, sub: m.subject + ' \u00B7 ' + m.status, color: '#d97706' };
      });

      var subAdmins = getSubAdmins().filter(function (s) {
        return q(s.name).indexOf(query) !== -1 || q(s.email).indexOf(query) !== -1 || q(s.role).indexOf(query) !== -1 || q(s.id).indexOf(query) !== -1 || q(s.country).indexOf(query) !== -1;
      }).slice(0, 5).map(function (s) {
        return { id: s.id, title: s.name, sub: (s.id || '') + ' \u00B7 ' + (s.email || '') + ' \u00B7 ' + (s.role || ''), color: '#8b5cf6' };
      });

      var logs = getActivityLogs().filter(function (l) {
        if (pc && l.country && l.country.toLowerCase() !== pc.toLowerCase()) return false;
        return q(l.id).indexOf(query) !== -1 || q(l.user).indexOf(query) !== -1 || q(l.action).indexOf(query) !== -1 || q(l.category).indexOf(query) !== -1 || q(l.details).indexOf(query) !== -1 || q(l.ipAddress).indexOf(query) !== -1;
      }).slice(0, 5).map(function (l) {
        return { id: l.id, title: l.id + ' \u00B7 ' + l.user, sub: l.action + ' \u00B7 ' + l.status + ' \u00B7 ' + l.timestamp, color: '#6366f1' };
      });

      var payments = getPayments().filter(function (t) {
        if (pc && t.country && t.country.toLowerCase() !== pc.toLowerCase()) return false;
        return q(t.id).indexOf(query) !== -1 || q(t.customer).indexOf(query) !== -1 || q(t.email).indexOf(query) !== -1 || q(t.orderId).indexOf(query) !== -1 || q(t.method).indexOf(query) !== -1 || q(t.status).indexOf(query) !== -1;
      }).slice(0, 5).map(function (t) {
        return { id: t.id, title: t.id + ' \u00B7 ' + t.customer, sub: t.orderId + ' \u00B7 ' + t.amount + ' \u00B7 ' + t.status, color: '#0891b2' };
      });

      var html =
        section('Orders', 'fa-shopping-cart', orders, 'orders') +
        section('Users', 'fa-user', users, 'users') +
        section('Payments', 'fa-credit-card', payments, 'payments') +
        section('Activity Logs', 'fa-clock', logs, 'activity') +
        section('Support', 'fa-envelope', messages, 'support') +
        section('Sub Admins', 'fa-user-shield', subAdmins, 'sub-admins');

      if (!html) {
        html = '<div style="padding:24px 16px;text-align:center;color:#94a3b8;font-size:13px"><i class="fas fa-search" style="font-size:20px;display:block;margin-bottom:8px"></i>No results found for &ldquo;' + esc(val) + '&rdquo;</div>';
      }

      target.innerHTML = html;
      target.style.display = 'block';
    },

    hideDropdown: function () {
      var target = document.getElementById('globalSearchDropdown') || document.getElementById('globalSearchResults');
      if (target) target.style.display = 'none';
    },

    goToAndOpen: function (view, id) {
      this.hideDropdown();
      var input = document.getElementById('globalSearchInput');
      if (input) input.value = '';

      if (typeof window.showView === 'function') {
        window.showView(view);
      }

      function tryOpen(attempts) {
        if (attempts > 20) return;
        var opened = false;
        if (view === 'orders' && typeof window.OrderManager === 'object' && window.OrderManager && window.OrderManager.openOrderDetail) {
          window.OrderManager.openOrderDetail(id);
          opened = true;
        } else if (view === 'users' && typeof window.UserManager === 'object' && window.UserManager && window.UserManager.openUserDetail) {
          window.UserManager.openUserDetail(id);
          opened = true;
        } else if (view === 'support' && typeof window.SupportManager === 'object' && window.SupportManager && window.SupportManager.openMessageDetail) {
          window.SupportManager.openMessageDetail(id);
          opened = true;
        } else if (view === 'sub-admins' && typeof window.SubAdminManager === 'object' && window.SubAdminManager && window.SubAdminManager.openSubAdminDetail) {
          window.SubAdminManager.openSubAdminDetail(id);
          opened = true;
        } else if (view === 'activity' && typeof window.ActivityLogManager === 'object' && window.ActivityLogManager && window.ActivityLogManager.viewLog) {
          window.ActivityLogManager.viewLog(id);
          opened = true;
        } else if (view === 'payments' && typeof window.PaymentManager === 'object' && window.PaymentManager && window.PaymentManager.openDetail) {
          window.PaymentManager.openDetail(id);
          opened = true;
        }
        if (!opened) {
          setTimeout(function () { tryOpen(attempts + 1); }, 100);
        }
      }
      setTimeout(function () { tryOpen(0); }, 200);
    }
  };

  window.GlobalSearch = GlobalSearch;
})();
