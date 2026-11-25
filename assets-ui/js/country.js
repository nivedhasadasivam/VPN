/**
 * VPNexues Country Module
 * Reusable country storage, formatting, and price rendering.
 * Loaded on every page. Only index.html shows the country pill.
 *
 * Usage:
 *   VPNexuesCountry.get()           ââ â current country code
 *   VPNexuesCountry.save('SG')      ââ â save country
 *   VPNexuesCountry.format(3.50)    ââ â "S$3.50" / "ââ¹217" / "$2.59" / "AED 9.52"
 *   VPNexuesCountry.update()        ââ â re-renders [data-country-price] elements
 *   VPNexuesCountry.getFlag('IN')   ââ â flag image URL
 *   VPNexuesCountry.config          ââ â PRICE_CONFIG object
 */

(function () {
  'use strict';

  /* ââ¢ââ¢ââ¢ââ¢ CONSTANTS ââ¢ââ¢ââ¢ââ¢ */
  var STORAGE_KEY = 'country';
  var DETECTED_KEY = 'vpnexues_detected_country';
  var SUPPORTED = ['IN', 'SG', 'US', 'AE'];
  var DELIVERY_SUPPORTED = ['IN', 'SG', 'US', 'AE'];
  var DEFAULT_COUNTRY = 'IN';
  var COUNTRY_DISPLAY = { GB:'UK', AE:'UAE' };

  /* ââ¢ââ¢ââ¢ââ¢ PRICE CONFIG ââ¢ââ¢ââ¢ââ¢ */
  var PRICE_CONFIG = {
    IN: { rate: 62,    prefix: '\u20B9',  locale: 'en-IN', digits: 0 },
    SG: { rate: 1,     prefix: 'S$',     locale: 'en-SG', digits: 2 },
    US: { rate: 0.74,  prefix: '$',      locale: 'en-US', digits: 2 },
    AE: { rate: 2.72,  prefix: 'AED ',   locale: 'en-AE', digits: 2 }
  };

  /* ââ¢ââ¢ââ¢ââ¢ GEOIP ââ¢ââ¢ââ¢ââ¢ */
  var GEOIP_URLS = [
    'https://ipapi.co/json/',
    'https://ipwho.is/',
    'https://get.geojs.io/v1/ip/geo.json',
    'https://ipinfo.io/json'
  ];
  var GEOIP_TIMEOUT = 6000;

  /* ââ¢ââ¢ââ¢ââ¢ HELPERS ââ¢ââ¢ââ¢ââ¢ */

  var SUPA = 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets';
  var FLAG_MAP = {
    'in': 'in-flag.svg', 'us': 'us flag.png', 'sg': 'sg-flag.png',
    'ae': 'uae flag.png', 'gb': 'us flag.png', 'au': 'us flag.png',
    'my': 'sg-flag.png', 'sa': 'uae flag.png', 'ca': 'us flag.png',
    'de': 'us flag.png', 'fr': 'us flag.png', 'jp': 'us flag.png',
    'cn': 'us flag.png', 'br': 'us flag.png', 'mx': 'us flag.png'
  };
  function getFlag(code) {
    var c = (code || '').toLowerCase();
    if (FLAG_MAP[c]) return SUPA + '/' + encodeURIComponent(FLAG_MAP[c]);
    return SUPA + '/in-flag.svg';
  }

  function getPhoneConfig(code) {
    var c = (code || '').toUpperCase();
    var map = {
      IN: { phoneCode: '91', digits: 10 },
      SG: { phoneCode: '65', digits: 8 },
      US: { phoneCode: '1', digits: 10 },
      AE: { phoneCode: '971', digits: 9 },
      GB: { phoneCode: '44', digits: 10 },
      DE: { phoneCode: '49', digits: 10 },
      FR: { phoneCode: '33', digits: 9 },
      JP: { phoneCode: '81', digits: 10 },
      KR: { phoneCode: '82', digits: 10 },
      CN: { phoneCode: '86', digits: 11 },
      AU: { phoneCode: '61', digits: 9 },
      CA: { phoneCode: '1', digits: 10 },
      BR: { phoneCode: '55', digits: 11 },
      RU: { phoneCode: '7', digits: 10 },
      ZA: { phoneCode: '27', digits: 9 },
      NG: { phoneCode: '234', digits: 10 },
      EG: { phoneCode: '20', digits: 10 },
      SA: { phoneCode: '966', digits: 9 },
      TR: { phoneCode: '90', digits: 10 },
      PK: { phoneCode: '92', digits: 10 },
      BD: { phoneCode: '880', digits: 10 },
      LK: { phoneCode: '94', digits: 9 },
      NP: { phoneCode: '977', digits: 10 },
      TH: { phoneCode: '66', digits: 9 },
      VN: { phoneCode: '84', digits: 9 },
      MY: { phoneCode: '60', digits: 9 },
      PH: { phoneCode: '63', digits: 10 },
      ID: { phoneCode: '62', digits: 10 },
      MX: { phoneCode: '52', digits: 10 },
      IT: { phoneCode: '39', digits: 10 },
      ES: { phoneCode: '34', digits: 9 },
      NL: { phoneCode: '31', digits: 9 },
      SE: { phoneCode: '46', digits: 9 },
      NO: { phoneCode: '47', digits: 8 },
      DK: { phoneCode: '45', digits: 8 },
      FI: { phoneCode: '358', digits: 9 },
      PL: { phoneCode: '48', digits: 9 },
      IE: { phoneCode: '353', digits: 9 },
      NZ: { phoneCode: '64', digits: 8 }
    };
    return map[c] || { phoneCode: '1', digits: 10 };
  }

  function normalizePriceCountry(code) {
    var c = (code || '').toUpperCase();
    if (PRICE_CONFIG[c]) return c;
    return DEFAULT_COUNTRY;
  }

  /* ââ¢ââ¢ââ¢ââ¢ STORAGE ââ¢ââ¢ââ¢ââ¢ */

  function loadDetected() {
    return (localStorage.getItem(DETECTED_KEY) || '').toUpperCase();
  }

  function saveDetected(code) {
    if (code && code.length === 2) {
      localStorage.setItem(DETECTED_KEY, code.toUpperCase());
    }
  }

  function load() {
    var saved = (localStorage.getItem(STORAGE_KEY) || '').toUpperCase();
    if (PRICE_CONFIG[saved]) return saved;
    return DEFAULT_COUNTRY;
  }

  function save(code) {
    var c = normalizePriceCountry(code);
    localStorage.setItem(STORAGE_KEY, c);
    return c;
  }

  function get() { return load(); }

  function setManual(code) { return save(code); }

  /* ââ¢ââ¢ââ¢ââ¢ FORMAT ââ¢ââ¢ââ¢ââ¢ */

  function format(value) {
    var country = load();
    var config = PRICE_CONFIG[country];
    var amount = Number(value || 0) * config.rate;
    return config.prefix + amount.toLocaleString(config.locale, {
      minimumFractionDigits: config.digits,
      maximumFractionDigits: config.digits
    });
  }

  function getFlagUrl(code) {
    return getFlag(code);
  }

  /* ââ¢ââ¢ââ¢ââ¢ GEOIP ââ¢ââ¢ââ¢ââ¢ */

  function fetchGeoIP(url) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        console.warn('[Country] GeoIP timeout:', url);
        reject(new Error('timeout'));
      }, GEOIP_TIMEOUT);
      fetch(url, { cache: 'no-store', mode: 'cors', headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('geoip ' + res.status);
          return res.json();
        })
        .then(function (data) {
          clearTimeout(timer);
          var code = data && (data.country_code || data.country);
          console.log('[Country] GeoIP success:', url, 'ââ â', code);
          resolve(code || null);
        })
        .catch(function (err) {
          clearTimeout(timer);
          console.warn('[Country] GeoIP failed:', url, err.message || err);
          reject(err);
        });
    });
  }

  function detectViaGeoIP() {
    var idx = 0;
    function tryNext() {
      if (idx >= GEOIP_URLS.length) {
        console.log('[Country] All GeoIP services failed, trying timezone fallback');
        return Promise.resolve(detectViaTimezone());
      }
      var url = GEOIP_URLS[idx++];
      return fetchGeoIP(url).catch(function () { return tryNext(); });
    }
    return tryNext();
  }

  function detectViaTimezone() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return null;
      console.log('[Country] Timezone detected:', tz);
      if (/^(Asia\/Kolkata|Asia\/Calcutta|Asia\/Kolkata|Asia\/Dhaka|Asia\/Colombo|Asia\/Kathmandu)/.test(tz)) return 'IN';
      if (/^(Asia\/Singapore|Asia\/Kuala_Lumpur|Asia\/Jakarta|Asia\/Brunei|Asia\/Hong_Kong|Asia\/Makassar)/.test(tz)) return 'SG';
      if (/^(America\/|US\/|Canada\/)/.test(tz)) return 'US';
      if (/^(Asia\/Dubai|Asia\/Muscat|Asia\/Bahrain|Asia\/Kuwait|Asia\/Qatar|Asia\/Riyadh)/.test(tz)) return 'AE';
      if (/^(Australia\/|Pacific\/Auckland|Pacific\/Fiji)/.test(tz)) return 'SG';
      if (/^(Europe\/|Atlantic\/|Africa\/)/.test(tz)) return 'AE';
      if (/^(Asia\/)/.test(tz)) return 'IN';
    } catch (e) {
      console.warn('[Country] Timezone detection failed:', e);
    }
    return null;
  }

  /* ââ¢ââ¢ââ¢ââ¢ UPDATE ââ¢ââ¢ââ¢ââ¢ */

  function update(country) {
    var c = normalizePriceCountry(country || load());
    syncUI(c);
    var elements = document.querySelectorAll('[data-country-price]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var basePrice = el.getAttribute('data-country-price');
      if (basePrice !== null) {
        el.textContent = format(basePrice);
      }
    }
    document.dispatchEvent(new CustomEvent('vpn-country-price-change', {
      detail: { country: c }
    }));
  }

  /* ââ¢ââ¢ââ¢ââ¢ DETECT ââ¢ââ¢ââ¢ââ¢ */

  function detectCountry(options) {
    options = options || {};
    var opts = { force: !!options.force, silent: !!options.silent };
    var currentDetected = loadDetected();

    console.log('[Country] detectCountry: force=', opts.force, 'detected=', currentDetected);

    if (currentDetected && !opts.force) {
      syncUI(currentDetected);
      return Promise.resolve(currentDetected);
    }

    return detectViaGeoIP()
      .then(function (rawCode) {
        var c = (rawCode || '').toUpperCase();
        if (!c || c.length !== 2) c = DEFAULT_COUNTRY;
        console.log('[Country] GeoIP result:', rawCode, 'ââ â', c);
        saveDetected(c);
        save(c);
        syncUI(c);
        if (!opts.silent) {
          var elements = document.querySelectorAll('[data-country-price]');
          for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var basePrice = el.getAttribute('data-country-price');
            if (basePrice !== null) {
              el.textContent = format(basePrice);
            }
          }
          document.dispatchEvent(new CustomEvent('vpn-country-price-change', {
            detail: { country: c, rawCountry: rawCode }
          }));
        }
        return c;
      })
      .catch(function (err) {
        console.warn('[Country] detectCountry failed, trying timezone fallback:', err);
        var tzCountry = detectViaTimezone();
        var fallback = tzCountry || DEFAULT_COUNTRY;
        console.log('[Country] Fallback country:', fallback);
        saveDetected(fallback);
        save(fallback);
        syncUI(fallback);
        return fallback;
      });
  }

  /* ââ¢ââ¢ââ¢ââ¢ SYNC UI ââ¢ââ¢ââ¢ââ¢ */

  function syncUI(code) {
    var detected = loadDetected();
    var flagCode = detected || code || DEFAULT_COUNTRY;
    var flagSrc = getFlag(flagCode);
    var priceCountry = normalizePriceCountry(flagCode);

    console.log('[Country] syncUI: flag=', flagCode, 'price=', priceCountry);

    var flagImg = document.getElementById('flagImg') || document.getElementById('header-country-flag');
    var countryCodeEl = document.getElementById('headerCountryCode') || document.getElementById('header-country-code');
    if (flagImg) { flagImg.src = flagSrc; }
    if (countryCodeEl) countryCodeEl.textContent = COUNTRY_DISPLAY[flagCode] || flagCode;

    var flagImgM = document.getElementById('header-country-flag-m');
    if (flagImgM) { flagImgM.src = flagSrc; }
  }

  /* ââ¢ââ¢ââ¢ââ¢ TOAST ââ¢ââ¢ââ¢ââ¢ */

  var TOAST_SHOWN_KEY = 'vpnexues_toast_shown';

  /* ââ¢ââ¢ââ¢ââ¢ EXPOSE GLOBAL API ââ¢ââ¢ââ¢ââ¢ */

  function isSupported(code) {
    return SUPPORTED.indexOf((code || '').toUpperCase()) !== -1;
  }

  function isDeliverySupported(code) {
    return DELIVERY_SUPPORTED.indexOf((code || '').toUpperCase()) !== -1;
  }

  window.VPNexuesCountry = {
    load: load,
    save: save,
    setManual: setManual,
    clearManual: function() { sessionStorage.removeItem(TOAST_SHOWN_KEY); },
    format: format,
    get: get,
    getDetected: loadDetected,
    update: update,
    getFlag: function(code) { return getFlag(code || loadDetected()); },
    getPhoneConfig: getPhoneConfig,
    detectCountry: detectCountry,
    syncUI: syncUI,
    isSupported: isSupported,
    isDeliverySupported: isDeliverySupported,
    config: PRICE_CONFIG,
    supported: SUPPORTED,
    deliverySupported: DELIVERY_SUPPORTED,
    'default': DEFAULT_COUNTRY
  };

  window.loadSavedCountry = load;
  window.saveCountry = save;
  window.updatePrices = update;
  window.getCountry = get;
  window.detectCountry = detectCountry;

  /* AUTO-DETECT ON PAGE LOAD */
  var detected = loadDetected();
  var saved = localStorage.getItem('vpnexues_country');
  if (detected && detected.length === 2) {
    console.log('[Country] syncUI with detected:', detected);
    syncUI(detected);
  } else if (saved) {
    console.log('[Country] syncUI with saved:', saved);
    syncUI(saved);
  }
  /* Only force GeoIP if no saved country exists */
  if (!saved) {
    console.log('[Country] No saved country, starting detectCountry with force=true');
    detectCountry({ silent: false, force: true });
  } else {
    console.log('[Country] Saved country exists, skipping force detect');
  }

})();
