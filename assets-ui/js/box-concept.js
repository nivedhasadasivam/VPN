(function () {
  "use strict";

  var section = document.querySelector(".vpn-box-section");
  if (!section) return;

  /* ---------- fit/zoom hook (live ConceptHome `_e`) ---------- */
  var FIT_W = 1025;
  var FIT_H = 480;
  var MIN_ZOOM = 0.55;
  var fitRaf = 0;

  function fitAll() {
    fitRaf = 0;
    var inner = section.firstElementChild;
    if (!inner) return;

    inner.style.zoom = "";
    if (!(window.innerWidth >= FIT_W && window.innerHeight >= FIT_H)) return;

    var cs = getComputedStyle(section);
    var available = window.innerHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var scale = 1;

    for (var pass = 0; pass < 4; pass++) {
      var height = inner.getBoundingClientRect().height;
      if (height <= 0) break;

      if (height > available + 1) {
        scale = Math.max(MIN_ZOOM, (available / height) * scale);
      } else if (scale < 1 && height < available * 0.97) {
        scale = Math.min(1, (available / height) * scale);
      } else {
        break;
      }

      inner.style.zoom = scale < 1 ? String(scale) : "";
    }
  }

  function scheduleFit() {
    if (!fitRaf) fitRaf = window.requestAnimationFrame(fitAll);
  }

  scheduleFit();
  window.addEventListener("resize", scheduleFit);
  window.addEventListener("load", scheduleFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);

  /* ---------- open/close deal hook (live ConceptHome `be`) ---------- */
  var DEAL_W = 1025;
  var DEAL_H = 480;
  var dealRaf = 0;

  function updateDeal() {
    dealRaf = 0;
    var target = document.getElementById("concepts");
    if (!target) return;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!(window.innerWidth >= DEAL_W && window.innerHeight >= DEAL_H && !reduce)) {
      target.style.setProperty("--deal", "1");
      target.style.setProperty("--shift", "0px");
      return;
    }

    var small = target.querySelector('[data-card="small"]');
    var big = target.querySelector('[data-card="big"]');
    if (small && big) {
      var smallCenter = small.offsetLeft + small.offsetWidth / 2;
      var bigCenter = big.offsetLeft + big.offsetWidth / 2;
      target.style.setProperty("--shift", ((bigCenter - smallCenter) / 2).toFixed(1) + "px");
    }

    var rect = target.getBoundingClientRect();
    var range = rect.height - window.innerHeight;
    var deal = range > 0 ? Math.min(1, Math.max(0, -rect.top / (range * 0.7))) : 1;
    target.style.setProperty("--deal", deal.toFixed(3));
  }

  function scheduleDeal() {
    if (!dealRaf) dealRaf = window.requestAnimationFrame(updateDeal);
  }

  scheduleDeal();
  window.addEventListener("scroll", scheduleDeal, { passive: true });
  window.addEventListener("resize", scheduleDeal);
  window.addEventListener("load", scheduleDeal);

  /* ---------- mascot video controller (live ConceptHome `z`/`B`/`U`/`q`) ---------- */
  var VIDEO_FADE = 0.5;
  var VIDEO_SYNC_TOLERANCE = 0.08;
  var VIDEO_RETRIES = 3;
  var VIDEO_RETRY_CHECK = 6000;
  var videos = Array.prototype.slice.call(section.querySelectorAll(".vpn-box-mascot-video"));
  var activeVideos = [];
  var videoVisible = false;
  var syncFrame = 0;
  var motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function reducedMotion() {
    return !!(motionQuery && motionQuery.matches);
  }

  function playOne(video) {
    var promise = video.play();
    if (promise && promise.catch) promise.catch(function () {});
  }

  function playVideos() {
    for (var i = 0; i < activeVideos.length; i++) playOne(activeVideos[i]);
  }

  function pauseVideos() {
    for (var i = 0; i < activeVideos.length; i++) {
      activeVideos[i].pause();
      activeVideos[i].currentTime = 0;
      activeVideos[i].style.opacity = "1";
    }
  }

  function syncVideos() {
    syncFrame = window.requestAnimationFrame(syncVideos);

    var reference = null;
    var i;
    for (i = 0; i < activeVideos.length; i++) {
      var candidate = activeVideos[i];
      if (candidate.readyState >= 2 && isFinite(candidate.duration) && candidate.duration > 0) {
        reference = candidate;
        break;
      }
    }
    if (!reference) return;

    for (i = 0; i < activeVideos.length; i++) {
      var video = activeVideos[i];
      if (video === reference || video.seeking || !isFinite(video.duration) || video.duration <= 0) continue;

      var half = video.duration / 2;
      var delta = ((video.currentTime - reference.currentTime + half) % video.duration + video.duration) % video.duration - half;
      if (Math.abs(delta) > VIDEO_SYNC_TOLERANCE) video.currentTime = reference.currentTime;
    }

    for (i = 0; i < activeVideos.length; i++) {
      var fading = activeVideos[i];
      if (isFinite(fading.duration) && fading.duration > 0) {
        var remaining = fading.duration - fading.currentTime;
        fading.style.opacity = String(Math.min(1, Math.max(0, remaining / VIDEO_FADE)));
      }
    }
  }

  function ensureVideoSync() {
    if (!syncFrame && activeVideos.length) syncFrame = window.requestAnimationFrame(syncVideos);
  }

  function watchVideo(video) {
    var attempts = 0;
    var retryTimer = 0;
    var loadTimer = 0;

    function loaded() {
      window.clearTimeout(retryTimer);
    }

    function scheduleCheck() {
      window.clearTimeout(retryTimer);
      retryTimer = window.setTimeout(retry, VIDEO_RETRY_CHECK);
    }

    function retry() {
      if (video.readyState >= 2 || attempts >= VIDEO_RETRIES) return;
      attempts += 1;
      window.clearTimeout(loadTimer);
      loadTimer = window.setTimeout(function () {
        video.load();
        if (videoVisible) playOne(video);
        scheduleCheck();
      }, 800 * attempts);
    }

    video.addEventListener("error", retry);
    video.addEventListener("abort", retry);
    video.addEventListener("stalled", retry);
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("canplay", loaded);
    scheduleCheck();
  }

  function bindBurst(mascot) {
    mascot.addEventListener("click", function () {
      if (reducedMotion()) return;
      mascot.classList.remove("vpn-box-mascot-burst");
      window.requestAnimationFrame(function () {
        mascot.classList.add("vpn-box-mascot-burst");
      });
    });

    mascot.addEventListener("animationend", function (event) {
      if (event.target === event.currentTarget) mascot.classList.remove("vpn-box-mascot-burst");
    });
  }

  if (videos.length) {
    var videoTarget = document.getElementById("concepts") || section;

    if ("IntersectionObserver" in window) {
      var videoObserver = new IntersectionObserver(function (entries) {
        videoVisible = entries[0].isIntersecting;
        if (videoVisible) playVideos();
        else pauseVideos();
      });
      videoObserver.observe(videoTarget);
    } else {
      videoVisible = true;
    }

    if (reducedMotion()) {
      for (var v = 0; v < videos.length; v++) {
        videos[v].pause();
        videos[v].currentTime = 0;
      }
    } else {
      for (var i = 0; i < videos.length; i++) {
        activeVideos.push(videos[i]);
        watchVideo(videos[i]);
      }
      if (videoVisible) playVideos();
      ensureVideoSync();
    }
  }

  var mascots = section.querySelectorAll(".vpn-box-mascot");
  for (var m = 0; m < mascots.length; m++) bindBurst(mascots[m]);

  /* ---------- reveal hook (live ConceptHome `xe`) ---------- */
  var reveals = Array.prototype.slice.call(section.querySelectorAll("[data-reveal]"));
  if (!reveals.length) return;

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-reveal", "in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.setAttribute("data-reveal", "in"); });
  }
})();
