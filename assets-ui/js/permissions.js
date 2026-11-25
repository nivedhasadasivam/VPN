/* VPNexues Permissions
 * Standalone module permission definitions used by sub admin management.
 * Not referenced by any page directly; provided as a shared utility.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'vpnexues_permissions';

  var MODULES = [
    { key: 'dashboard', label: 'Dashboard', actions: ['view'] },
    { key: 'orders', label: 'Orders', actions: ['view', 'update', 'export', 'delete'] },
    { key: 'users', label: 'Users', actions: ['view', 'add', 'edit', 'delete', 'export'] },
    { key: 'products', label: 'Products', actions: ['view', 'edit', 'delete'] },
    { key: 'payments', label: 'Payments', actions: ['view', 'export'] },
    { key: 'support', label: 'Support', actions: ['view', 'reply', 'export'] },
    { key: 'countries', label: 'Countries', actions: ['view', 'edit'] },
    { key: 'settings', label: 'Settings', actions: ['view', 'edit'] }
  ];

  function defaultPermissions() {
    var map = {};
    MODULES.forEach(function (m) {
      map[m.key] = {};
      m.actions.forEach(function (a) { map[m.key][a] = true; });
    });
    return map;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var def = defaultPermissions();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(def)); } catch (e2) {}
    return def;
  }

  function save(map) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch (e) {}
  }

  var Permissions = {
    getModules: function () {
      return MODULES;
    },

    getPermissions: function () {
      return load();
    },

    hasPermission: function (module, action) {
      var map = load();
      return !!(map && map[module] && map[module][action]);
    },

    setPermissions: function (map) {
      save(map || defaultPermissions());
    },

    reset: function () {
      save(defaultPermissions());
    }
  };

  window.Permissions = Permissions;
})();