// ================= PRELOADER =================
const preloaderHTML = `
<div id="preloader" class="preloader">
    <div class="animation-preloader">
        <div class="spinner"></div>
        <div class="txt-loading">
            <span class="letters-loading">V</span>
            <span class="letters-loading">P</span>
            <span class="letters-loading">N</span>
            <span class="letters-loading">e</span>
            <span class="letters-loading">x</span>
            <span class="letters-loading">u</span>
            <span class="letters-loading">e</span>
            <span class="letters-loading">s</span>
        </div>
        <p class="text-center">Loading</p>
    </div>
</div>
`;


// ================= BACK TO TOP =================
const backToTopHTML = `
<button id="back-top" class="back-to-top">
    <i class="far fa-arrow-up"></i>
</button>
`;


// ================= CURSOR =================
const cursorHTML = `
<div class="mouseCursor cursor-outer"></div>
<div class="mouseCursor cursor-inner"></div>
`;


// ================= OFFCANVAS =================
const offcanvasHTML = `
<div class="fix-area">
    <div class="offcanvas__info">
        <div class="offcanvas__wrapper">
            <div class="offcanvas__content">

                <div class="offcanvas__top d-flex justify-content-between">
                    <a href="index.html">VPNexues</a>
                    <button id="offcanvas-close"><i class="fas fa-times"></i></button>
                </div>

                <h3>Hello There!</h3>
                <p>Organic Farm-to-Table Export Company</p>

                <div class="mobile-menu"></div>

                <div class="social-icon">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="https://www.instagram.com/vpnexues/" target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="https://www.linkedin.com/" target="_blank"><i class="fab fa-linkedin-in"></i></a>
                </div>

                <a href="contact.html" class="theme-btn">Get A Quote</a>

            </div>
        </div>
    </div>
</div>
<div class="offcanvas__overlay"></div>
`;


// ================= HEADER TOP =================
const headerTopHTML = `
<div class="header-top-section">
    <div class="container">
        <div class="header-top-wrapper">

            <ul>
                <li><a href="mailto:support@vpnexues.com">support@vpnexues.com</a></li>
                <li><a href="tel:+919943994603">+91 9943994603</a></li>
            </ul>

            <div class="head-right">
                <div class="flag-wrap" id="flagWrap">
                    <div class="flag">
                        <img id="header-country-flag" src="https://ccecckljdfkyzalsnfig.supabase.co/storage/v1/object/public/javascript-assets/flags/in.png" alt="flag" style="width:24px;height:18px;object-fit:cover;border-radius:3px;">
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
`;


// ================= MAIN HEADER =================
const headerHTML = `
<header id="header-sticky">
    <div class="container">
        <div class="header-main">

            <a href="index.html">VPNexues</a>

            <nav>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="about.html">About</a></li>
                    <li><a href="service.html">Services</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>
            </nav>

            <div class="header-right">
                <a href="#contact-app" class="theme-btn">Get A Quote</a>

                <div class="sidebar__toggle">
                    <span></span><span></span><span></span>
                </div>
            </div>

        </div>
    </div>
</header>
`;


// ================= LOAD ALL =================
function loadLayout() {
  document.getElementById("preloader-container")?.insertAdjacentHTML("beforeend", preloaderHTML);
  document.getElementById("backtop-container")?.insertAdjacentHTML("beforeend", backToTopHTML);
  document.getElementById("cursor-container")?.insertAdjacentHTML("beforeend", cursorHTML);
  document.getElementById("offcanvas-container")?.insertAdjacentHTML("beforeend", offcanvasHTML);
  document.getElementById("headertop-container")?.insertAdjacentHTML("beforeend", headerTopHTML);
  document.getElementById("header-container")?.insertAdjacentHTML("beforeend", headerHTML);
}

document.addEventListener("DOMContentLoaded", loadLayout);


// ================= PRELOADER HIDE =================
window.addEventListener("load", () => {
  document.getElementById("preloader")?.remove();
});


// ================= BACK TO TOP =================
// Note: main.js also handles back-to-top — this is kept as CSS-only fallback
// Using CSS class approach instead of inline style to avoid conflicts

document.addEventListener("click", (e) => {
  if (e.target.closest("#back-top")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});


// ================= CURSOR =================
if (window.innerWidth > 768) {
  document.addEventListener("mousemove", (e) => {
    document.querySelectorAll(".mouseCursor").forEach(el => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  });
}


// ================= OFFCANVAS =================
document.addEventListener("click", (e) => {
  const offcanvas = document.querySelector(".offcanvas__info");
  const overlay = document.querySelector(".offcanvas__overlay");

  if (e.target.closest(".sidebar__toggle")) {
    offcanvas?.classList.add("active");
    overlay?.classList.add("active");
  }

  if (e.target.closest("#offcanvas-close") || e.target.classList.contains("offcanvas__overlay")) {
    offcanvas?.classList.remove("active");
    overlay?.classList.remove("active");
  }
});


// ================= STICKY HEADER =================
// Note: main.js handles sticky header via jQuery — this is removed to avoid conflicts
// layout.js should NOT add its own scroll handler for sticky header


// ================= DUMMY FUNCTION =================
// Note: main.js defines goPage — this is a no-op fallback to avoid alert() popup
function goPage(type) {
  // no-op — main.js handles navigation
}