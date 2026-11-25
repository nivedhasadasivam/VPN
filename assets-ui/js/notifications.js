/* VPNexues NotificationManager
 * Notification bell + panel for admin dashboards.
 * Derives notifications from orders, support messages and low-stock data,
 * persists read state under 'vpnexues_notifications'.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'vpnexues_notifications';

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function save(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
  }

  function pageCountry() {
    if (typeof window.OrderManager === 'object' && window.OrderManager && window.OrderManager.state && window.OrderManager.state.country) {
      return window.OrderManager.state.country;
    }
    var map = { IN: 'India', AE: 'UAE', US: 'US', SG: 'Singapore' };
    var c = localStorage.getItem('country');
    if (c && map[c.toUpperCase()]) return map[c.toUpperCase()];
    if (c) return c;
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf('sub-admin-india') !== -1) return 'India';
    if (path.indexOf('sub-admin-uae') !== -1) return 'UAE';
    if (path.indexOf('sub-admin-us') !== -1) return 'US';
    if (path.indexOf('sub-admin-singapore') !== -1) return 'Singapore';
    return null;
  }

  function timeAgo(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var diff = Date.now() - d.getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    return days + 'd ago';
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

  function statusLabel(s) {
    return (s || '').charAt(0).toUpperCase() + (s || '').slice(1);
  }

  function sync() {
    var pc = pageCountry();
    var list = load();
    var existing = {};
    list.forEach(function (n) { existing[n.id] = true; });
    var now = new Date().toISOString();

    getOrders().forEach(function (o) {
      if (pc && o.country !== pc) return;
      if (o.status === 'pending' || o.status === 'processing') {
        var id = 'ord-' + o.id;
        if (!existing[id]) {
          list.push({ id: id, type: 'order', title: 'New order ' + o.id, message: o.customer + ' placed an order (' + (o.totalText || o.total) + ')', time: now, read: false });
          existing[id] = true;
        }
      }
    });

    getMessages().forEach(function (m) {
      if (pc && m.country !== pc) return;
      if (m.status === 'new') {
        var id = 'msg-' + m.id;
        if (!existing[id]) {
          list.push({ id: id, type: 'support', title: 'New support ticket ' + m.id, message: m.from + ': ' + m.subject, time: now, read: false });
          existing[id] = true;
        }
      }
    });

    var adminMsgs = [];
    try { adminMsgs = JSON.parse(localStorage.getItem('vpnexues_admin_messages') || '[]'); } catch (e) {}

    if (pc) {
      var countryMap = { India: 'india', UAE: 'uae', US: 'us', Singapore: 'singapore' };
      var pcLower = (countryMap[pc] || pc).toLowerCase();
      list = list.filter(function (n) {
        if (n.id && n.id.indexOf('adminmsg-') === 0) {
          var origId = n.id.replace('adminmsg-', '');
          var orig = adminMsgs.find(function (m) { return m.id === origId; });
          if (orig && orig.recipients && orig.recipients.indexOf(pcLower) === -1) {
            delete existing[n.id];
            return false;
          }
        }
        return true;
      });
    }

    adminMsgs.forEach(function (m) {
      if (pc) {
        var countryMap = { India: 'india', UAE: 'uae', US: 'us', Singapore: 'singapore' };
        var pcLower = (countryMap[pc] || pc).toLowerCase();
        if (!m.recipients || m.recipients.indexOf(pcLower) === -1) return;
      }
      var id = 'adminmsg-' + m.id;
      if (!existing[id]) {
        var tmp = document.createElement('div');
        tmp.innerHTML = m.body || '';
        var plainBody = tmp.textContent || tmp.innerText || '';
        var shortBody = plainBody.length > 60 ? plainBody.substring(0, 60) + '...' : plainBody;
        list.push({ id: id, type: 'message', title: 'New message: ' + m.subject, message: 'From Super Admin ââ¬â ' + shortBody, body: m.body || '', subject: m.subject, time: m.date, read: false });
        existing[id] = true;
      }
    });

    save(list);
    return list;
  }

  function itemHtml(n) {
    var icons = { order: 'fa-shopping-cart', support: 'fa-envelope', message: 'fa-paper-plane', lowstock: 'fa-exclamation-triangle' };
    var colors = { order: '#16a34a', support: '#d97706', message: '#2E7D32', lowstock: '#ef4444' };
    var icon = icons[n.type] || 'fa-bell';
    var color = colors[n.type] || '#64748b';
    var clickAction = n.type === 'message'
      ? 'NotificationManager.markRead(\'' + n.id + '\');NotificationManager.showMessageNotif(\'' + n.id + '\')'
      : 'NotificationManager.markRead(\'' + n.id + '\')';
    return '<div class="notification-item' + (n.read ? '' : ' unread') + '" onclick="' + clickAction + '">' +
      '<div style="width:32px;height:32px;border-radius:8px;background:' + color + '14;color:' + color + ';display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0"><i class="fas ' + icon + '"></i></div>' +
      '<div style="flex:1;min-width:0">' +
        '<p style="font-size:13px;color:var(--text);margin:0;font-weight:600">' + n.title + '</p>' +
        '<div style="font-size:12px;color:var(--text-secondary);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + n.message + '</div>' +
        '<small style="font-size:11px;color:var(--text-secondary)">' + timeAgo(n.time) + '</small>' +
      '</div>' +
      (n.read ? '' : '<div class="notification-dot" style="width:8px;height:8px;border-radius:50%;background:#22C55E;flex-shrink:0;margin-top:4px"></div>') +
      '<button onclick="event.stopPropagation();NotificationManager.markRead(\'' + n.id + '\');NotificationManager.deleteNotif(\'' + n.id + '\')" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:14px;padding:0 0 0 6px;flex-shrink:0;line-height:1" title="Delete">&times;</button>' +
    '</div>';
  }

  function render() {
    var list = load();
    list.sort(function (a, b) { return new Date(b.time) - new Date(a.time); });
    var listEl = document.getElementById('notificationsList');
    var countEl = document.getElementById('notifCount');
    var unread = list.filter(function (n) { return !n.read; }).length;

    if (countEl) {
      if (unread > 0) {
        countEl.textContent = unread > 9 ? '9+' : unread;
        countEl.style.display = 'flex';
      } else {
        countEl.style.display = 'none';
      }
    }

    if (listEl) {
      if (!list.length) {
        listEl.innerHTML = '<div style="padding:32px 16px;text-align:center;color:var(--text-secondary);font-size:13px"><i class="fas fa-bell-slash" style="font-size:22px;display:block;margin-bottom:8px;color:var(--text-secondary)"></i>No notifications yet</div>';
      } else {
        listEl.innerHTML = list.slice(0, 30).map(itemHtml).join('');
      }
    }
  }

  var NotificationManager = {
    init: function () {
      sync();
      render();
    },

    togglePanel: function () {
      var panel = document.getElementById('notificationsPanel');
      if (!panel) return;
      var showing = panel.style.display === 'block';
      panel.style.display = showing ? 'none' : 'block';
      panel.classList.toggle('active', !showing);
      if (!showing) {
        sync();
        render();
        setTimeout(function() {
          var items = panel.querySelectorAll('.notification-item');
          items.forEach(function(item, i) {
            item.style.opacity = '0';
            item.style.transform = 'translateY(12px)';
            item.style.transition = 'none';
            setTimeout(function() {
              item.style.transition = 'opacity .35s ease, transform .35s ease';
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 50 + i * 60);
          });
        }, 10);
      }
    },

    markAllRead: function () {
      var list = load();
      list.forEach(function (n) { n.read = true; });
      save(list);
      render();
    },

    clearAll: function () {
      save([]);
      render();
    },

    markRead: function (id) {
      var list = load();
      var n = list.find(function (x) { return x.id === id; });
      if (n && !n.read) {
        n.read = true;
        save(list);
        render();
      }
    },

    deleteNotif: function (id) {
      var list = load();
      list = list.filter(function (n) { return n.id !== id; });
      save(list);
      render();
    },

    showMessageNotif: function (id) {
      var list = load();
      var n = list.find(function (x) { return x.id === id; });
      if (!n) return;
      var panel = document.getElementById('notificationsPanel');
      if (panel) { panel.style.display = 'none'; panel.classList.remove('active'); }
      var overlay = document.createElement('div');
      overlay.id = 'msgNotifOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.5);display:flex;justify-content:center;align-items:center';
      overlay.innerHTML =
        '<div style="background:#fff;border-radius:14px;width:520px;max-width:94%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">' +
          '<div style="background:#134B2F;padding:20px 24px;color:#fff;display:flex;justify-content:space-between;align-items:center;border-radius:14px 14px 0 0">' +
            '<div><div style="font-size:11px;opacity:.7;margin-bottom:4px">From Super Admin</div><div style="font-size:16px;font-weight:700">' + (n.subject || n.title.replace('New message: ','')) + '</div></div>' +
            '<button onclick="document.getElementById(\'msgNotifOverlay\').remove()" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px">&times;</button>' +
          '</div>' +
          '<div style="padding:20px 24px">' +
            '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">' + timeAgo(n.time) + '</div>' +
            '<div style="font-size:14px;line-height:1.7;color:var(--text)">' + (n.body || n.message || '') + '</div>' +
          '</div>' +
          '<div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end">' +
            '<button onclick="document.getElementById(\'msgNotifOverlay\').remove()" style="padding:8px 20px;border-radius:8px;border:1px solid var(--border);background:#fff;cursor:pointer;font-size:13px;font-weight:500;color:var(--text-secondary)">Close</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    }
  };

  window.NotificationManager = NotificationManager;
  NotificationManager.init();

  document.addEventListener('click', function (e) {
    var panel = document.getElementById('notificationsPanel');
    var btn = document.getElementById('notifBtn');
    if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
      panel.style.display = 'none';
      panel.classList.remove('active');
    }
  });
})();