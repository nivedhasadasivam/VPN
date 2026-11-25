/* ===================================================================
    Author          : Modina Theme
    Version         : 1.0
* ================================================================= */
    /* ================================
       Mobile Bottom Navigation Active State
    ================================ */
    function isVpnUserLoggedIn() {
        const authKeys = ["vpnexuesAuth", "vpnexuesLoggedIn", "vpnexuesSession", "isLoggedIn"];
        const hasLegacyLogin = authKeys.some(function(key) {
            return localStorage.getItem(key) === "true" || sessionStorage.getItem(key) === "true";
        });
        if (hasLegacyLogin) return true;

        return [localStorage, sessionStorage].some(function(storage) {
            try {
                const user = JSON.parse(storage.getItem("loggedInUser") || "null");
                return user && user.isLoggedIn === true;
            } catch (error) {
                return false;
            }
        });
    }

    function syncMobileAccountNav() {
        if (window.__vpnSkipAuthModal) return;
        const nav = document.querySelector(".mobile-bottom-nav-global");
        if (!nav) return;

        const accountItem = Array.from(nav.querySelectorAll(".nav-item")).find(function(item) {
            const label = item.querySelector(".nav-label");
            const text = label ? label.textContent.trim().toLowerCase() : "";
            const href = (item.getAttribute("href") || "").toLowerCase();
            return item.dataset.navKey === "account" || text === "account" || text === "login" || href.indexOf("account.html") !== -1;
        });
        if (!accountItem) return;

        const loggedIn = isVpnUserLoggedIn();
        const icon = accountItem.querySelector(".nav-icon");
        const label = accountItem.querySelector(".nav-label");
        accountItem.dataset.navKey = "account";
        accountItem.setAttribute("href", loggedIn ? "account.html" : "index.html?login=1&redirect=account.html");
        accountItem.setAttribute("aria-label", loggedIn ? "My Account" : "Login");
        if (icon) icon.className = loggedIn ? "far fa-user-circle nav-icon" : "far fa-user nav-icon";
        if (label) label.textContent = loggedIn ? "Account" : "Login";
    }

    window.vpnSyncMobileAccountNav = syncMobileAccountNav;

    function updateNavbarAuthState() {
        const loginEls = document.querySelectorAll('#navLoginBtn');
        const accountEls = document.querySelectorAll('#navAccountBtn');
        let auth = false;
        if (typeof isVpnUserLoggedIn === 'function') auth = isVpnUserLoggedIn();
        loginEls.forEach(function(el){ el.classList.toggle('auth-force-hide', auth); });
        accountEls.forEach(function(el){ el.classList.toggle('auth-force-hide', !auth); });
    }
    window.updateNavbarAuthState = updateNavbarAuthState;
    window.vpnSyncNavbarLogin = updateNavbarAuthState;
    // immediate run if DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateNavbarAuthState);
    } else {
        updateNavbarAuthState();
    }

    const mobileCountryPlacement = {
        wrap: null,
        parent: null,
        next: null
    };

    function setupMobileCountryPlacement() {
        const wrap = mobileCountryPlacement.wrap || document.querySelector(".flag-wrap");
        const headerRight = document.querySelector("#header-sticky .header-right");
        if (!wrap || !headerRight) return;

        if (!mobileCountryPlacement.wrap) {
            mobileCountryPlacement.wrap = wrap;
            mobileCountryPlacement.parent = wrap.parentNode;
            mobileCountryPlacement.next = wrap.nextSibling;
        }

        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        const hamburger = headerRight.querySelector(".header__hamburger");

        if (isMobile) {
            wrap.classList.add("mobile-header-country");
            if (hamburger && hamburger.parentNode === headerRight) {
                headerRight.insertBefore(wrap, hamburger);
            } else if (wrap.parentNode !== headerRight) {
                headerRight.appendChild(wrap);
            }
            moveLocationDisplay(headerRight, hamburger, true);
            return;
        }

        wrap.classList.remove("mobile-header-country");
        const parent = mobileCountryPlacement.parent;
        const next = mobileCountryPlacement.next;
        if (parent && wrap.parentNode !== parent) {
            if (next && next.parentNode === parent) {
                parent.insertBefore(wrap, next);
            } else {
                parent.appendChild(wrap);
            }
        }
        moveLocationDisplay(null, null, false);
    }

    const mobileLocPlacement = { el: null, parent: null, next: null };
    function moveLocationDisplay(headerRight, hamburger, toMobile) {
        const el = mobileLocPlacement.el || document.getElementById("headerLocation");
        if (!el) return;
        if (!mobileLocPlacement.el) {
            mobileLocPlacement.el = el;
            mobileLocPlacement.parent = el.parentNode;
            mobileLocPlacement.next = el.nextSibling;
        }
        if (toMobile) {
            if (hamburger && hamburger.parentNode === headerRight) {
                headerRight.insertBefore(el, hamburger);
            } else if (el.parentNode !== headerRight) {
                headerRight.appendChild(el);
            }
        } else {
            const parent = mobileLocPlacement.parent;
            const next = mobileLocPlacement.next;
            if (parent && el.parentNode !== parent) {
                if (next && next.parentNode === parent) {
                    parent.insertBefore(el, next);
                } else {
                    parent.appendChild(el);
                }
            }
        }
    }

    function setMobileBottomNavActive() {
        syncMobileAccountNav();
        const nav = document.querySelector(".mobile-bottom-nav-global");
        if (!nav) return;

        const items = Array.from(nav.querySelectorAll(".nav-item"));
        const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

        let activeKey = "";
        if (page === "index.html" || page === "") {
            activeKey = "home";
        } else if (page === "shop-cart.html" || page === "cart.html" || page === "checkout.html") {
            activeKey = "cart";
        } else if (page === "account.html" || page === "profile.html" || page === "login.html") {
            activeKey = "account";
        } else if (page === "shop.html" || page === "shop-details.html" || page === "mobile-product-selection.html" || page === "pricing.html") {
            activeKey = "categories";
        }

        items.forEach((item) => {
            const label = item.querySelector(".nav-label");
            const key = item.dataset.navKey || (label ? label.textContent.trim().toLowerCase() : "");
            const isActive = key === activeKey;

            item.classList.toggle("active", isActive);
            if (isActive) {
                item.setAttribute("aria-current", "page");
            } else {
                item.removeAttribute("aria-current");
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setMobileBottomNavActive);
        document.addEventListener("DOMContentLoaded", setupMobileCountryPlacement);
    } else {
        setMobileBottomNavActive();
        setupMobileCountryPlacement();
    }
    window.addEventListener("resize", setupMobileCountryPlacement);
    window.addEventListener("storage", function(event) {
        if (!event.key || /vpnexues|isLoggedIn/i.test(event.key)) setMobileBottomNavActive();
        if (event.key === "country" && event.newValue) {
            document.dispatchEvent(new CustomEvent('vpn-country-price-change', { detail: { country: event.newValue } }));
        }
    });

    const SMALL_BOX_URL = "pricing.html?type=small-box";
    const COUNTRY_PRICE_CONFIG = {
        SG: { rate: 1, prefix: "S$", locale: "en-SG", digits: 2 },
        IN: { rate: 62, prefix: "₹", locale: "en-IN", digits: 0 },
        US: { rate: 0.74, prefix: "$", locale: "en-US", digits: 2 },
        AE: { rate: 2.72, prefix: "AED ", locale: "en-AE", digits: 2 }
    };

    function getSelectedCountryCode() {
        const country = (localStorage.getItem("country") || "IN").toUpperCase();
        return COUNTRY_PRICE_CONFIG[country] ? country : "IN";
    }

    function formatCountryPrice(value) {
        const config = COUNTRY_PRICE_CONFIG[getSelectedCountryCode()];
        const amount = Number(value || 0) * config.rate;
        return config.prefix + amount.toLocaleString(config.locale, {
            minimumFractionDigits: config.digits,
            maximumFractionDigits: config.digits
        });
    }

    function refreshStaticCountryPrices() {
        document.querySelectorAll("[data-country-price]").forEach(function(element) {
            element.textContent = formatCountryPrice(element.getAttribute("data-country-price"));
        });
    }

    function notifyCountryPriceChange() {
        refreshStaticCountryPrices();
        document.dispatchEvent(new CustomEvent("vpn-country-price-change", {
            detail: { country: getSelectedCountryCode() }
        }));
    }

    window.vpnFormatCountryPrice = formatCountryPrice;
    window.vpnRefreshCountryPrices = notifyCountryPriceChange;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", refreshStaticCountryPrices);
        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(notifyCountryPriceChange, 0);
        });
    } else {
        refreshStaticCountryPrices();
        setTimeout(notifyCountryPriceChange, 0);
    }

    document.addEventListener("change", function(event) {
        if (event.target && event.target.id === "countrySelect") {
            setTimeout(notifyCountryPriceChange, 0);
        }
    });

    /* Shared tablet/mobile Categories drawer. */
    function setupCategoryDrawer() {
        if (!window.matchMedia("(max-width: 1024px)").matches) return;
        const nav = document.querySelector(".mobile-bottom-nav-global");
        if (!nav || document.querySelector(".vpn-category-drawer")) return;
        const shopItem = Array.from(nav.querySelectorAll(".nav-item")).find(function (item) {
            const label = item.querySelector(".nav-label");
            const text = label ? label.textContent.trim().toLowerCase() : "";
            return item.dataset.navKey === "categories" || text === "categories" || text === "shop";
        });
        if (!shopItem) return;

        const categories = shopItem.tagName.toLowerCase() === "button" ? shopItem : document.createElement("button");
        categories.type = "button";
        categories.className = "nav-item nav-categories";
        categories.dataset.navKey = "categories";
        categories.setAttribute("aria-label", "Open categories");
        categories.setAttribute("aria-expanded", "false");
        categories.innerHTML = '<span class="nav-icon-wrap"><i class="fas fa-th-large nav-icon" aria-hidden="true"></i></span><span class="nav-label">Categories</span>';
        if (categories !== shopItem) shopItem.replaceWith(categories);
        setMobileBottomNavActive();

        const backdrop = document.createElement("div");
        backdrop.className = "vpn-category-drawer-backdrop";
        const drawer = document.createElement("aside");
        drawer.className = "vpn-category-drawer";
        drawer.setAttribute("aria-label", "Product categories");
        const linkStyle = 'display:flex;align-items:center;justify-content:space-between;padding:14px 12px;border-top:1px solid rgba(22,68,27,.09);color:#173d1b;font-size:17px;font-weight:750;text-decoration:none;';
        drawer.innerHTML = '<div class="vpn-category-drawer__header"><div class="vpn-category-drawer__brand"><img src="https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/home-1/vp_logo.svg" alt="VPNexues logo"><span>VPNexues<small>விவசாயம் காப்போம்</small></span></div><button type="button" class="vpn-category-drawer__close" aria-label="Close categories" style="width:38px;height:38px;border:0;border-radius:50%;background:#edf3ec;color:#1d6221;font-size:27px;line-height:1;cursor:pointer">×</button></div><nav class="vpn-category-drawer__links" style="display:grid;margin-top:23px">' +
          '<a href="shop.html" style="' + linkStyle + '">Shop</a>' +
          '<a href="pricing.html?type=small-box" style="' + linkStyle + '">Small Box</a>' +
          '<a href="pricing.html?type=big-box" style="' + linkStyle + '">Big Box</a>' +
          '<a href="pricing.html?type=b2b" style="' + linkStyle + '">B2B</a>' +
          '</nav>';
        document.body.append(backdrop, drawer);
        function setFloatingArrowVisibility(isVisible) {
            document.querySelectorAll(".mobile-cart-summary, .back-to-top").forEach(function (element) {
                element.hidden = !isVisible;
            });
        }
        function closeDrawer() {
            document.body.classList.remove("vpn-category-drawer-open");
            categories.setAttribute("aria-expanded", "false");
            setFloatingArrowVisibility(true);
        }
        function openDrawer() {
            document.body.classList.add("vpn-category-drawer-open");
            categories.setAttribute("aria-expanded", "true");
            setFloatingArrowVisibility(false);
        }
        categories.addEventListener("click", openDrawer);
        backdrop.addEventListener("click", closeDrawer);
        drawer.querySelector(".vpn-category-drawer__close").addEventListener("click", closeDrawer);
        document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeDrawer(); });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupCategoryDrawer);
    } else {
        setupCategoryDrawer();
    }
    window.addEventListener("resize", setupCategoryDrawer);

    /* Product CTAs route to the correct product experience. */
    document.addEventListener("click", function(event) {
        const link = event.target.closest("a.theme-btn");
        if (!link) return;
        const label = link.textContent.trim().replace(/\s+/g, " ");

        if (/^(Explore|View) Our Products/i.test(label)) {
            event.preventDefault();
            window.location.href = SMALL_BOX_URL;
            return;
        }

        if (label.indexOf("Shop Now") === 0) {
            event.preventDefault();
            window.location.href = "shop.html";
        }
    });

(function($) {
    "use strict";

    window.goPage = window.goPage || function() {
        return true;
    };

    $(document).ready( function() {

        /* ================================
       Mobile Menu Js Start
    ================================ */

        $('#mobile-menu').meanmenu({
            meanMenuContainer: '.mobile-menu',
            meanScreenWidth: "1199",
            meanExpand: ['<i class="far fa-plus"></i>'],
        });

        var mobileShopBreakpoint = window.matchMedia("(max-width: 1024px)");

        function syncMobileShopVisibility() {
            $("#mobile-menu, .offcanvas__info .mobile-menu .mean-nav").each(function() {
                $(this).children("ul").children("li").each(function() {
                    var $item = $(this);
                    var label = $item.children("a").first().clone().children().remove().end().text().trim().toLowerCase();

                    if (label !== "shop") {
                        return;
                    }

                    if (mobileShopBreakpoint.matches) {
                        $item.attr({
                            "data-vpn-mobile-shop-hidden": "true",
                            "aria-hidden": "true",
                            "hidden": "hidden"
                        });
                    } else {
                        $item.removeAttr("data-vpn-mobile-shop-hidden aria-hidden hidden");
                    }
                });
            });
        }

        if (!document.getElementById("vpn-mobile-shop-visibility")) {
            $("<style>", {
                id: "vpn-mobile-shop-visibility",
                text: "[data-vpn-mobile-shop-hidden]{display:none!important}"
            }).appendTo(document.head);
        }

        syncMobileShopVisibility();
        if (typeof mobileShopBreakpoint.addEventListener === "function") {
            mobileShopBreakpoint.addEventListener("change", syncMobileShopVisibility);
        } else {
            mobileShopBreakpoint.addListener(syncMobileShopVisibility);
        }

        var mobileMenuContainer = document.querySelector(".offcanvas__info .mobile-menu");
        if (mobileMenuContainer && typeof MutationObserver !== "undefined") {
            new MutationObserver(syncMobileShopVisibility).observe(mobileMenuContainer, {
                childList: true,
                subtree: true
            });
        }

        function syncMobileMenuDropdown($expand) {
            setTimeout(function() {
                var isOpen = $expand.hasClass("mean-clicked") || $expand.parent().hasClass("dropdown-opened");
                var $submenu = $expand.prev("ul");

                if (!$submenu.length) {
                    return;
                }

                if (isOpen) {
                    $submenu.stop(true, true).show();
                    $expand.attr("aria-expanded", "true");
                } else {
                    $submenu.stop(true, true).hide();
                    $expand.attr("aria-expanded", "false");
                }
            }, 0);
        }

        $(".offcanvas__info .mobile-menu").on("click", ".mean-expand", function() {
            syncMobileMenuDropdown($(this));
        });

        $(".offcanvas__info .mobile-menu").on("click", ".mean-nav li > a:not(.mean-expand)", function(e) {
            var href = ($(this).attr("href") || "").toLowerCase();
            var $expand = $(this).siblings(".mean-expand").first();

            if ($expand.length && (!href || href === "#" || href.indexOf("javascript:void") === 0)) {
                e.preventDefault();
                $expand.trigger("click");
                syncMobileMenuDropdown($expand);
            }
        });

        /* ================================
        Sidebar Toggle & Sticky Item Logic
        ================================ */

        $(".offcanvas__close,.offcanvas__overlay").on("click", function() {
            $(".offcanvas__info").removeClass("info-open");
            $(".offcanvas__overlay").removeClass("overlay-open");
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        });
        $(".sidebar__toggle").on("click", function() {
            $(".offcanvas__info").addClass("info-open");
            $(".offcanvas__overlay").addClass("overlay-open");
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        });

        $(".share-btn").on("click", function() {
            var target = $(this).data("target");
            $("#" + target).toggle();
        });
        $("#openButton").on("click", function(e) {
            e.preventDefault();
            $("#targetElement").removeClass("side_bar_hidden");
        });
        $("#openButton2").on("click", function(e) {
            e.preventDefault();
            $("#targetElement").removeClass("side_bar_hidden");
        });
        $("#closeButton").on("click", function(e) {
            e.preventDefault();
            $("#targetElement").addClass("side_bar_hidden");
        });

          /* ================================
        Body Overlay Js Start
        ================================ */

        $(".body-overlay").on("click", function() {
            $(".offcanvas__area").removeClass("offcanvas-opened");
            $(".df-search-area").removeClass("opened");;
            $(".body-overlay").removeClass("opened");
        });

        /* ================================
        Sticky Header Js Start
        ================================ */
    
        $(window).scroll(function() {
            if ($(this).scrollTop() > 250) {
                $("#header-sticky").addClass("sticky");
            } else {
                $("#header-sticky").removeClass("sticky");
            }
        });

        /* ================================
        Video & Image Popup Js Start
        ================================ */

         $(".img-popup").magnificPopup({
            type: "image",
            gallery: {
                enabled: true,
            },
        });

        $('.video-popup').magnificPopup({
            type: 'iframe',
            callbacks: {}
        });


        /* ================================
        Wow Animation Js Start
        ================================ */

        new WOW().init();

        /* ================================
        Nice Select Js Start
        ================================ */

        if ($('.single-select').length) {
            $('.single-select').niceSelect();
        }

         /* ================================
        Counterup Js Start
        ================================ */

        $('.odometer').appear(function(e) {
            var odo = $(".odometer");
            odo.each(function() {
                var countNumber = $(this).attr("data-count");
                $(this).html(countNumber);
            });
        });

        
     /* ================================
       Banner Active Js Start
    ================================ */

        if($('.banner-active').length > 0) {
            const bannerActive = new Swiper(".banner-active", {
                speed:1500,
                loop: true,
                slidesPerView: 1,
                effect:'fade',
                autoplay: {
                    delay: 3000,         
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,  
                },
                navigation: {
                    nextEl: ".array-next",
                    prevEl: ".array-prev",
                },
                
                pagination: {
                    el: ".dot",
                    clickable: true,
                },
            });
        }
       
        /* ================================
        Service Slider Js Start
        ================================ */

        if($('.service-slide-4').length > 0) {
            const serviceSlide4 = new Swiper(".service-slide-4", {
                spaceBetween: 30,
                speed: 1000,
                loop: true,
                autoplay: {
                    delay: 1500,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1599: {
                        slidesPerView: 7,
                    },
                    1399: {
                        slidesPerView: 6.7,
                    },
                    1199: {
                        slidesPerView: 5,
                    },
                    991: {
                        slidesPerView: 2.5,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 1.4,
                    },
                    400: {
                        slidesPerView: 1,
                    },
                },
            });
        }

        if($('.service-slide-5').length > 0) {
            const serviceSlide5 = new Swiper(".service-slide-5", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                 navigation: {
                    nextEl: ".array-next",
                    prevEl: ".array-prev",
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 4,
                    },
                    991: {
                        slidesPerView: 3,
                    },
                    767: {
                        slidesPerView: 2.5,
                    },
                    575: {
                        slidesPerView: 2,
                    },
                    400: {
                        slidesPerView: 1,
                    },
                },
            });
        }

        /* ================================
        Gallery Slider Js Start
        ================================ */

        if($('.gallery-slide').length > 0) {
            const gallerySlide = new Swiper(".gallery-slide", {
                spaceBetween: 30,
                speed: 1000,
                loop: true,
                autoplay: {
                    delay: 1500,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1399: {
                        slidesPerView: 7,
                    },
                     1199: {
                        slidesPerView: 6,
                    },
                    991: {
                        slidesPerView: 4.3,
                    },
                    767: {
                        slidesPerView: 3.2,
                    },
                    575: {
                        slidesPerView: 2,
                    },
                    400: {
                        slidesPerView: 1.2,
                    },
                },
            });
        }

        if($('.gallery-slide-3').length > 0) {
            const gallerySlide3 = new Swiper(".gallery-slide-3", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 4,
                    },
                    991: {
                        slidesPerView: 2.9,
                    },
                    767: {
                        slidesPerView: 2.1,
                    },
                    575: {
                        slidesPerView: 1.6,
                    },
                    400: {
                        slidesPerView: 1.2,
                    },
                },
            });
        }

        /* ================================
        Category Slider Js Start
        ================================ */

        if($('.catagory-slide-4').length > 0) {
            const catagorySlide4 = new Swiper(".catagory-slide-4", {
                spaceBetween: 30,
                speed: 1000,
                loop: true,
                autoplay: {
                    delay: 1500,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 7,
                    },
                    991: {
                        slidesPerView: 6,
                    },
                    767: {
                        slidesPerView: 5,
                    },
                    575: {
                        slidesPerView: 4,
                    },
                    400: {
                        slidesPerView: 3,
                    },
                },
            });
        }

         /* ================================
        Brand Slider Js Start
        ================================ */

        if($('.brand-slide').length > 0) {
            const brandSlide = new Swiper(".brand-slide", {
                spaceBetween: 30,
                speed: 1000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 7,
                    },
                    991: {
                        slidesPerView: 6,
                    },
                    767: {
                        slidesPerView: 4,
                    },
                    575: {
                        slidesPerView: 3,
                    },
                    400: {
                        slidesPerView: 3,
                    },
                    0: {
                        slidesPerView: 1.8,
                    },
                },
            });
        }

          if($('.brand-slide3').length > 0) {
            const brandSlide3 = new Swiper(".brand-slide3", {
                spaceBetween: 30,
                speed: 1000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1699: {
                        slidesPerView: 7,
                    },
                      1399: {
                        slidesPerView: 6,
                    },
                    1199: {
                        slidesPerView: 6,
                    },
                    991: {
                        slidesPerView: 5,
                    },
                    767: {
                        slidesPerView: 5,
                    },
                    575: {
                        slidesPerView: 4,
                    },
                    400: {
                        slidesPerView: 2,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                },
            });
        }

         /* ================================
        About Slider Js Start
        ================================ */

        if($('.about-slide-5').length > 0) {
            const aboutSlide5 = new Swiper(".about-slide-5", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 3,
                    },
                    991: {
                        slidesPerView: 2,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 1.5,
                    },
                    400: {
                        slidesPerView: 1,
                    },
                },
            });
        }

        /* ================================
        Testimonial Slider Js Start
        ================================ */

        if($('.testimonial-slide').length > 0) {
            const testimonialSlide = new Swiper(".testimonial-slide", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: ".array-next",
                    prevEl: ".array-prev",
                },
            });
        }

        if($('.testimonial-slide-2').length > 0) {
            const testimonialSlide2 = new Swiper(".testimonial-slide-2", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 3,
                    },
                    991: {
                        slidesPerView: 2,
                    },
                    767: {
                        slidesPerView: 1.9,
                    },
                    575: {
                        slidesPerView: 1.2,
                    },
                    400: {
                        slidesPerView: 1,
                    },
                },
            });
        }

        if($('.testimonial-slide-3').length > 0) {
            const testimonialSlide3 = new Swiper(".testimonial-slide-3", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 3.4,
                    },
                    991: {
                        slidesPerView: 2.5,
                    },
                    767: {
                        slidesPerView: 1.8,
                    },
                    575: {
                        slidesPerView: 1.5,
                    },
                    400: {
                        slidesPerView: 1,
                    },
                },
            });
        }

        if ($('.testimonial-slider-content').length) {
            var slider = new Swiper ('.testimonial-slider-content', {
                slidesPerView: 1,
                spaceBetween: 30,
                centeredSlides: true,
                speed: 1300,
                loop: true,
                loopedSlides: 6,
                navigation: {
                    nextEl: ".array-next",
                    prevEl: ".array-prev",
                },
            });
            var thumbs = new Swiper ('.testimonial-thumbs', {
                slidesPerView: 3,
                spaceBetween: 0,
                centeredSlides: true,
                loop: true,
                speed: 1300,
                slideToClickedSlide: true,
            });
            slider.controller.control = thumbs;
            thumbs.controller.control = slider;
        }

        /* ================================
        Project Slider Js Start
        ================================ */

        if($('.project-slide-2').length > 0) {
            const projectSlide2 = new Swiper(".project-slide-2", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                  pagination: {
                    el: ".dot2",
                    clickable: true,
                },
                breakpoints: {
                    1399: {
                        slidesPerView: 4,
                    },
                     1199: {
                        slidesPerView: 3.2,
                    },
                    991: {
                        slidesPerView: 2.8,
                    },
                    767: {
                        slidesPerView: 2.1,
                    },
                    575: {
                        slidesPerView: 1.4,
                    },
                    400: {
                        slidesPerView: 1.2,
                    },
                },
            });
        }

        if($('.project-slide-5').length > 0) {
            const projectSlide5 = new Swiper(".project-slide-5", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                  pagination: {
                    el: ".dot1",
                    clickable: true,
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 4,
                    },
                    991: {
                        slidesPerView: 3.1,
                    },
                    767: {
                        slidesPerView: 2.3,
                    },
                    575: {
                        slidesPerView: 1.5,
                    },
                    400: {
                        slidesPerView: 1,
                    },
                },
            });
        }

        /* ================================
        Team Slider Js Start
        ================================ */

        if($('.team-slide').length > 0) {
            const teamSlider = new Swiper(".team-slide", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                 navigation: {
                    nextEl: ".array-next",
                    prevEl: ".array-prev",
                },
                breakpoints: {
                    1399: {
                        slidesPerView: 3,
                    },
                     1199: {
                        slidesPerView: 2,
                    },
                    991: {
                        slidesPerView: 2,
                    },
                    767: {
                        slidesPerView: 1.6,
                    },
                    575: {
                        slidesPerView: 1.5,
                    },
                    400: {
                        slidesPerView: 1,
                    },
                },
            });
        }

         /* ================================
        Shop Slider Js Start
        ================================ */

        if($('.shop-slide-2').length > 0) {
            const shopSlide2 = new Swiper(".shop-slide-2", {
                spaceBetween: 30,
                speed: 2000,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                 navigation: {
                    nextEl: ".array-next",
                    prevEl: ".array-prev",
                },
                pagination: {
                    el: ".dot",
                    clickable: true,
                },
                breakpoints: {
                    1399: {
                        slidesPerView: 3,
                    },
                    1199: {
                        slidesPerView: 2.2,
                    },
                    991: {
                        slidesPerView: 1.8,
                    },
                    767: {
                        slidesPerView: 1.5,
                    },
                    575: {
                        slidesPerView: 1.3,
                    },
                    400: {
                        slidesPerView: 1,
                    },
                },
            });
        }
        
        if($('.shop-slide-3').length > 0) {
            const shopSlide3 = new Swiper(".shop-slide-3", {
                spaceBetween: 30,
                speed: 1500,
                loop: true,
                autoplay: {
                    delay: 1000,
                    disableOnInteraction: false,
                },
                 navigation: {
                    nextEl: ".array-next",
                    prevEl: ".array-prev",
                },
                breakpoints: {
                    1199: {
                        slidesPerView: 4,
                    },
                    991: {
                        slidesPerView: 3,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    575: {
                        slidesPerView: 1.7,
                    },
                    400: {
                        slidesPerView: 1,
                    },
                },
            });
        }
      

        /* ================================
        Custom Accordion Js Start
        ================================ */

        if ($('.accordion-box').length) {
            $(".accordion-box").on('click', '.acc-btn', function () {
                var outerBox = $(this).closest('.accordion-box');
                var target = $(this).closest('.accordion');
                var accBtn = $(this);
                var accContent = accBtn.next('.acc-content');

                if (target.hasClass('active-block')) {
                    // Already open, so close it
                    accBtn.removeClass('active');
                    target.removeClass('active-block');
                    accContent.slideUp(300);
                } else {
                    // Close all others
                    outerBox.find('.accordion').removeClass('active-block');
                    outerBox.find('.acc-btn').removeClass('active');
                    outerBox.find('.acc-content').slideUp(300);

                    // Open clicked one
                    accBtn.addClass('active');
                    target.addClass('active-block');
                    accContent.slideDown(300);
                }
            });
        }

        /* ================================
        Countdown Js Start
        ================================ */

        if ($('#countdown-container').length && $('#day').length) {
            let targetDate = new Date("2026-5-29 00:00:00").getTime();
            const countdownInterval = setInterval(function () {
                let currentDate = new Date().getTime();
                let remainingTime = targetDate - currentDate;

                if (remainingTime <= 0) {
                    clearInterval(countdownInterval);
                    $("#countdown-container").text("Countdown has ended!");
                } else {
                    let days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
                    let hours = Math.floor(
                        (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    );
                    let minutes = Math.floor(
                        (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
                    );
                    let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

                    // Pad single-digit values with leading zeros
                    $("#day").text(days.toString().padStart(2, "0"));
                    $("#hour").text(hours.toString().padStart(2, "0"));
                    $("#min").text(minutes.toString().padStart(2, "0"));
                    $("#sec").text(seconds.toString().padStart(2, "0"));
                }
            }, 1000);
        }

        /* ================================
        Quantity Increment/Decrement Js Start
        ================================ */

        const quantityButtons = document.querySelectorAll(".quantityIncrement, .quantityDecrement");
        if (quantityButtons.length) {
            quantityButtons.forEach((button) => {
                button.addEventListener("click", function () {
                    const input = button.parentElement.querySelector("input");
                    let value = parseInt(input.value, 10) || 0;

                    if (button.classList.contains("quantityIncrement")) {
                        input.value = value + 1;
                    } else if (button.classList.contains("quantityDecrement") && value > 1) {
                        input.value = value - 1;
                    }
                });
            });
        }
    
    
        /* ================================
        Payment Method Update Js Start
        ================================ */

        function updatePaymentMethod() {
            let paymentMethod = $("input[name='pay-method']:checked").val();
            $(".payment").html(paymentMethod);
        }

        // Initial load
        updatePaymentMethod();

        // On click of radio option
        $(".checkout-radio-single input[name='pay-method']").on("change", function () {
            updatePaymentMethod();
        });

     /* ================================
        Additional Quantity Controls Js Start
        ================================ */

        const inputs = document.querySelectorAll('#qty, #qty2, #qty3');
        const btnminus = document.querySelectorAll('.qtyminus');
        const btnplus = document.querySelectorAll('.qtyplus');

        if (inputs.length > 0 && btnminus.length > 0 && btnplus.length > 0) {

            inputs.forEach(function(input, index) {
                const min = Number(input.getAttribute('min'));
                const max = Number(input.getAttribute('max'));
                const step = Number(input.getAttribute('step'));

                function qtyminus(e) {
                    const current = Number(input.value);
                    let newval = (current - step);
                    if (newval < min) {
                        newval = min;
                    } else if (newval > max) {
                        newval = max;
                    }
                    input.value = Number(newval);
                    e.preventDefault();
                }

                function qtyplus(e) {
                    const current = Number(input.value);
                    let newval = (current + step);
                    if (newval > max) newval = max;
                    input.value = Number(newval);
                    e.preventDefault();
                }

                btnminus[index].addEventListener('click', qtyminus);
                btnplus[index].addEventListener('click', qtyplus);
            });
        }


        /* ================================
         Search Popup Toggle Js Start
      ================================ */
  
      if ($(".search-toggler").length) {
          $(".search-toggler").on("click", function(e) {
              e.preventDefault();
              $(".search-popup").toggleClass("active");
              $("body").toggleClass("locked");
          });
      }

      /* ================================
       Mouse Cursor Animation Js Start
    ================================ */

    if ($(".mouseCursor").length > 0) {
        function itCursor() {
            var myCursor = jQuery(".mouseCursor");
            if (myCursor.length) {
                if ($("body")) {
                    const e = document.querySelector(".cursor-inner"),
                        t = document.querySelector(".cursor-outer");
                    let n,
                        i = 0,
                        o = !1;
                    (window.onmousemove = function(s) {
                        o ||
                            (t.style.transform =
                                "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                            (e.style.transform =
                                "translate(" + s.clientX + "px, " + s.clientY + "px)"),
                            (n = s.clientY),
                            (i = s.clientX);
                    }),
                    $("body").on(
                            "mouseenter",
                            "button, a, .cursor-pointer",
                            function() {
                                e.classList.add("cursor-hover"),
                                    t.classList.add("cursor-hover");
                            }
                        ),
                        $("body").on(
                            "mouseleave",
                            "button, a, .cursor-pointer",
                            function() {
                                ($(this).is("a", "button") &&
                                    $(this).closest(".cursor-pointer").length) ||
                                (e.classList.remove("cursor-hover"),
                                    t.classList.remove("cursor-hover"));
                            }
                        ),
                        (e.style.visibility = "visible"),
                        (t.style.visibility = "visible");
                }
            }
        }
        itCursor();
      }

    /* ================================
       Back To Top Button Js Start
    ================================ */
	$(window).on('scroll', function () {
		if ($(this).scrollTop() > 20) {
			$('#back-top').addClass('show');
		} else {
			$('#back-top').removeClass('show');
		}
	});

	// Smooth scroll to top on click
	$(document).on('click', '#back-top', function (e) {
		e.preventDefault();
		$('html, body').animate({ scrollTop: 0 }, 350);
	});
      

    /* ================================
       Text Anim Js Start
    ================================ */

    if ($(".text-anim").length) {
        let staggerAmount = 0.03,
            translateXValue = 20,
            delayValue = 0.1,
            easeType = "power2.out",
            animatedTextElements = document.querySelectorAll(".text-anim");

        animatedTextElements.forEach(element => {
            const accessibleText = (element.textContent || "").replace(/\s+/g, " ").trim();
            if (accessibleText) element.setAttribute("aria-label", accessibleText);
            let animationSplitText = new SplitText(element, { type: "chars, words" });
            animationSplitText.chars.forEach(char => char.setAttribute("aria-hidden", "true"));
            if (animationSplitText.words) {
                animationSplitText.words.forEach(word => word.setAttribute("aria-hidden", "true"));
            }

            ScrollTrigger.create({
                trigger: element,
                start: "top 85%",
                onEnter: () => {
                    gsap.from(animationSplitText.chars, {
                        duration: 1,
                        delay: delayValue,
                        x: translateXValue,
                        autoAlpha: 0,
                        stagger: staggerAmount,
                        ease: easeType,
                    });
                },
            });
        });
    }

        
    // circle-progress
        $(".circle-bar").loading();

    }); // End Document Ready Function

     /* ================================
        Price Range Slider Js Start
    ================================ */

    document.addEventListener("DOMContentLoaded", function () {
        const minSlider = document.getElementById("min-slider");
        const maxSlider = document.getElementById("max-slider");
        const amount = document.getElementById("amount");
    
        // Exit early if essential elements are missing
        if (!minSlider || !maxSlider || !amount) return;
    
        function updateAmount() {
            let minValue = parseInt(minSlider.value, 10);
            let maxValue = parseInt(maxSlider.value, 10);
    
            // Swap values if min is greater than max
            if (minValue > maxValue) {
                [minValue, maxValue] = [maxValue, minValue];
                minSlider.value = minValue;
                maxSlider.value = maxValue;
            }
    
            // Update amount input
            amount.value = `$${minValue} - $${maxValue}`;
    
            // Calculate percentages for gradient
            const minPercent = ((minValue - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
            const maxPercent = ((maxValue - maxSlider.min) / (maxSlider.max - maxSlider.min)) * 100;
    
            const trackStyle = `linear-gradient(to right, #063232 ${minPercent}%, #5B8C51 ${minPercent}%, #5B8C51 ${maxPercent}%, #063232 ${maxPercent}%)`;
    
            minSlider.style.background = trackStyle;
            maxSlider.style.background = trackStyle;
        }
    
        // Initialize on page load
        updateAmount();
    
        // Add event listeners
        minSlider.addEventListener("input", updateAmount);
        maxSlider.addEventListener("input", updateAmount);
    });

    /* ================================
       Preloader Js Start
    ================================ */
    function loader() {
        $(window).on('load', function() {
            // Animate loader off screen
            $(".preloader").addClass('loaded');                    
            $(".preloader").delay(600).fadeOut();                       
        });
    }
    loader();
    
     /* ================================
        Circle Progressbar Slider Js Start
        ================================ */

    $.fn.loading = function() {
        const DEFAULTS = {
            backgroundColor: '#b3cef6',
            progressColor: '#4b86db',
            percent: 75,
            duration: 2000
        };

        $(this).each(function() {
            const $target = $(this);

            const opts = {
                backgroundColor: $target.data('color') ? $target.data('color').split(',')[0] : DEFAULTS.backgroundColor,
                progressColor: $target.data('color') ? $target.data('color').split(',')[1] : DEFAULTS.progressColor,
                percent: $target.data('percent') ? $target.data('percent') : DEFAULTS.percent,
                duration: $target.data('duration') ? $target.data('duration') : DEFAULTS.duration
            };
            // console.log(opts);

            $target.append('<div class="background"></div><div class="rotate"></div><div class="left"></div><div class="right"></div><div class=""><span>' + opts.percent + '%</span></div>');

            $target.find('.background').css('background-color', opts.backgroundColor);
            $target.find('.left').css('background-color', opts.backgroundColor);
            $target.find('.rotate').css('background-color', opts.progressColor);
            $target.find('.right').css('background-color', opts.progressColor);

            const $rotate = $target.find('.rotate');
            setTimeout(function() {
                $rotate.css({
                    'transition': 'transform ' + opts.duration + 'ms linear',
                    'transform': 'rotate(' + opts.percent * 3.6 + 'deg)'
                });
            }, 1);

            if (opts.percent > 50) {
                let animationRight = 'toggle ' + (opts.duration / opts.percent * 50) + 'ms step-end';
                let animationLeft = 'toggle ' + (opts.duration / opts.percent * 50) + 'ms step-start';
                $target.find('.right').css({
                    animation: animationRight,
                    opacity: 1
                });
                $target.find('.left').css({
                    animation: animationLeft,
                    opacity: 0
                });
            }
        });
    }

    
})(jQuery); // End jQuery
