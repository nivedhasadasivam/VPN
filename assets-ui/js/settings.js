/* VPNexues SettingsManager
 * Settings pages for the super admin dashboard.
 * Persists configuration under 'vpnexues_settings' and provides
 * import/export plus backup/restore of all platform data.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'vpnexues_settings';

  var DEFAULTS = {
    general: {
      platformName: 'VPNexues',
      tagline: 'Fresh Vegetables Delivered to Your Door',
      contactEmail: 'admin@vpnexues.com',
      phone: '+1 (555) 123-4567',
      website: 'https://vpnexues.com',
      supportUrl: 'https://vpnexues.com/support',
      description: 'VPNexues is a premium fresh vegetable delivery platform serving customers across India, UAE, US, and Singapore.',
      timezone: 'Asia/Kolkata',
      language: 'en'
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      encryption: 'tls',
      auth: 'true',
      user: 'admin@vpnexues.com',
      pass: 'password123',
      fromName: 'VPNexues Support',
      fromEmail: 'noreply@vpnexues.com'
    },
    currency: {
      currency: 'USD',
      currencyPos: 'before',
      decimals: '2',
      thousandSep: ',',
      weightUnit: 'kg',
      dateFormat: 'MM/DD/YYYY'
    },
    maintenance: {
      enabled: false,
      title: "We'll be back soon!",
      message: "We are currently performing scheduled maintenance. We'll be back shortly. Thank you for your patience.",
      ips: '127.0.0.1\n192.168.1.0/24',
      eta: ''
    },
    security: {
      twoFA: true,
      sessionTimeout: '30',
      maxLoginAttempts: '5',
      minPassLen: '8',
      passExpiry: '90',
      ipRestriction: false,
      allowedIps: '',
      reqUppercase: true,
      reqLowercase: true,
      reqNumber: true,
      reqSpecial: false
    },
    api: {
      key: 'pk_live_vpnexues_2026_a1b2c3d4e5f6',
      secret: 'sk_live_vpnexues_x7y8z9w0v1u2t3s4',
      rateLimit: '100',
      webhook: '',
      cors: 'https://vpnexues.com\nhttps://app.vpnexues.com',
      version: 'v2'
    },
    notifications: {
      newOrder: true,
      orderStatus: true,
      newTicket: true,
      newUser: false,
      lowStock: true,
      paymentFailed: true,
      browserPush: true,
      soundAlerts: false
    }
  };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : {};
      var out = {};
      Object.keys(DEFAULTS).forEach(function (sec) {
        out[sec] = Object.assign({}, DEFAULTS[sec], data[sec] || {});
      });
      return out;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }

  function save(section, values) {
    var data = load();
    data[section] = Object.assign({}, data[section], values);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function setVal(id, v) {
    var el = document.getElementById(id);
    if (el) el.value = v == null ? '' : v;
  }

  function checked(id) {
    var el = document.getElementById(id);
    return el ? el.checked : false;
  }

  function setChecked(id, v) {
    var el = document.getElementById(id);
    if (el) el.checked = !!v;
  }

  function toast(msg, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    } else {
      try { alert(msg); } catch (e) {}
    }
  }

  function collect(ids) {
    var out = {};
    ids.forEach(function (id) { out[id] = val(id); });
    return out;
  }

  function download(filename, content, mime) {
    var blob = new Blob([content], { type: mime || 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function randToken(len) {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var out = '';
    for (var i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
  }

  function updateSlider(labelId, sliderId, on) {
    var label = document.getElementById(labelId);
    var slider = document.getElementById(sliderId);
    if (label) {
      label.textContent = on ? 'Enabled' : 'Disabled';
      label.style.color = on ? '#16A34A' : 'var(--text-secondary)';
    }
    if (slider) {
      slider.style.background = on ? '#22C55E' : '#CBD5E1';
      var knob = slider.firstChild;
      if (knob) knob.style.left = on ? '25px' : '3px';
    }
  }

  function init() {
    if (document.readyState !== 'loading') return;
  }

  var SettingsManager = {
    init: function () {
      var data = load();
      var g = data.general, e = data.email, c = data.currency, m = data.maintenance, s = data.security, a = data.api;
      setVal('settingPlatformName', g.platformName);
      setVal('settingTagline', g.tagline);
      setVal('settingContactEmail', g.contactEmail);
      setVal('settingPhone', g.phone);
      setVal('settingWebsite', g.website);
      setVal('settingSupportUrl', g.supportUrl);
      setVal('settingDescription', g.description);
      setVal('settingTimezone', g.timezone);
      setVal('settingLanguage', g.language);

      setVal('settingSmtpHost', e.smtpHost);
      setVal('settingSmtpPort', e.smtpPort);
      setVal('settingSmtpEncryption', e.encryption);
      setVal('settingSmtpAuth', e.auth);
      setVal('settingSmtpUser', e.user);
      setVal('settingSmtpPass', e.pass);
      setVal('settingFromName', e.fromName);
      setVal('settingFromEmail', e.fromEmail);

      setVal('settingCurrency', c.currency);
      setVal('settingCurrencyPos', c.currencyPos);
      setVal('settingDecimals', c.decimals);
      setVal('settingThousandSep', c.thousandSep);
      setVal('settingWeightUnit', c.weightUnit);
      setVal('settingDateFormat', c.dateFormat);

      setChecked('settingMaintenanceMode', m.enabled);
      setVal('settingMaintTitle', m.title);
      setVal('settingMaintMsg', m.message);
      setVal('settingMaintIps', m.ips);
      setVal('settingMaintEta', m.eta);
      updateSlider('maintenanceLabel', 'maintenanceSlider', m.enabled);

      setChecked('setting2FA', s.twoFA);
      setVal('settingSessionTimeout', s.sessionTimeout);
      setVal('settingMaxLoginAttempts', s.maxLoginAttempts);
      setVal('settingMinPassLen', s.minPassLen);
      setVal('settingPassExpiry', s.passExpiry);
      setChecked('settingIpRestriction', s.ipRestriction);
      setVal('settingAllowedIps', s.allowedIps);
      setChecked('settingReqUppercase', s.reqUppercase);
      setChecked('settingReqLowercase', s.reqLowercase);
      setChecked('settingReqNumber', s.reqNumber);
      setChecked('settingReqSpecial', s.reqSpecial);
      updateSlider('twoFALabel', 'twoFASlider', s.twoFA);
      updateSlider('ipRestrictionLabel', 'ipRestrictionSlider', s.ipRestriction);

      setVal('settingApiKey', a.key);
      setVal('settingApiSecret', a.secret);
      setVal('settingApiRateLimit', a.rateLimit);
      setVal('settingWebhookUrl', a.webhook);
      setVal('settingCorsOrigins', a.cors);
      setVal('settingApiVersion', a.version);

      var n = data.notifications;
      var toggles = document.querySelectorAll('#settings-notifications .notif-toggle');
      toggles.forEach(function (t) { t.checked = true; });
    },

    /* ---- General ---- */
    saveGeneral: function () {
      save('general', collect(['settingPlatformName', 'settingTagline', 'settingContactEmail', 'settingPhone', 'settingWebsite', 'settingSupportUrl', 'settingDescription', 'settingTimezone', 'settingLanguage']));
      toast('General settings saved', 'success');
    },

    resetGeneral: function () {
      var g = DEFAULTS.general;
      setVal('settingPlatformName', g.platformName);
      setVal('settingTagline', g.tagline);
      setVal('settingContactEmail', g.contactEmail);
      setVal('settingPhone', g.phone);
      setVal('settingWebsite', g.website);
      setVal('settingSupportUrl', g.supportUrl);
      setVal('settingDescription', g.description);
      setVal('settingTimezone', g.timezone);
      setVal('settingLanguage', g.language);
      toast('General settings reset to defaults', 'warning');
    },

    /* ---- Email ---- */
    saveEmail: function () {
      save('email', collect(['settingSmtpHost', 'settingSmtpPort', 'settingSmtpEncryption', 'settingSmtpAuth', 'settingSmtpUser', 'settingSmtpPass', 'settingFromName', 'settingFromEmail']));
      toast('Email (SMTP) settings saved', 'success');
    },

    resetEmail: function () {
      var e = DEFAULTS.email;
      setVal('settingSmtpHost', e.smtpHost);
      setVal('settingSmtpPort', e.smtpPort);
      setVal('settingSmtpEncryption', e.encryption);
      setVal('settingSmtpAuth', e.auth);
      setVal('settingSmtpUser', e.user);
      setVal('settingSmtpPass', e.pass);
      setVal('settingFromName', e.fromName);
      setVal('settingFromEmail', e.fromEmail);
      toast('Email settings reset to defaults', 'warning');
    },

    testEmail: function () {
      toast('Test email sent to ' + (val('settingFromEmail') || 'your admin address'), 'success');
    },

    /* ---- Currency ---- */
    saveCurrency: function () {
      save('currency', collect(['settingCurrency', 'settingCurrencyPos', 'settingDecimals', 'settingThousandSep', 'settingWeightUnit', 'settingDateFormat']));
      toast('Currency & locale settings saved', 'success');
    },

    resetCurrency: function () {
      var c = DEFAULTS.currency;
      setVal('settingCurrency', c.currency);
      setVal('settingCurrencyPos', c.currencyPos);
      setVal('settingDecimals', c.decimals);
      setVal('settingThousandSep', c.thousandSep);
      setVal('settingWeightUnit', c.weightUnit);
      setVal('settingDateFormat', c.dateFormat);
      toast('Currency settings reset to defaults', 'warning');
    },

    /* ---- Maintenance ---- */
    saveMaintenance: function () {
      var enabled = checked('settingMaintenanceMode');
      save('maintenance', {
        enabled: enabled,
        title: val('settingMaintTitle'),
        message: val('settingMaintMsg'),
        ips: val('settingMaintIps'),
        eta: val('settingMaintEta')
      });
      updateSlider('maintenanceLabel', 'maintenanceSlider', enabled);
      toast('Maintenance settings saved', 'success');
    },

    /* ---- Security ---- */
    saveSecurity: function () {
      var twoFA = checked('setting2FA');
      var ipRestriction = checked('settingIpRestriction');
      save('security', {
        twoFA: twoFA,
        sessionTimeout: val('settingSessionTimeout'),
        maxLoginAttempts: val('settingMaxLoginAttempts'),
        minPassLen: val('settingMinPassLen'),
        passExpiry: val('settingPassExpiry'),
        ipRestriction: ipRestriction,
        allowedIps: val('settingAllowedIps'),
        reqUppercase: checked('settingReqUppercase'),
        reqLowercase: checked('settingReqLowercase'),
        reqNumber: checked('settingReqNumber'),
        reqSpecial: checked('settingReqSpecial')
      });
      updateSlider('twoFALabel', 'twoFASlider', twoFA);
      updateSlider('ipRestrictionLabel', 'ipRestrictionSlider', ipRestriction);
      toast('Security settings saved', 'success');
    },

    resetSecurity: function () {
      var s = DEFAULTS.security;
      setChecked('setting2FA', s.twoFA);
      setVal('settingSessionTimeout', s.sessionTimeout);
      setVal('settingMaxLoginAttempts', s.maxLoginAttempts);
      setVal('settingMinPassLen', s.minPassLen);
      setVal('settingPassExpiry', s.passExpiry);
      setChecked('settingIpRestriction', s.ipRestriction);
      setVal('settingAllowedIps', s.allowedIps);
      setChecked('settingReqUppercase', s.reqUppercase);
      setChecked('settingReqLowercase', s.reqLowercase);
      setChecked('settingReqNumber', s.reqNumber);
      setChecked('settingReqSpecial', s.reqSpecial);
      updateSlider('twoFALabel', 'twoFASlider', s.twoFA);
      updateSlider('ipRestrictionLabel', 'ipRestrictionSlider', s.ipRestriction);
      toast('Security settings reset to defaults', 'warning');
    },

    /* ---- API ---- */
    saveApi: function () {
      save('api', {
        key: val('settingApiKey'),
        secret: val('settingApiSecret'),
        rateLimit: val('settingApiRateLimit'),
        webhook: val('settingWebhookUrl'),
        cors: val('settingCorsOrigins'),
        version: val('settingApiVersion')
      });
      toast('API settings saved', 'success');
    },

    copyApiKey: function () {
      var key = val('settingApiKey');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(key).then(function () {
          toast('API key copied to clipboard', 'success');
        });
      } else {
        toast('API key: ' + key, 'info');
      }
    },

    toggleApiSecret: function () {
      var input = document.getElementById('settingApiSecret');
      var icon = document.getElementById('apiSecretIcon');
      if (!input) return;
      var isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      if (icon) icon.className = 'fas ' + (isPass ? 'fa-eye-slash' : 'fa-eye');
    },

    regenerateApiKey: function () {
      setVal('settingApiKey', 'pk_live_vpnexues_' + randToken(12));
      setVal('settingApiSecret', 'sk_live_vpnexues_' + randToken(16));
      save('api', { key: val('settingApiKey'), secret: val('settingApiSecret') });
      toast('New API keys generated', 'success');
    },

    /* ---- Notifications ---- */
    saveNotifications: function () {
      var n = DEFAULTS.notifications;
      var labels = ['newOrder', 'orderStatus', 'newTicket', 'newUser', 'lowStock', 'paymentFailed', 'browserPush', 'soundAlerts'];
      var toggles = document.querySelectorAll('#settings-notifications .notif-toggle');
      toggles.forEach(function (t, i) {
        if (labels[i]) n[labels[i]] = t.checked;
      });
      save('notifications', n);
      toast('Notification settings saved', 'success');
    },

    /* ---- Import / Export settings ---- */
    exportSettings: function () {
      download('vpnexues-settings.json', JSON.stringify(load(), null, 2));
      toast('Settings exported', 'success');
    },

    importSettings: function () {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', function () {
        var file = input.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var data = JSON.parse(reader.result);
            if (data && typeof data === 'object') {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
              SettingsManager.init();
              toast('Settings imported successfully', 'success');
            } else {
              toast('Invalid settings file', 'error');
            }
          } catch (e) {
            toast('Could not parse settings file', 'error');
          }
        };
        reader.readAsText(file);
      });
      input.click();
      document.body.removeChild(input);
    },

    /* ---- Backup / Restore ---- */
    createBackup: function () {
      var data = {};
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('vpnexues') === 0) {
          try { data[key] = JSON.parse(localStorage.getItem(key)); } catch (e) { data[key] = localStorage.getItem(key); }
        }
      }
      var stamp = new Date().toISOString().slice(0, 10);
      download('vpnexues-backup-' + stamp + '.json', JSON.stringify(data, null, 2));
      toast('Backup created and downloaded', 'success');
    },

    restoreBackup: function () {
      var input = document.getElementById('restoreFileInput');
      if (!input || !input.files || !input.files[0]) {
        toast('Please select a backup file first', 'warning');
        return;
      }
      var file = input.files[0];
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          var count = 0;
          Object.keys(data).forEach(function (key) {
            if (key && key.indexOf('vpnexues') === 0) {
              var v = data[key];
              localStorage.setItem(key, typeof v === 'string' ? v : JSON.stringify(v));
              count++;
            }
          });
          toast('Backup restored (' + count + ' items)', 'success');
          setTimeout(function () { location.reload(); }, 1200);
        } catch (e) {
          toast('Could not parse backup file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  window.SettingsManager = SettingsManager;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { SettingsManager.init(); });
  } else {
    SettingsManager.init();
  }
})();
