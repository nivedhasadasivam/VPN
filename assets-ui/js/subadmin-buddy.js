/* ============================================================
   Orange Buddy — floating dashboard assistant
   Shared across all Subadmin pages (US / UAE / India / Singapore)
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'orange-buddy-pos';
  var DRAG_THRESHOLD = 5;
  var NOTE_INTERVAL = 4000;

  var css = [
    '#ob-wrap{position:fixed;right:20px;bottom:20px;width:68px;height:76px;z-index:99999;cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;filter:drop-shadow(0 4px 12px rgba(0,0,0,.2));transition:filter .3s ease,transform .3s ease}',
    '#ob-wrap:hover{filter:drop-shadow(0 6px 18px rgba(230,120,20,.4));transform:scale(1.07)}',
    '#ob-wrap.ob-drag{cursor:grabbing;transition:none;z-index:100000;filter:drop-shadow(0 8px 24px rgba(230,120,20,.45))}',
    '#ob-wrap .ob-svg{width:100%;height:100%;display:block;transform-origin:50% 85%}',
    '#ob-wrap:not(.ob-drag) .ob-svg{animation:obBounce 2.5s ease-in-out infinite}',
    '@keyframes obBounce{0%,100%{transform:translateY(0) rotate(0)}20%{transform:translateY(-6px) rotate(-1.5deg)}50%{transform:translateY(-3px) rotate(0)}70%{transform:translateY(-8px) rotate(1.5deg)}90%{transform:translateY(-2px) rotate(0)}}',
    '#ob-wrap.ob-cheer .ob-svg{animation:obCheer .5s ease-out}',
    '@keyframes obCheer{0%{transform:scale(1)}30%{transform:scale(1.12) rotate(-3deg)}60%{transform:scale(.93) rotate(2deg)}100%{transform:scale(1) rotate(0)}}',
    '#ob-wrap .ob-arm{transform-origin:88px 56px;animation:obWave 2.2s ease-in-out infinite}',
    '#ob-wrap.ob-drag .ob-arm{animation:none}',
    '@keyframes obWave{0%,100%{transform:rotate(0)}35%{transform:rotate(-15deg)}65%{transform:rotate(10deg)}}',
    '#ob-wrap .ob-leaf{transform-origin:54px 22px;animation:obLeafSway 3s ease-in-out infinite}',
    '@keyframes obLeafSway{0%,100%{transform:rotate(0)}40%{transform:rotate(7deg)}70%{transform:rotate(-5deg)}}',
    '#ob-wrap .ob-eyes{animation:obBlink 3.5s ease-in-out infinite}',
    '@keyframes obBlink{0%,88%,100%{transform:scaleY(1)}92%{transform:scaleY(.1)}}',
    '#ob-wrap .ob-shadow{animation:obShadowPulse 2.5s ease-in-out infinite}',
    '@keyframes obShadowPulse{0%,100%{opacity:.08;rx:20}50%{opacity:.14;rx:23}}',
    '#ob-wrap .ob-cheeks{animation:obCheekPulse 3s ease-in-out infinite}',
    '@keyframes obCheekPulse{0%,100%{opacity:1}50%{opacity:.5}}',
    '#ob-wrap .ob-legs{animation:obFootTap 3s ease-in-out infinite}',
    '@keyframes obFootTap{0%,75%,100%{transform:translateY(0)}80%{transform:translateY(-2px)}85%{transform:translateY(0)}90%{transform:translateY(-1px)}95%{transform:translateY(0)}}',
    '#ob-wrap:hover .ob-svg{filter:drop-shadow(0 0 8px rgba(255,152,0,.3))}',
    '#ob-wrap.ob-drag .ob-svg{animation:none;transform:scale(1.05) rotate(-2deg)}',
    '#ob-wrap .ob-close{position:absolute;top:-4px;left:-4px;width:17px;height:17px;border:none;border-radius:50%;background:#fff;color:#888;font-size:11px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 5px rgba(0,0,0,.2);padding:0;z-index:3;opacity:0;transition:opacity .2s,background .15s,color .15s,transform .15s}',
    '#ob-wrap:hover .ob-close{opacity:1}',
    '#ob-wrap .ob-close:hover{background:#fee;color:#e33;transform:scale(1.15)}',
    '#ob-note-wrap{position:fixed;z-index:100001;pointer-events:none;opacity:0;transform:translateY(8px) scale(.9);transition:opacity .25s ease,transform .25s ease}',
    '#ob-note-wrap.ob-show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}',
    '#ob-note-box{background:#fff;border-radius:14px;box-shadow:0 4px 18px rgba(0,0,0,.12);padding:10px 16px;border:1px solid rgba(230,120,20,.15);position:relative;max-width:230px}',
    '#ob-note-box::after{content:"";position:absolute;bottom:-7px;right:18px;width:13px;height:13px;background:#fff;border-right:1px solid rgba(230,120,20,.15);border-bottom:1px solid rgba(230,120,20,.15);transform:rotate(45deg)}',
    '#ob-note-box .ob-text{font-size:13px;font-weight:700;line-height:1.4;color:#14532D;text-align:center}',
    '#ob-note-box .ob-text.ob-greet{font-size:15px;color:#E65100}',
    '#ob-note-box .ob-text.ob-link{cursor:pointer}',
    '#ob-note-box .ob-text a{display:inline-block;padding:4px 14px;background:linear-gradient(135deg,#15803D,#22C55E);color:#fff!important;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;transition:all .2s ease}',
    '#ob-note-box .ob-text a:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(21,128,61,.35)}',
    '#ob-leaf-fx{position:fixed;z-index:99997;pointer-events:none;font-size:13px}',
    '@keyframes obLeafUp{0%{opacity:1;transform:translateY(0) rotate(0) scale(1)}60%{opacity:.6}100%{opacity:0;transform:translateY(-50px) rotate(70deg) scale(.4) translateX(var(--dx,10px))}}',
    '[data-theme="dark"] #ob-note-box{background:#1E293B;border-color:rgba(230,120,20,.25);box-shadow:0 4px 18px rgba(0,0,0,.45)}',
    '[data-theme="dark"] #ob-note-box::after{background:#1E293B;border-color:rgba(230,120,20,.25)}',
    '[data-theme="dark"] #ob-note-box .ob-text{color:#86EFAC}',
    '[data-theme="dark"] #ob-note-box .ob-text.ob-greet{color:#FB923C}',
    '[data-theme="dark"] #ob-note-box .ob-text a{color:#86EFAC}',
    '[data-theme="dark"] #ob-wrap .ob-close{background:#334155;color:#94A3B8}',
    '[data-theme="dark"] #ob-wrap .ob-close:hover{background:#5c2020;color:#f87171}',
    '@media(max-width:640px){#ob-wrap{width:56px;height:64px}#ob-note-box{max-width:calc(100vw - 48px);padding:8px 12px}#ob-note-box .ob-text{font-size:12px}}'
  ].join('\n');

  var SVG = [
    '<svg class="ob-svg" viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg">',
      '<defs>',
        '<radialGradient id="oG" cx="38%" cy="32%" r="68%">',
          '<stop offset="0%" stop-color="#FFB74D"/>',
          '<stop offset="50%" stop-color="#FF9800"/>',
          '<stop offset="100%" stop-color="#E65100"/>',
        '</radialGradient>',
        '<radialGradient id="oB" cx="50%" cy="50%" r="50%">',
          '<stop offset="0%" stop-color="#FF8A80" stop-opacity=".65"/>',
          '<stop offset="100%" stop-color="#FF8A80" stop-opacity="0"/>',
        '</radialGradient>',
      '</defs>',
      '<ellipse class="ob-shadow" cx="58" cy="124" rx="20" ry="3" fill="rgba(0,0,0,.08)"/>',
      '<g class="ob-legs" stroke="#5D4037" stroke-width="4" stroke-linecap="round" fill="none">',
        '<line x1="47" y1="100" x2="43" y2="117"/>',
        '<line x1="69" y1="100" x2="73" y2="117"/>',
      '</g>',
      '<path d="M35 116 Q43 112 51 116" stroke="#5D4037" stroke-width="4" stroke-linecap="round" fill="none"/>',
      '<path d="M65 116 Q73 112 81 116" stroke="#5D4037" stroke-width="4" stroke-linecap="round" fill="none"/>',
      '<g class="ob-arm">',
        '<path d="M90 56 Q100 46 106 36" stroke="#5D4037" stroke-width="3.5" stroke-linecap="round" fill="none"/>',
        '<path d="M102 30 Q110 26 114 32 Q110 38 104 36" fill="#FF9800" stroke="#5D4037" stroke-width="2.5"/>',
        '<line x1="106" y1="31" x2="112" y2="34" stroke="#5D4037" stroke-width="1.5" stroke-linecap="round"/>',
        '<line x1="105" y1="34" x2="110" y2="38" stroke="#5D4037" stroke-width="1.5" stroke-linecap="round"/>',
      '</g>',
      '<circle cx="58" cy="62" r="38" fill="url(#oG)" stroke="#5D4037" stroke-width="3.5"/>',
      '<path d="M56 26 Q55 18 52 14" stroke="#5D4037" stroke-width="3" stroke-linecap="round" fill="none"/>',
      '<g class="ob-leaf">',
        '<path d="M54 20 Q62 6 78 10 Q72 22 56 18Z" fill="#4CAF50" stroke="#5D4037" stroke-width="2.5" stroke-linejoin="round"/>',
        '<circle cx="70" cy="12" r="3" fill="#81C784" opacity=".6"/>',
      '</g>',
      '<g class="ob-eyes">',
        '<circle cx="46" cy="58" r="3" fill="#3E2723"/>',
        '<circle cx="68" cy="58" r="3" fill="#3E2723"/>',
      '</g>',
      '<path d="M51 70 Q58 77 65 70" stroke="#3E2723" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
      '<g class="ob-cheeks">',
        '<circle cx="36" cy="67" r="5.5" fill="url(#oB)"/>',
        '<circle cx="80" cy="67" r="5.5" fill="url(#oB)"/>',
      '</g>',
    '</svg>'
  ].join('');

  var NOTES = [
    { t: 'Hii buddy!', g: 1 },
    'Fresh stock in!',
    'Check today\'s orders',
    'Keep products fresh!',
    { t: 'Visit shop \u2192', link: 'shop.html' }
  ];

  function loadPos() {
    try { var p = JSON.parse(localStorage.getItem(STORAGE_KEY)); return (p && typeof p.r === 'number' && typeof p.b === 'number') ? p : null; } catch (e) { return null; }
  }
  function savePos(r, b) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ r: r, b: b })); } catch (e) {} }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

  function leafFx(x, y) {
    var el = document.createElement('div');
    el.className = 'ob-leaf-fx';
    el.textContent = '\uD83C\uDF3F';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--dx', (Math.random() * 24 - 12) + 'px');
    document.body.appendChild(el);
    el.animate([
      { opacity: 1, transform: 'translateY(0) rotate(0) scale(1)' },
      { opacity: .5, transform: 'translateY(-30px) rotate(50deg) scale(.7)' },
      { opacity: 0, transform: 'translateY(-55px) rotate(90deg) scale(.35) translateX(' + (Math.random() * 20 - 10) + 'px)' }
    ], { duration: 1100 + Math.random() * 500, easing: 'ease-out' });
    setTimeout(function () { el.remove(); }, 1800);
  }

  function init() {
    var s = document.createElement('style');
    s.id = 'ob-css';
    s.textContent = css;
    document.head.appendChild(s);

    var wrap = document.createElement('div');
    wrap.id = 'ob-wrap';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', 'Orange Buddy');
    wrap.innerHTML = SVG + '<button class="ob-close" aria-label="Close">&times;</button>';

    var nw = document.createElement('div');
    nw.id = 'ob-note-wrap';
    nw.innerHTML = '<div id="ob-note-box"><p class="ob-text"></p></div>';

    document.body.appendChild(wrap);
    document.body.appendChild(nw);

    var saved = loadPos();
    if (saved) { wrap.style.right = saved.r + 'px'; wrap.style.bottom = saved.b + 'px'; }

    var noteBox = nw.querySelector('.ob-text');
    var isOpen = false, noteIdx = 0, noteT = null, cycleT = null;

    function pos() {
      var wr = wrap.getBoundingClientRect();
      var bw = nw.offsetWidth || 180;
      var bh = nw.offsetHeight || 40;
      var l = wr.left + wr.width / 2 - bw / 2;
      var t = wr.top - bh - 12;
      if (t < 8) t = wr.bottom + 12;
      l = clamp(l, 8, window.innerWidth - bw - 8);
      t = clamp(t, 8, window.innerHeight - bh - 8);
      nw.style.left = l + 'px';
      nw.style.top = t + 'px';
    }

    function showNote() {
      nw.classList.remove('ob-show');
      clearTimeout(noteT);
      noteT = setTimeout(function () {
        var n = NOTES[noteIdx];
        var txt = typeof n === 'string' ? n : n.t;
        var greet = typeof n === 'object' && n.g;
        var link = typeof n === 'object' && n.link;
        if (link) {
          noteBox.innerHTML = '<a href="' + link + '">' + txt + '</a>';
        } else {
          noteBox.textContent = txt;
        }
        noteBox.className = 'ob-text' + (greet ? ' ob-greet' : '') + (link ? ' ob-link' : '');
        pos();
        nw.classList.add('ob-show');
        wrap.classList.remove('ob-cheer');
        void wrap.offsetWidth;
        wrap.classList.add('ob-cheer');
        var wr = wrap.getBoundingClientRect();
        leafFx(wr.left + 10, wr.top + 5);
      }, 250);
    }

    function next() { noteIdx = (noteIdx + 1) % NOTES.length; showNote(); }
    function startCycle() { stopCycle(); cycleT = setInterval(next, NOTE_INTERVAL); }
    function stopCycle() { clearInterval(cycleT); cycleT = null; }

    function open() { isOpen = true; showNote(); startCycle(); }
    function close() { isOpen = false; nw.classList.remove('ob-show'); clearTimeout(noteT); stopCycle(); }

    /* drag */
    var dragging = false, moved = false, sx = 0, sy = 0, sr = 0, sb = 0, pid = null;
    function getR() { return window.innerWidth - wrap.getBoundingClientRect().right; }
    function getB() { return window.innerHeight - wrap.getBoundingClientRect().bottom; }

    wrap.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      dragging = true; moved = false; pid = e.pointerId;
      sx = e.clientX; sy = e.clientY;
      sr = getR(); sb = getB();
      wrap.classList.add('ob-drag');
      try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    wrap.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) moved = true;
      if (!moved) return;
      wrap.style.right = clamp(sr - dx, 0, window.innerWidth - 68) + 'px';
      wrap.style.bottom = clamp(sb - dy, 0, window.innerHeight - 76) + 'px';
      wrap.style.left = 'auto'; wrap.style.top = 'auto';
      if (isOpen) pos();
    });
    wrap.addEventListener('pointerup', function (e) {
      if (!dragging || (e.pointerId !== undefined && e.pointerId !== pid)) return;
      dragging = false; wrap.classList.remove('ob-drag');
      if (moved) { savePos(getR(), getB()); if (isOpen) pos(); }
      else { isOpen ? close() : open(); }
      moved = false; pid = null;
    });
    wrap.addEventListener('pointercancel', function () { dragging = false; wrap.classList.remove('ob-drag'); moved = false; pid = null; });
    wrap.addEventListener('click', function (e) { e.stopPropagation(); if (moved) e.preventDefault(); });

    /* close btn */
    var cb = wrap.querySelector('.ob-close');
    cb.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    cb.addEventListener('click', function (e) { e.stopPropagation(); close(); wrap.style.display = 'none'; });

    document.addEventListener('click', function (e) { if (isOpen && !nw.contains(e.target) && !wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    nw.addEventListener('click', function (e) { e.stopPropagation(); });
    window.addEventListener('resize', function () { if (isOpen) pos(); });

    /* auto open */
    setTimeout(function () { if (wrap.style.display !== 'none') open(); }, 1200);

    /* pause on hidden tab */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stopCycle(); clearTimeout(noteT); }
      else if (isOpen) startCycle();
    });

    /* periodic leaf */
    setInterval(function () {
      if (document.hidden) return;
      var wr = wrap.getBoundingClientRect();
      leafFx(wr.left + Math.random() * wr.width, wr.top + Math.random() * 15);
    }, 5000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
