/* VPNexues OrderManager
 * Order management for super admin and sub admin dashboards.
 * Persists to localStorage under 'vpnexues_orders'.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'vpnexues_orders';
  var STORAGE_VERSION = 2;

  function deepClone(arr) {
    return JSON.parse(JSON.stringify(arr || []));
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    if (typeof window.DashboardAPI === 'object' && window.DashboardAPI && window.DashboardAPI.ensureSeed) {
      window.DashboardAPI.ensureSeed();
    }
    try {
      var re = localStorage.getItem(STORAGE_KEY);
      if (re) return JSON.parse(re);
    } catch (e2) {}
    return [];
  }

  function save(arr) {
    try {
      var out = deepClone(arr);
      out.__v = STORAGE_VERSION;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
    } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function statusColor(status) {
    var value = String(status || '');
    var map = {
      delivered: '#22C55E',
      shipped: '#3B82F6',
      processing: '#F59E0B',
      packed: '#8B5CF6',
      pending: '#64748B',
      cancelled: '#EF4444'
    };
    return map[value] || '#64748B';
  }

  function statusLabel(status) {
    var value = String(status || '');
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function statusPill(status) {
    var c = statusColor(status);
    return '<span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;color:' + c + ';background:' + c + '1A">' + esc(statusLabel(status)) + '</span>';
  }

  function payBadge(payment) {
    return '<span style="display:inline-block;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(59,130,246,.1);color:#2563eb">' + esc(payment || '—') + '</span>';
  }

  function orderMoney(o, n) {
    var digits = o.currencyCode === 'IN' ? 0 : 2;
    return esc(o.currency) + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  var seedLoaded = false;

  var OrderManager = {
    allOrders: [],
    state: {
      orders: [],
      search: '',
      statusFilter: 'all',
      dateFrom: '',
      dateTo: '',
      customerFilter: '',
      paymentFilter: '',
      sortBy: 'date',
      sortDir: 'desc',
      page: 1,
      perPage: 10,
      country: null
    },

    init: function () {
      if (seedLoaded) return;
      seedLoaded = true;
      this.allOrders = load();
      this.state.orders = deepClone(this.allOrders);
    },

    _filteredOrders: function () {
      var self = this;
      var list = self.state.orders.slice();
      if (self.state.country) {
        list = list.filter(function (o) { return o.country === self.state.country; });
      }
      if (self.state.statusFilter !== 'all') {
        list = list.filter(function (o) { return o.status === self.state.statusFilter; });
      }
      if (self.state.search) {
        var q = self.state.search.toLowerCase();
        list = list.filter(function (o) {
          return (o.id + ' ' + o.customer + ' ' + o.email).toLowerCase().indexOf(q) !== -1;
        });
      }
      if (self.state.dateFrom) {
        list = list.filter(function (o) { return o.date >= self.state.dateFrom; });
      }
      if (self.state.dateTo) {
        list = list.filter(function (o) { return o.date <= self.state.dateTo; });
      }
      if (self.state.customerFilter) {
        list = list.filter(function (o) { return o.customer === self.state.customerFilter; });
      }
      if (self.state.paymentFilter) {
        list = list.filter(function (o) { return o.payment === self.state.paymentFilter; });
      }
      var key = self.state.sortBy;
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

    getFiltered: function () {
      return this._filteredOrders();
    },

    getOrders: function (country) {
      var self = this;
      if (!country) return this.state.orders.slice();
      return this.state.orders.filter(function (o) { return o.country === country; });
    },

    getUniqueCustomers: function (country) {
      var seen = {};
      this.getOrders(country).forEach(function (o) { seen[o.customer] = true; });
      return Object.keys(seen).sort();
    },

    getUniquePayments: function (country) {
      var seen = {};
      this.getOrders(country).forEach(function (o) { seen[o.payment] = true; });
      return Object.keys(seen).sort();
    },

    _populateFilterOptions: function () {
      var self = this;
      var cust = document.getElementById('orderCustomerFilter');
      var pay = document.getElementById('orderPaymentFilter');
      if (cust) {
        var customers = this.getUniqueCustomers(self.state.country);
        var curCust = cust.value;
        var html = '<option value="">All Customers</option>' + customers.map(function (c) {
          return '<option value="' + esc(c) + '"' + (c === curCust ? ' selected' : '') + '>' + esc(c) + '</option>';
        }).join('');
        if (cust.innerHTML !== html) cust.innerHTML = html;
      }
      if (pay) {
        var payments = this.getUniquePayments(self.state.country);
        var curPay = pay.value;
        var htmlP = '<option value="">All Payment Methods</option>' + payments.map(function (p) {
          return '<option value="' + esc(p) + '"' + (p === curPay ? ' selected' : '') + '>' + esc(p) + '</option>';
        }).join('');
        if (pay.innerHTML !== htmlP) pay.innerHTML = htmlP;
      }
    },

    renderOrdersTable: function (opts) {
      opts = opts || {};
      this.init();
      this.state.country = opts.country || null;
      var tbody = document.getElementById(opts.tbodyId || 'ordersTableBody');
      var paginationEl = document.getElementById(opts.paginationId || 'ordersPagination');
      var summaryEl = document.getElementById(opts.summaryId || 'ordersSummary');
      var showCountry = !opts.country;

      this._populateFilterOptions();
      this.updateFilterTabCounts();

      var filtered = this._filteredOrders();
      var totalPages = Math.max(1, Math.ceil(filtered.length / this.state.perPage));
      if (this.state.page > totalPages) this.state.page = totalPages;
      var start = (this.state.page - 1) * this.state.perPage;
      var rows = filtered.slice(start, start + this.state.perPage);

      if (summaryEl) {
        var end = Math.min(start + rows.length, filtered.length);
        summaryEl.textContent = filtered.length ? ('Showing ' + (start + 1) + '-' + end + ' of ' + filtered.length + ' orders') : 'No orders found';
      }

      if (!tbody) return;

      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="' + (opts.colCount || 8) + '" style="text-align:center;padding:40px;color:var(--text-secondary)">No orders found</td></tr>';
      } else {
        var self = this;
        tbody.innerHTML = rows.map(function (o) { return self._rowHtml(o, opts, showCountry); }).join('');
      }

      if (paginationEl) {
        paginationEl.innerHTML = this._paginationHtml(totalPages, opts);
      }

      this._lastOpts = opts;
    },

    _rowHtml: function (o, opts, showCountry) {
      var self = this;
      var itemsText = (o.items && o.items.length) ? o.items.map(function (it) { return esc(it.name) + ' x' + esc(it.qty); }).join(', ') : '—';
      var itemsShort = (o.items && o.items.length) ? o.items.reduce(function (a, it) { return a + it.qty; }, 0) + ' items' : '—';
      var actions =
        '<div style="display:flex;gap:6px;align-items:center">' +
          '<button class="action-btn view" title="View" onclick="OrderManager.openOrderDetail(\'' + esc(o.id) + '\')"><i class="fas fa-eye"></i></button>' +
          '<button class="action-btn" title="Update Status" onclick="OrderManager.updateStatus(\'' + esc(o.id) + '\')"><i class="fas fa-exchange-alt"></i></button>' +
          '<button class="action-btn delete" title="Delete" onclick="OrderManager.deleteOrder(\'' + esc(o.id) + '\')"><i class="fas fa-trash-alt"></i></button>' +
        '</div>';
      var idCell = '<td><span style="font-weight:600;color:var(--text)">' + esc(o.id) + '</span></td>';
      var customerCell = '<td><div style="font-weight:600;color:var(--text)">' + esc(o.customer) + '</div><div style="font-size:11px;color:var(--text-secondary)">' + esc(o.email) + '</div></td>';
      var amountCell = '<td><span style="font-weight:700;color:var(--text)">' + orderMoney(o, o.total) + '</span></td>';
      var payCell = '<td>' + payBadge(o.payment) + '</td>';
      var statusCell = '<td>' + statusPill(o.status) + '</td>';
      var actionCell = '<td>' + actions + '</td>';

      var cols;
      if (showCountry) {
        cols = idCell +
          customerCell +
          '<td><span style="font-weight:600;color:var(--text)">' + esc(o.country) + '</span></td>' +
          '<td><div style="font-size:12px;color:var(--text-secondary)">' + esc(o.date) + '</div><div style="font-size:12px;color:var(--text);margin-top:2px" title="' + esc(itemsText) + '">' + esc(itemsShort) + '</div></td>' +
          amountCell + payCell + statusCell + actionCell;
      } else {
        cols = idCell +
          customerCell +
          '<td style="max-width:220px"><div style="font-size:12px;color:var(--text);white-space:normal;line-height:1.4">' + esc(itemsText) + '</div></td>' +
          amountCell +
          '<td><span style="font-size:12px;color:var(--text-secondary)">' + esc(o.date) + '</span></td>' +
          payCell + statusCell + actionCell;
      }
      return '<tr>' + cols + '</tr>';
    },

    _paginationHtml: function (totalPages, opts) {
      var self = this;
      var page = this.state.page;
      var html = '';
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="OrderManager.goToPage(' + (page - 1) + ')"' + (page <= 1 ? ' disabled' : '') + '>Prev</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button class="btn ' + (i === page ? 'btn-primary' : 'btn-secondary') + '" style="padding:6px 12px;font-size:12px" onclick="OrderManager.goToPage(' + i + ')">' + i + '</button>';
      }
      html += '<button class="btn btn-secondary" style="padding:6px 12px;font-size:12px" onclick="OrderManager.goToPage(' + (page + 1) + ')"' + (page >= totalPages ? ' disabled' : '') + '>Next</button>';
      return html;
    },

    updateFilterTabCounts: function () {
      var self = this;
      var tabs = document.querySelectorAll('.order-filter-tab');
      if (!tabs.length) return;
      var list = this.state.country ? this.getOrders(this.state.country) : this.state.orders;
      var counts = { all: list.length, pending: 0, processing: 0, packed: 0, shipped: 0, delivered: 0, cancelled: 0 };
      list.forEach(function (o) {
        if (counts[o.status] !== undefined) counts[o.status]++;
      });
      tabs.forEach(function (tab) {
        var status = tab.getAttribute('data-status');
        var span = tab.querySelector('.tab-count');
        if (span) span.textContent = counts[status] !== undefined ? counts[status] : 0;
      });
    },

    goToPage: function (p) {
      var totalPages = Math.max(1, Math.ceil(this._filteredOrders().length / this.state.perPage));
      if (p < 1) p = 1;
      if (p > totalPages) p = totalPages;
      this.state.page = p;
      this.renderCurrent();
    },

    setStatusFilter: function (status) {
      this.state.statusFilter = status;
      this.state.page = 1;
      document.querySelectorAll('.order-filter-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-status') === status);
      });
      this.renderCurrent();
    },

    setSearch: function (q) {
      this.state.search = (q || '').trim();
      this.state.page = 1;
      this.renderCurrent();
    },

    setDateFrom: function (d) {
      this.state.dateFrom = d || '';
      this.state.page = 1;
      this.renderCurrent();
    },

    setDateTo: function (d) {
      this.state.dateTo = d || '';
      this.state.page = 1;
      this.renderCurrent();
    },

    setCustomerFilter: function (c) {
      this.state.customerFilter = c || '';
      this.state.page = 1;
      this.renderCurrent();
    },

    setPaymentFilter: function (p) {
      this.state.paymentFilter = p || '';
      this.state.page = 1;
      this.renderCurrent();
    },

    setSortBy: function (key) {
      if (this.state.sortBy === key) {
        this.state.sortDir = this.state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.state.sortBy = key;
        this.state.sortDir = 'desc';
      }
      document.querySelectorAll('.filter-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.textContent.trim().toLowerCase() === key);
      });
      this.renderCurrent();
    },

    resetFilters: function () {
      this.state.search = '';
      this.state.statusFilter = 'all';
      this.state.dateFrom = '';
      this.state.dateTo = '';
      this.state.customerFilter = '';
      this.state.paymentFilter = '';
      this.state.sortBy = 'date';
      this.state.sortDir = 'desc';
      this.state.page = 1;
      ['orderSearchInput', 'orderDateFrom', 'orderDateTo'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
      });
      ['orderCustomerFilter', 'orderPaymentFilter'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
      });
      document.querySelectorAll('.order-filter-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-status') === 'all');
      });
      this.renderCurrent();
    },

    getOrder: function (id) {
      return this.state.orders.find(function (o) { return o.id === id; });
    },

    persist: function () {
      this.allOrders = deepClone(this.state.orders);
      save(this.state.orders);
      if (typeof window.dispatchEvent === 'function') {
        try { window.dispatchEvent(new Event('vpnexues-data-updated')); } catch (e) {}
      }
    },

    renderCurrent: function () {
      if (typeof window.renderCurrentOrders === 'function') {
        window.renderCurrentOrders();
      } else if (this._lastOpts) {
        this.renderOrdersTable(this._lastOpts);
      }
    },

    /* ---- Detail ---- */
    openOrderDetail: function (id) {
      var o = this.getOrder(id);
      if (!o) return;
      var content = document.getElementById('orderDetailContent');
      var modal = document.getElementById('orderDetailModal');
      if (!content || !modal) return;

      var itemsHtml = (o.items || []).map(function (it) {
        var img = (typeof PRODUCT_IMAGES !== 'undefined' && PRODUCT_IMAGES[it.name]) ? PRODUCT_IMAGES[it.name] : '';
        var imgHtml = img
          ? '<img src="' + esc(img) + '" alt="' + esc(it.name) + '" style="width:32px;height:32px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:8px">'
          : '';
        return '<tr>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155">' + imgHtml + esc(it.name) + '</td>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:center">' + esc(it.qty) + '</td>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:right">' + orderMoney(o, it.price) + '</td>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:600;color:#111;text-align:right">' + orderMoney(o, it.price * it.qty) + '</td>' +
        '</tr>';
      }).join('');

      var detailRow = function (label, value) {
        return '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:11px 13px">' +
          '<div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + label + '</div>' +
          '<div style="font-size:13px;font-weight:600;color:#111">' + esc(value) + '</div></div>';
      };

      content.innerHTML =
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">' +
          detailRow('Order ID', o.id) +
          detailRow('Status', statusPill(o.status)) +
          detailRow('Customer', o.customer) +
          detailRow('Email', o.email) +
          detailRow('Country', o.country) +
          detailRow('Payment', o.payment) +
          detailRow('Order Date', o.date) +
          detailRow('Delivery Address', o.address) +
        '</div>' +
        '<div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:16px">' +
          '<table style="width:100%;border-collapse:collapse">' +
            '<thead><tr style="background:#f8fafc">' +
              '<th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Product</th>' +
              '<th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Qty</th>' +
              '<th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Price</th>' +
              '<th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Total</th>' +
            '</tr></thead>' +
            '<tbody>' + itemsHtml + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div style="display:flex;justify-content:flex-end">' +
          '<div style="width:240px">' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#64748b"><span>Subtotal</span><span style="font-weight:600;color:#111">' + orderMoney(o, o.subtotal) + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#64748b"><span>Delivery</span><span style="font-weight:600;color:#111">' + orderMoney(o, o.delivery) + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;font-weight:700;color:#111;border-top:1px solid #e2e8f0"><span>Total</span><span>' + orderMoney(o, o.total) + '</span></div>' +
          '</div>' +
        '</div>';
      modal.style.display = 'flex';
    },

    closeOrderDetail: function () {
      var modal = document.getElementById('orderDetailModal');
      if (modal) modal.style.display = 'none';
    },

    /* ---- Status update ---- */
    updateStatus: function (id) {
      var o = this.getOrder(id);
      if (!o) return;
      var modal = document.getElementById('statusUpdateModal');
      var idEl = document.getElementById('statusUpdateOrderId');
      var select = document.getElementById('newStatusSelect');
      if (!modal) return;
      if (idEl) idEl.textContent = id;
      if (select) select.value = o.status || 'pending';
      modal.style.display = 'flex';
    },

    closeStatusUpdate: function () {
      var modal = document.getElementById('statusUpdateModal');
      if (modal) modal.style.display = 'none';
    },

    confirmStatusUpdate: function () {
      var id = document.getElementById('statusUpdateOrderId');
      var select = document.getElementById('newStatusSelect');
      if (!id || !select) return;
      var o = this.getOrder(id.textContent);
      if (!o) return;
      o.status = select.value;
      this.persist();
      this.closeStatusUpdate();
      this.renderCurrent();
      if (typeof window.showToast === 'function') {
        window.showToast('Order ' + o.id + ' updated to ' + statusLabel(o.status));
      }
    },

    /* ---- Delete ---- */
    deleteOrder: function (id) {
      var o = this.getOrder(id);
      if (!o) return;
      if (!confirm('Delete order ' + id + '?')) return;
      this.state.orders = this.state.orders.filter(function (x) { return x.id !== id; });
      this.persist();
      this.renderCurrent();
    },

    /* ---- Export ---- */
    exportCSV: function (opts) {
      opts = opts || {};
      var self = this;
      var list = opts.country ? this.getOrders(opts.country) : this.state.orders;
      var rows = list.map(function (o) {
        var items = (o.items || []).map(function (it) { return it.name + ' x' + it.qty; }).join('; ');
        return [o.id, o.customer, o.email, o.country, items.replace(/,/g, ' '), o.total, o.payment, o.date, o.status].join(',');
      });
      var csv = 'Order ID,Customer,Email,Country,Items,Amount,Payment,Date,Status\n' + rows.join('\n');
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = opts.country ? ('orders-' + opts.country.toLowerCase() + '.csv') : 'orders.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    printOrders: function (opts) {
      opts = opts || {};
      var list = opts.country ? this.getOrders(opts.country) : this.state.orders;
      var html = '<html><head><title>' + (opts.title || 'Orders') + '</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left}th{background:#f8fafc}</style></head><body>';
      html += '<h2>' + esc(opts.title || 'Orders Report') + '</h2><table><thead><tr><th>Order</th><th>Customer</th><th>Country</th><th>Items</th><th>Amount</th><th>Payment</th><th>Date</th><th>Status</th></tr></thead><tbody>';
      list.forEach(function (o) {
        var items = (o.items || []).map(function (it) { return esc(it.name) + ' x' + esc(it.qty); }).join(', ');
        html += '<tr><td>' + esc(o.id) + '</td><td>' + esc(o.customer) + ' (' + esc(o.email) + ')</td><td>' + esc(o.country) + '</td><td>' + esc(items) + '</td><td>' + orderMoney(o, o.total) + '</td><td>' + esc(o.payment) + '</td><td>' + esc(o.date) + '</td><td>' + esc(statusLabel(o.status)) + '</td></tr>';
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

  OrderManager.init();
  window.OrderManager = OrderManager;
})();