/* VPNexues Sub-Admin - Geo report (States / Emirates / Regions / Locations) with city drill-down */
window.GeoReport = (function () {
  var state = { country: 'India', rootId: 'geoRoot', selected: '' };

  var DATA = {
    India: {
      label: 'State',
      plural: 'States',
      currency: '\u20B9',
      group: 'en-IN',
      states: [
        {
          name: 'Maharashtra', revenue: 1860000, orders: 612, growth: 16.2,
          cities: [
            { name: 'Mumbai', orders: 210, revenue: 680000, growth: 18.4 },
            { name: 'Pune', orders: 168, revenue: 520000, growth: 15.2 },
            { name: 'Nagpur', orders: 92, revenue: 260000, growth: 12.8 },
            { name: 'Nashik', orders: 76, revenue: 210000, growth: 11.6 },
            { name: 'Aurangabad', orders: 66, revenue: 190000, growth: 10.1 }
          ]
        },
        {
          name: 'Tamil Nadu', revenue: 1375000, orders: 478, growth: 12.1,
          cities: [
            { name: 'Chennai', orders: 150, revenue: 480000, growth: 14.3 },
            { name: 'Coimbatore', orders: 88, revenue: 250000, growth: 12.6 },
            { name: 'Salem', orders: 74, revenue: 198000, growth: 10.4 },
            { name: 'Erode', orders: 66, revenue: 170000, growth: 9.8 },
            { name: 'Vellore', orders: 62, revenue: 164000, growth: 9.2 },
            { name: 'Madurai', orders: 46, revenue: 120000, growth: 8.1 },
            { name: 'Tiruchirappalli', orders: 36, revenue: 83000, growth: 7.4 },
            { name: 'Thoothukudi', orders: 30, revenue: 61000, growth: 6.9 }
          ]
        },
        {
          name: 'Karnataka', revenue: 1120000, orders: 392, growth: 10.8,
          cities: [
            { name: 'Bengaluru', orders: 190, revenue: 620000, growth: 13.9 },
            { name: 'Mysuru', orders: 76, revenue: 210000, growth: 11.2 },
            { name: 'Hubballi', orders: 62, revenue: 160000, growth: 9.8 },
            { name: 'Mangaluru', orders: 64, revenue: 130000, growth: 8.6 }
          ]
        },
        {
          name: 'Delhi NCR', revenue: 985000, orders: 341, growth: 8.5,
          cities: [
            { name: 'New Delhi', orders: 140, revenue: 450000, growth: 10.6 },
            { name: 'Gurugram', orders: 82, revenue: 260000, growth: 9.7 },
            { name: 'Noida', orders: 70, revenue: 190000, growth: 8.3 },
            { name: 'Faridabad', orders: 49, revenue: 85000, growth: 6.2 }
          ]
        },
        {
          name: 'Telangana', revenue: 740000, orders: 262, growth: 7.9,
          cities: [
            { name: 'Hyderabad', orders: 160, revenue: 520000, growth: 9.9 },
            { name: 'Warangal', orders: 62, revenue: 140000, growth: 7.1 },
            { name: 'Karimnagar', orders: 40, revenue: 80000, growth: 5.6 }
          ]
        },
        {
          name: 'West Bengal', revenue: 560000, orders: 201, growth: 5.6,
          cities: [
            { name: 'Kolkata', orders: 110, revenue: 360000, growth: 7.2 },
            { name: 'Howrah', orders: 38, revenue: 80000, growth: 5.1 },
            { name: 'Durgapur', orders: 27, revenue: 60000, growth: 4.6 },
            { name: 'Asansol', orders: 26, revenue: 60000, growth: 4.1 }
          ]
        },
        {
          name: 'Gujarat', revenue: 430000, orders: 158, growth: 4.3,
          cities: [
            { name: 'Ahmedabad', orders: 70, revenue: 210000, growth: 6.4 },
            { name: 'Surat', orders: 44, revenue: 120000, growth: 5.3 },
            { name: 'Vadodara', orders: 26, revenue: 60000, growth: 4.2 },
            { name: 'Rajkot', orders: 18, revenue: 40000, growth: 3.1 }
          ]
        },
        {
          name: 'Other States', revenue: 1075000, orders: 801, growth: 1.8,
          cities: [
            { name: 'Jaipur', orders: 120, revenue: 230000, growth: 3.8 },
            { name: 'Lucknow', orders: 96, revenue: 170000, growth: 3.2 },
            { name: 'Bhopal', orders: 84, revenue: 150000, growth: 2.9 },
            { name: 'Kochi', orders: 70, revenue: 120000, growth: 2.6 },
            { name: 'Bhubaneswar', orders: 66, revenue: 120000, growth: 2.4 },
            { name: 'Chandigarh', orders: 52, revenue: 95000, growth: 2.0 },
            { name: 'Thiruvananthapuram', orders: 58, revenue: 80000, growth: 1.4 },
            { name: 'Rest of India', orders: 255, revenue: 110000, growth: 0.8 }
          ]
        }
      ]
    },
    UAE: {
      label: 'Emirate',
      plural: 'Emirates',
      currency: 'AED ',
      group: 'en-IN',
      states: [
        {
          name: 'Dubai', revenue: 690000, orders: 320, growth: 13.2,
          cities: [
            { name: 'Deira', orders: 72, revenue: 160000, growth: 16.2 },
            { name: 'Bur Dubai', orders: 68, revenue: 150000, growth: 15.4 },
            { name: 'Jumeirah', orders: 56, revenue: 130000, growth: 13.8 },
            { name: 'Downtown Dubai', orders: 50, revenue: 120000, growth: 14.9 },
            { name: 'Business Bay', orders: 74, revenue: 130000, growth: 12.7 }
          ]
        },
        {
          name: 'Abu Dhabi', revenue: 412800, orders: 168, growth: 12.6,
          cities: [
            { name: 'Al Reem Island', orders: 40, revenue: 110000, growth: 12.8 },
            { name: 'Khalifa City', orders: 38, revenue: 90000, growth: 11.4 },
            { name: 'Corniche', orders: 32, revenue: 86000, growth: 10.9 },
            { name: 'Yas Island', orders: 28, revenue: 64800, growth: 12.1 },
            { name: 'Musaffah', orders: 30, revenue: 62000, growth: 8.6 }
          ]
        },
        {
          name: 'Sharjah', revenue: 193400, orders: 108, growth: 9.4,
          cities: [
            { name: 'Al Majaz', orders: 30, revenue: 54000, growth: 10.8 },
            { name: 'Al Nahda', orders: 28, revenue: 52000, growth: 9.9 },
            { name: 'Muwaileh', orders: 26, revenue: 46000, growth: 8.7 },
            { name: 'Al Khan', orders: 24, revenue: 41400, growth: 8.2 }
          ]
        },
        {
          name: 'Ajman', revenue: 88900, orders: 52, growth: 6.8,
          cities: [
            { name: 'Al Rashidiya', orders: 20, revenue: 36000, growth: 7.9 },
            { name: 'Al Nuaimiya', orders: 16, revenue: 28000, growth: 6.4 },
            { name: 'Jurf', orders: 16, revenue: 24900, growth: 6.1 }
          ]
        },
        {
          name: 'Ras Al Khaimah', revenue: 58900, orders: 34, growth: 3.5,
          cities: [
            { name: 'Al Nakheel', orders: 12, revenue: 22000, growth: 5.8 },
            { name: 'Al Marjan Island', orders: 11, revenue: 19000, growth: 4.9 },
            { name: 'Hamraniyah', orders: 11, revenue: 17900, growth: 4.1 }
          ]
        },
        {
          name: 'Fujairah', revenue: 31600, orders: 22, growth: 3.6,
          cities: [
            { name: 'Fujairah City', orders: 11, revenue: 16000, growth: 4.4 },
            { name: 'Dibba', orders: 6, revenue: 9000, growth: 3.2 },
            { name: 'Mirbah', orders: 5, revenue: 6600, growth: 3.0 }
          ]
        },
        {
          name: 'Umm Al-Quwain', revenue: 15900, orders: 12, growth: 2.1,
          cities: [
            { name: 'UAQ City', orders: 7, revenue: 9500, growth: 2.8 },
            { name: 'Falaj Al Mualla', orders: 5, revenue: 6400, growth: 1.5 }
          ]
        }
      ]
    },
    US: {
      label: 'Region',
      plural: 'Regions',
      currency: '$',
      group: 'en-US',
      states: [
        {
          name: 'West Coast', revenue: 18900, orders: 512, growth: 14.3,
          cities: [
            { name: 'Los Angeles', orders: 74, revenue: 4600, growth: 15.2 },
            { name: 'San Francisco', orders: 60, revenue: 4000, growth: 14.8 },
            { name: 'Seattle', orders: 52, revenue: 3000, growth: 13.1 },
            { name: 'Denver', orders: 40, revenue: 1800, growth: 12.2 },
            { name: 'San Diego', orders: 34, revenue: 930, growth: 11.6 }
          ]
        },
        {
          name: 'Northeast', revenue: 13800, orders: 334, growth: 11.2,
          cities: [
            { name: 'New York City', orders: 80, revenue: 5200, growth: 14.6 },
            { name: 'Boston', orders: 52, revenue: 3100, growth: 13.2 },
            { name: 'Philadelphia', orders: 46, revenue: 2800, growth: 12.1 },
            { name: 'Newark', orders: 34, revenue: 1500, growth: 9.8 },
            { name: 'Pittsburgh', orders: 28, revenue: 1200, growth: 9.1 }
          ]
        },
        {
          name: 'Southeast', revenue: 9800, orders: 265, growth: 9.6,
          cities: [
            { name: 'Miami', orders: 58, revenue: 3600, growth: 12.4 },
            { name: 'Atlanta', orders: 52, revenue: 3300, growth: 11.8 },
            { name: 'Charlotte', orders: 46, revenue: 2400, growth: 10.9 },
            { name: 'Orlando', orders: 30, revenue: 1500, growth: 9.6 },
            { name: 'Tampa', orders: 24, revenue: 1000, growth: 8.4 }
          ]
        },
        {
          name: 'Midwest', revenue: 8100, orders: 219, growth: 7.8,
          cities: [
            { name: 'Chicago', orders: 60, revenue: 3400, growth: 9.7 },
            { name: 'Minneapolis', orders: 32, revenue: 1700, growth: 8.9 },
            { name: 'Detroit', orders: 30, revenue: 1400, growth: 7.6 },
            { name: 'Columbus', orders: 20, revenue: 900, growth: 7.1 },
            { name: 'Milwaukee', orders: 18, revenue: 700, growth: 6.2 }
          ]
        },
        {
          name: 'Southwest', revenue: 6300, orders: 171, growth: 6.5,
          cities: [
            { name: 'Phoenix', orders: 44, revenue: 2300, growth: 8.6 },
            { name: 'Dallas', orders: 38, revenue: 2000, growth: 7.9 },
            { name: 'Houston', orders: 26, revenue: 1200, growth: 6.4 },
            { name: 'Austin', orders: 22, revenue: 800, growth: 7.2 }
          ]
        }
      ]
    },
    Singapore: {
      label: 'Region',
      plural: 'Regions',
      currency: 'S$',
      group: 'en-US',
      states: [
        {
          name: 'Central', revenue: 10850, orders: 210, growth: 14.2,
          cities: [
            { name: 'Orchard Road', orders: 54, revenue: 3200, growth: 15.6 },
            { name: 'Marina Bay', orders: 44, revenue: 2800, growth: 14.8 },
            { name: 'Bugis', orders: 38, revenue: 1900, growth: 13.1 },
            { name: 'Chinatown', orders: 36, revenue: 1600, growth: 11.4 },
            { name: 'Newton', orders: 38, revenue: 1350, growth: 10.2 }
          ]
        },
        {
          name: 'East', revenue: 7460, orders: 162, growth: 11.6,
          cities: [
            { name: 'Tampines', orders: 48, revenue: 2300, growth: 12.8 },
            { name: 'Bedok', orders: 42, revenue: 1900, growth: 11.6 },
            { name: 'Pasir Ris', orders: 28, revenue: 1400, growth: 10.4 },
            { name: 'Changi', orders: 22, revenue: 1000, growth: 9.7 },
            { name: 'Geylang', orders: 22, revenue: 860, growth: 8.3 }
          ]
        },
        {
          name: 'West', revenue: 6800, orders: 148, growth: 9.8,
          cities: [
            { name: 'Jurong East', orders: 44, revenue: 2100, growth: 11.9 },
            { name: 'Clementi', orders: 32, revenue: 1500, growth: 10.6 },
            { name: 'Bukit Batok', orders: 28, revenue: 1300, growth: 9.1 },
            { name: 'Boon Lay', orders: 24, revenue: 1000, growth: 9.4 },
            { name: 'Tuas', orders: 20, revenue: 900, growth: 8.6 }
          ]
        },
        {
          name: 'North', revenue: 5410, orders: 120, growth: 8.1,
          cities: [
            { name: 'Woodlands', orders: 38, revenue: 1800, growth: 10.4 },
            { name: 'Yishun', orders: 30, revenue: 1400, growth: 9.2 },
            { name: 'Sembawang', orders: 26, revenue: 1100, growth: 8.4 },
            { name: 'Mandai', orders: 26, revenue: 1110, growth: 8.1 }
          ]
        },
        {
          name: 'North-East', revenue: 3400, orders: 78, growth: 6.4,
          cities: [
            { name: 'Punggol', orders: 26, revenue: 1200, growth: 8.8 },
            { name: 'Sengkang', orders: 24, revenue: 1100, growth: 8.1 },
            { name: 'Hougang', orders: 16, revenue: 700, growth: 6.9 },
            { name: 'Serangoon', orders: 12, revenue: 400, growth: 5.8 }
          ]
        }
      ]
    }
  };

  function cfg() {
    return DATA[state.country] || DATA.India;
  }

  function money(v) {
    return cfg().currency + Math.round(v).toLocaleString(cfg().group || 'en-US');
  }

  function pct(g) {
    return (g >= 0 ? '+' : '') + g.toLocaleString('en-US', { maximumFractionDigits: 1 }) + '%';
  }

  function aov(o, r) {
    return o ? Math.round(r / o) : 0;
  }

  function styleHtml() {
    return '<style id="geo-style">' +
      '#geoRoot{font-family:inherit}' +
      '#geoRoot .geo-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-bottom:16px}' +
      '#geoRoot .geo-kpi{background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:16px 18px}' +
      '#geoRoot .geo-kpi .g-lbl{font-size:12px;font-weight:600;color:var(--text-muted,#64748b);margin-bottom:6px}' +
      '#geoRoot .geo-kpi .g-val{font-size:22px;font-weight:700;color:var(--text,#1e293b)}' +
      '#geoRoot .geo-kpi .g-sub{font-size:12px;color:#16A34A;margin-top:4px}' +
      '#geoRoot .geo-sel-wrap{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
      '#geoRoot .geo-select{padding:9px 14px;border:1px solid var(--border,#d1d5db);border-radius:10px;font-size:13px;font-weight:600;font-family:inherit;background:#fff;color:#111827;min-width:230px;outline:none;cursor:pointer}' +
      '#geoRoot .geo-select:focus{border-color:var(--primary,#3b82f6);box-shadow:0 0 0 3px rgba(59,130,246,.12)}' +
      '#geoRoot .geo-hint{font-size:12px;color:#6B7280}' +
      '#geoRoot tr.geo-sel-row{background:rgba(242,178,51,.10)}' +
      '#geoRoot tr.geo-sel-row td{background:transparent}' +
      '#geoRoot .data-table tbody tr{cursor:pointer}' +
      '#geoRoot .data-table tbody tr:hover td{background:#fff8e8}' +
      '#geoRoot .geo-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 11px;border-radius:20px;font-size:11px;font-weight:700;background:#F2B23314;color:#B45309;border:1px solid #F2B23333;white-space:nowrap}' +
      '#geoRoot .geo-mini{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:14px}' +
      '#geoRoot .geo-mini-box{background:#f9fafb;border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:12px 14px}' +
      '#geoRoot .geo-mini-box .g-m-lbl{font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.4px}' +
      '#geoRoot .geo-mini-box .g-m-val{font-size:17px;font-weight:800;color:#111827;margin-top:3px}' +
      '</style>';
  }

  function kpiHtml() {
    var d = cfg();
    var top = d.states.slice().sort(function (a, b) { return b.revenue - a.revenue; })[0];
    var total = d.states.reduce(function (s, x) { return s + x.revenue; }, 0);
    var metro = d.states.reduce(function (s, x) {
      var c = x.cities.slice().sort(function (a, b) { return b.revenue - a.revenue; })[0];
      return s + c.revenue;
    }, 0);
    var fastest = d.states.slice().sort(function (a, b) { return b.growth - a.growth; })[0];
    var cards = [
      { lbl: 'Top ' + d.label, val: top.name, sub: money(top.revenue) + ' revenue' },
      { lbl: d.plural + ' Served', val: String(d.states.length), sub: 'active this quarter' },
      { lbl: 'Metro Cities Revenue', val: money(metro), sub: Math.round(metro / total * 100) + '% of total' },
      { lbl: 'Fastest Growth', val: pct(fastest.growth), sub: fastest.name }
    ];
    return '<div class="geo-kpis">' + cards.map(function (c) {
      return '<div class="geo-kpi"><div class="g-lbl">' + c.lbl + '</div><div class="g-val">' + c.val + '</div><div class="g-sub">' + c.sub + '</div></div>';
    }).join('') + '</div>';
  }

  function stateTableHtml() {
    var d = cfg();
    var rows = d.states.map(function (s) {
      var aovV = aov(s.orders, s.revenue);
      var isSel = state.selected === s.name;
      return '<tr class="' + (isSel ? 'geo-sel-row' : '') + '" onclick="GeoReport.selectGeo(\'' + s.name + '\')" title="Click to view ' + s.name + ' cities">' +
        '<td><strong>' + s.name + '</strong>' + (isSel ? ' <i class="fas fa-check-circle" style="color:#D97706;margin-left:4px"></i>' : ' <i class="fas fa-chevron-circle-down" style="color:#9CA3AF;font-size:11px;margin-left:4px"></i>') + '</td>' +
        '<td>' + money(s.revenue) + '</td>' +
        '<td>' + s.orders.toLocaleString(d.group || 'en-US') + '</td>' +
        '<td>' + money(aovV) + '</td>' +
        '<td><span style="color:#22C55E">' + pct(s.growth) + '</span></td>' +
      '</tr>';
    }).join('');
    var opts = '<option value="">Select a ' + d.label + '\u2026</option>' + d.states.map(function (s) {
      return '<option value="' + s.name + '"' + (state.selected === s.name ? ' selected' : '') + '>' + s.name + '</option>';
    }).join('');
    return '<div class="card"><div class="card-header" style="flex-wrap:wrap;gap:10px">' +
        '<h3><i class="fas fa-map-marker-alt"></i> ' + d.label + '-wise Performance</h3>' +
        '<div class="geo-sel-wrap">' +
          '<span class="geo-hint"><i class="fas fa-hand-pointer"></i> Pick a ' + d.label + ' (dropdown) or click any row to view its city-wise details:</span>' +
          '<select class="geo-select" onchange="GeoReport.selectGeo(this.value)">' + opts + '</select>' +
        '</div>' +
      '</div><div class="card-body"><div style="overflow-x:auto">' +
        '<table class="data-table"><thead><tr><th>' + d.label + '</th><th>Revenue</th><th>Orders</th><th>Avg Order Value</th><th>Growth</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>' +
      '</div></div></div>';
  }

  function cityDetailHtml() {
    if (!state.selected) return '';
    var d = cfg();
    var st = null;
    d.states.forEach(function (s) { if (s.name === state.selected) st = s; });
    if (!st) return '';
    var totalRev = st.cities.reduce(function (s, c) { return s + c.revenue; }, 0);
    var totalOrd = st.cities.reduce(function (s, c) { return s + c.orders; }, 0);
    var topCity = st.cities.slice().sort(function (a, b) { return b.revenue - a.revenue; })[0];
    var fastest = st.cities.slice().sort(function (a, b) { return b.growth - a.growth; })[0];
    var rows = st.cities.map(function (c) {
      return '<tr><td><strong>' + c.name + '</strong></td>' +
        '<td>' + c.orders.toLocaleString(d.group || 'en-US') + '</td>' +
        '<td>' + money(c.revenue) + '</td>' +
        '<td>' + money(aov(c.orders, c.revenue)) + '</td>' +
        '<td><span style="color:#22C55E">' + pct(c.growth) + '</span></td></tr>';
    }).join('');
    var mini = [
      { l: 'Cities Served', v: String(st.cities.length) },
      { l: 'Total Revenue', v: money(totalRev) },
      { l: 'Total Orders', v: String(totalOrd) },
      { l: 'Top City', v: topCity.name },
      { l: 'Fastest Growth', v: fastest.name }
    ];
    return '<div class="card" style="margin-top:16px;border-color:#F2B23355;box-shadow:0 8px 22px rgba(242,178,51,.10)">' +
      '<div class="card-header" style="flex-wrap:wrap;gap:10px"><h3><i class="fas fa-city"></i> ' + st.name + ' \u2014 City-wise Details</h3><span class="geo-chip"><i class="fas fa-map-pin"></i> ' + st.name + '</span></div>' +
      '<div class="card-body">' +
        '<div class="geo-mini">' + mini.map(function (m) {
          return '<div class="geo-mini-box"><div class="g-m-lbl">' + m.l + '</div><div class="g-m-val">' + m.v + '</div></div>';
        }).join('') + '</div>' +
        '<div style="overflow-x:auto"><table class="data-table"><thead><tr><th>City</th><th>Orders</th><th>Revenue</th><th>Avg Order Value</th><th>Growth</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</div></div>';
  }

  function render() {
    var root = document.getElementById(state.rootId);
    if (!root) return;
    if (!document.getElementById('geo-style')) {
      var s = document.createElement('style');
      s.id = 'geo-style';
      s.textContent = styleHtml().replace(/<style[^>]*>/, '').replace(/<\/style>\s*$/, '');
      document.head.appendChild(s);
    }
    root.innerHTML = stateTableHtml() + cityDetailHtml();
  }

  function selectGeo(name) {
    state.selected = name || '';
    render();
  }

  window.GeoReport = {
    configure: function (opts) {
      opts = opts || {};
      state.country = opts.country || 'India';
      state.rootId = opts.rootId || 'geoRoot';
      state.selected = '';
    },
    render: render,
    selectGeo: selectGeo,
    clearGeo: function () { selectGeo(''); },
    getData: function () { return DATA; }
  };
  return window.GeoReport;
})();
