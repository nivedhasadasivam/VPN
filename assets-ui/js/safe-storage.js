(function () {
  function inMemory() {
    var map = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null; },
      setItem: function (k, v) { map[k] = String(v); },
      removeItem: function (k) { delete map[k]; },
      clear: function () { map = {}; },
      key: function (i) { var keys = Object.keys(map); return keys[i] || null; },
      get length() { return Object.keys(map).length; }
    };
  }
  function pageSeed() {
    var f = (window.location.pathname.split('/').pop() || '').toLowerCase();
    var seed = { vpnexuesAuth: 'true', vpnexuesLoginTime: '1' };
    if (f.indexOf('sub-admin-india') === 0) { seed.vpnexuesRole = 'sub-admin'; seed.vpnexuesEmail = 'india@vpnexues.com'; seed.vpnexuesCountry = 'India'; }
    else if (f.indexOf('sub-admin-us') === 0) { seed.vpnexuesRole = 'sub-admin'; seed.vpnexuesEmail = 'us@vpnexues.com'; seed.vpnexuesCountry = 'US'; }
    else if (f.indexOf('sub-admin-uae') === 0) { seed.vpnexuesRole = 'sub-admin'; seed.vpnexuesEmail = 'uae@vpnexues.com'; seed.vpnexuesCountry = 'UAE'; }
    else if (f.indexOf('sub-admin-singapore') === 0) { seed.vpnexuesRole = 'sub-admin'; seed.vpnexuesEmail = 'singapore@vpnexues.com'; seed.vpnexuesCountry = 'Singapore'; }
    else if (f.indexOf('super-admin') === 0) { seed.vpnexuesRole = 'super-admin'; seed.vpnexuesEmail = 'superadmin@vpnexues.com'; seed.vpnexuesCountry = 'Global'; }
    return seed;
  }
  var usable = true;
  try {
    var probe = '__safe_storage_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
  } catch (e) { usable = false; }
  if (!usable) {
    var fb = inMemory();
    var seed = pageSeed();
    for (var k in seed) { fb.setItem(k, seed[k]); }
    try {
      Object.defineProperty(window, 'localStorage', { value: fb, configurable: true, writable: true });
    } catch (e) {
      try { window.localStorage = fb; } catch (e2) {}
    }
  }
})();