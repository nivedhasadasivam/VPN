(function () {
  function initReveal() {
    var items = document.querySelectorAll(".vpn-reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    items.forEach(function (item, index) {
      item.style.transitionDelay = Math.min(index % 6, 5) * 70 + "ms";
      observer.observe(item);
    });
  }

  function initBottomNavScrollHide() {
    var nav = document.querySelector(".mobile-bottom-nav-global");
    if (!nav) return;
    var timer = null;
    var lastY = window.scrollY || 0;

    function showNav() {
      nav.classList.remove("is-scroll-hidden");
    }

    function onScroll() {
      var currentY = window.scrollY || 0;
      if (Math.abs(currentY - lastY) < 4) return;
      lastY = currentY;
      if (window.matchMedia("(max-width: 1024px)").matches && currentY > 80) {
        nav.classList.add("is-scroll-hidden");
        clearTimeout(timer);
        timer = setTimeout(showNav, 520);
      } else {
        showNav();
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchend", function () {
      clearTimeout(timer);
      timer = setTimeout(showNav, 260);
    }, { passive: true });
  }

  function initAboutContactForm() {
    var form = document.querySelector(".vpn-about-contact #contact-form");
    if (!form || form.dataset.vpnBound === "true") return;
    form.dataset.vpnBound = "true";
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      fetch("send-mail.php", { method: "POST", body: new FormData(form) })
        .then(function (response) { return response.text(); })
        .then(function (data) {
          alert(data.trim() === "success" ? "Message sent successfully!" : "Failed to send message!");
          if (data.trim() === "success") form.reset();
        })
        .catch(function () { alert("Something went wrong!"); });
    });
  }

  function boot() {
    initReveal();
    initBottomNavScrollHide();
    initAboutContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
