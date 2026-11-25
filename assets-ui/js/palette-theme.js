/* VPNexues Palette Theme
 * Forces the sub-admin dashboards to use ONLY the brand palette:
 *   #134B2F dark green | #2E7D32 medium green | #7EBC51 light green
 *   #FFC107 yellow      | #4DA6E1 blue
 * plus dark/light/mixed tints of those. Neutrals (white/gray/black) kept.
 * Rewrites inline styles, <style> blocks and watches the DOM for
 * dynamically rendered content.
 */
(function () {
  'use strict';

  /* dark / medium / light shades of the 5 brand colors */
  var DARK = '#134B2F', MED = '#2E7D32', LIGHT = '#7EBC51', YEL = '#FFC107', BLU = '#4DA6E1';
  var YEL_D = '#C79100', YEL_L = '#FFD54F', YEL_XL = '#FFF3C4', YEL_XXL = '#FFE08A';
  var BLU_L = '#E3F2FC';
  var L_T1 = '#C9E3AF', L_T2 = '#DCEFD0', L_T3 = '#E4F2D8', L_T4 = '#EEF5E6', L_T5 = '#F3F9EC';

  /* old hex (lowercase, 6-digit; alpha suffixes preserved automatically) */
  var HEX_MAP = {
    /* dark greens */
    '#14532d': DARK, '#14472f': DARK, '#0d3018': DARK, '#0a2e1a': DARK, '#0b2f1a': DARK,
    '#0a2b16': DARK, '#0e3a24': DARK, '#065f46': DARK, '#123a24': DARK, '#0f2e1a': DARK,
    /* medium greens */
    '#166534': MED, '#15803d': MED, '#16a34a': MED, '#22c55e': MED, '#2e7d32': MED,
    '#047857': MED, '#2f7d2c': MED, '#166534': MED,
    /* light greens */
    '#5b8c51': LIGHT, '#4ade80': LIGHT, '#a3d977': LIGHT, '#8bc34a': LIGHT,
    '#b7d4b0': L_T1, '#c0d9a8': L_T1, '#d5e8c8': L_T2, '#d7e4d0': L_T2, '#d7e8cd': L_T3,
    '#e2ecdb': L_T3, '#e0e8dd': L_T3, '#dcfce7': L_T4, '#f0fdf4': L_T5, '#f6f9f4': L_T5,
    '#f1f6ef': L_T4, '#eef2ec': L_T4, '#f8fbf6': L_T5, '#f9fbf8': L_T5, '#f1f5f0': L_T4,
    '#f9fafb': L_T5, '#eef5e8': L_T4,
    /* yellows / ambers */
    '#eab308': YEL, '#f59e0b': YEL, '#fbbf24': YEL, '#f2b233': YEL, '#ffc107': YEL,
    '#ca8a04': YEL_D, '#d97706': YEL_D, '#b45309': YEL_D, '#b8860b': YEL_D, '#e0a820': YEL_D,
    '#fef9c3': YEL_XL, '#fef3c7': YEL_XL, '#ffedd5': YEL_XXL, '#fff8e8': YEL_XL,
    /* blues / purples */
    '#3b82f6': BLU, '#0ea5e9': BLU, '#8b5cf6': BLU, '#6366f1': BLU, '#0284c7': BLU,
    '#dbeafe': BLU_L, '#e0f2fe': BLU_L,
    /* reds -> dark/medium yellow (palette-safe danger) */
    '#dc2626': YEL_D, '#ef4444': YEL, '#e11d48': YEL_D, '#be123c': YEL_D,
    '#fca5a5': YEL_L, '#fecaca': YEL_XXL, '#fee2e2': YEL_XL, '#fb7185': YEL
  };

  /* rgba(...) triplets */
  var RGB_MAP = {
    '20,71,47': '19,75,47', '11,47,26': '19,75,47', '8,30,16': '12,42,26', '6,95,70': '19,75,47',
    '10,46,26': '19,75,47', '13,48,24': '19,75,47', '18,58,36': '19,75,47',
    '22,163,74': '46,125,50', '34,197,94': '46,125,50', '21,128,61': '46,125,50',
    '47,125,44': '46,125,50', '91,140,81': '126,188,81', '74,222,128': '126,188,81',
    '242,178,51': '255,193,7', '234,179,8': '255,193,7', '245,158,11': '255,193,7',
    '202,138,4': '199,145,0', '217,119,6': '199,145,0', '180,83,9': '199,145,0',
    '220,38,38': '199,145,0', '239,68,68': '255,193,7', '251,113,133': '255,193,7',
    '59,130,246': '77,166,225', '14,165,233': '77,166,225', '139,92,246': '77,166,225',
    '99,102,241': '77,166,225', '109,40,217': '77,166,225', '251,191,36': '255,193,7'
  };

  function mapText(str) {
    if (!str) return str;
    var out = str;
    var lower = out.toLowerCase();
    if (out !== lower) { out = lower; }
    for (var hex in HEX_MAP) {
      if (out.indexOf(hex) !== -1) out = out.split(hex).join(HEX_MAP[hex]);
    }
    for (var rgb in RGB_MAP) {
      if (out.indexOf(rgb) !== -1) out = out.split(rgb).join(RGB_MAP[rgb]);
    }
    return out;
  }

  function inMascot(node) {
    while (node) {
      if (node.id === 'vpMascotWrap') return true;
      node = node.parentNode;
    }
    return false;
  }

  function processEl(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.id === 'vpMascotWrap') return;
    if (el.hasAttribute && el.hasAttribute('style')) {
      var s = el.getAttribute('style');
      var m = mapText(s);
      if (m !== s) el.setAttribute('style', m);
    }
    if (el.tagName === 'STYLE' && el.textContent) {
      var t = mapText(el.textContent);
      if (t !== el.textContent) el.textContent = t;
    }
  }

  function processStyleTags() {
    var tags = document.getElementsByTagName('style');
    for (var i = 0; i < tags.length; i++) {
      var t = mapText(tags[i].textContent);
      if (t !== tags[i].textContent) tags[i].textContent = t;
    }
  }

  function walkAll() {
    var els = document.querySelectorAll('[style]');
    for (var i = 0; i < els.length; i++) {
      if (!inMascot(els[i])) processEl(els[i]);
    }
    processStyleTags();
  }

  function baseCss() {
    return '' +
      ':root{--primary:' + DARK + ';--accent:' + MED + ';--dark-green:' + MED + ';--warning:' + YEL + ';--info:' + BLU + ';--danger:' + YEL_D + ';--purple:' + LIGHT + '}' +
      '';
  }

  function injectBase() {
    if (document.getElementById('vpPaletteBase')) return;
    var s = document.createElement('style');
    s.id = 'vpPaletteBase';
    s.textContent = baseCss();
    document.head.appendChild(s);
  }

  /* ---- observe dynamic content ---- */
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(function () {
      pending = false;
      walkAll();
    }, 120);
  }

  function start() {
    injectBase();
    walkAll();
    var mo = new MutationObserver(function (muts) {
      var interesting = false;
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'attributes') {
          if (!inMascot(m.target)) { processEl(m.target); }
        } else {
          interesting = true;
        }
      }
      if (interesting) schedule();
    });
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
