(function () {
  "use strict";

  function onReady(callback) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", callback);
    else callback();
  }

  onReady(function () {
    var home = document.querySelector(".vpn-premium-home");
    if (!home) return;

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var HOME_PRODUCTS = [
      { id: 1, name: "Organic Carrots", cat: "Vegetables", unit: "500 g", price: 2.80, old: 3.50, inr: 45, oldInr: 56, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Organic Carrots.jpg', badge: "20% off" },
      { id: 2, name: "Vine Tomatoes", cat: "Vegetables", unit: "1 kg", price: 3.90, old: 4.80, inr: 20, oldInr: 26, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Vine Tomatoes.jpg', badge: "Best seller" },
      { id: 3, name: "Baby Spinach", cat: "Vegetables", unit: "200 g", price: 3.20, old: null, inr: 25, oldInr: 32, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Baby Spinach.jpg', badge: "Farm fresh" },
      { id: 4, name: "Sweet Corn", cat: "Vegetables", unit: "1 piece", price: 1.90, old: 2.50, inr: 25, oldInr: 32, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Sweet Corn.jpg', badge: "Farm fresh" },
      { id: 7, name: "Broccoli Head", cat: "Vegetables", unit: "1 piece", price: 3.50, old: 4.20, inr: 60, oldInr: 75, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Broccoli Head.jpg', badge: "Best seller" },
      { id: 8, name: "Cucumber", cat: "Vegetables", unit: "1 piece", price: 1.80, old: null, inr: 15, oldInr: 20, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Cucumber.jpg', badge: "Farm fresh" },
      { id: 51, name: "Alphonso Mango", cat: "Fruits", unit: "3 pieces", price: 12.00, old: 15.00, inr: 180, oldInr: 220, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Alphonso Mango.jpg', badge: "20% off" },
      { id: 52, name: "Fresh Bananas", cat: "Fruits", unit: "1 bunch", price: 3.20, old: 4.00, inr: 40, oldInr: 50, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Fresh Bananas.jpg', badge: "Best seller" },
      { id: 57, name: "Fresh Pineapple", cat: "Fruits", unit: "1 piece", price: 6.80, old: 8.50, inr: 40, oldInr: 50, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Fresh Pineapple.jpg', badge: "Farm fresh" },
      { id: 110, name: "Pineapple Vinegar", cat: "Beverages", unit: "500 ml", price: 9.50, old: 12.00, inr: 120, oldInr: 150, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Pineapple Vinegar.jpg', badge: "Best seller" },
      { id: 111, name: "Basmati Rice", cat: "Groceries", unit: "2 kg", price: 9.80, old: 12.50, inr: 250, oldInr: 300, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Basmati Rice.jpg', badge: "15% off" },
      { id: 114, name: "Free Range Eggs", cat: "Groceries", unit: "12 pieces", price: 6.50, old: 8.00, inr: 220, oldInr: 265, img:'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images/Free Range Eggs.jpg', badge: "Best seller" }
    ];

    function homeReadCart() {
      try {
        var cart = JSON.parse(localStorage.getItem("cart") || "[]");
        return Array.isArray(cart) ? cart : [];
      } catch (error) {
        return [];
      }
    }

    function homeWriteCart(cart) {
      localStorage.setItem("cart", JSON.stringify(cart));
      if (typeof window.updateCartBadge === "function") window.updateCartBadge();
    }

    function initHomeProducts() {
      var grid = home.querySelector("[data-home-products]");
      if (!grid) return;

      function render() {
        var cart = homeReadCart();
        grid.innerHTML = HOME_PRODUCTS.map(function (product, index) {
          var item = cart.find(function (entry) { return String(entry.id) === String(product.id); });
          var quantity = item ? Number(item.qty || item.quantity) || 0 : 0;
          var actionHtml = quantity ?
            '<div class="vpn-premium-product-actions is-active" aria-label="Adjust ' + product.name + ' quantity">' +
            '<button class="vpn-premium-product-decrease" type="button" data-home-quantity="decrease" data-product-id="' + product.id + '" aria-label="Remove one ' + product.name + '"><i class="fas fa-minus" aria-hidden="true"></i></button>' +
            '<output class="vpn-premium-product-quantity">' + quantity + '</output>' +
            '<button class="vpn-premium-product-add is-added" type="button" data-home-quantity="increase" data-product-id="' + product.id + '" aria-label="Add more ' + product.name + ' to cart"><i class="fas fa-plus" aria-hidden="true"></i></button>' +
            '</div>' :
            '<div class="vpn-premium-product-actions is-empty" aria-label="Add ' + product.name + ' to cart">' +
            '<button class="vpn-premium-product-add is-empty-add" type="button" data-home-quantity="increase" data-product-id="' + product.id + '" aria-label="Add ' + product.name + ' to cart"><i class="fas fa-shopping-cart" aria-hidden="true"></i><span>Add to cart</span><i class="fas fa-plus" aria-hidden="true"></i></button>' +
            '</div>';
          return '<article class="vpn-premium-product' + (quantity ? ' is-added' : '') + '" data-product-id="' + product.id + '" style="--vpn-product-index:' + index + '">' +
            '<span class="vpn-premium-sale">' + product.badge + '</span>' +
            '<a class="vpn-premium-product-image" href="shop.html" aria-label="View ' + product.name + '"><img loading="lazy" decoding="async" src="' + product.img + '" alt="' + product.name + '"></a>' +
            '<span class="vpn-premium-product-meta">' + product.cat + '</span>' +
            '<strong>' + product.name + '</strong>' +
            '<small>' + product.unit + '</small>' +
            '<span class="vpn-premium-price"><b>&#8377;' + product.inr + '</b><del>&#8377;' + product.oldInr + '</del></span>' +
            actionHtml +
            '</article>';
        }).join("");
      }

      grid.addEventListener("click", function (event) {
        var control = event.target.closest("[data-home-quantity]");
        if (!control || !grid.contains(control)) return;
        event.preventDefault();
        var product = HOME_PRODUCTS.find(function (entry) { return String(entry.id) === String(control.dataset.productId); });
        if (!product) return;

        var cart = homeReadCart();
        var existing = cart.find(function (entry) { return String(entry.id) === String(product.id); });
        var delta = control.dataset.homeQuantity === "decrease" ? -1 : 1;
        if (existing && delta < 0) {
          var nextQuantity = Math.max(0, (Number(existing.qty || existing.quantity) || 0) + delta);
          if (nextQuantity === 0) cart = cart.filter(function (entry) { return String(entry.id) !== String(product.id); });
          else {
            existing.qty = nextQuantity;
            existing.quantity = nextQuantity;
          }
        } else if (existing) {
          existing.qty = (Number(existing.qty || existing.quantity) || 0) + delta;
          existing.quantity = existing.qty;
        } else if (delta > 0) {
          cart.push({
            id: product.id,
            name: product.name,
            title: product.name,
            cat: product.cat,
            price: product.price,
            old: product.old,
            mrp: product.old || product.price,
            inrPrice: product.inr,
            inrOldPrice: product.oldInr,
            unit: product.unit,
            weight: product.unit,
            img: product.img,
            image: product.img,
            qty: 1,
            quantity: 1
          });
        }
        homeWriteCart(cart);
        render();
        if (delta > 0 && typeof window.showToast === "function") window.showToast(product.name + " added to cart", "success");
      });

      render();
    }

    function makeDots(container, slides, activate) {
      if (!container) return [];
      container.innerHTML = "";
      return slides.map(function (slide, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Go to slide " + (index + 1));
        dot.addEventListener("click", function () { activate(index, true); });
        container.appendChild(dot);
        return dot;
      });
    }

    function initFadeCarousel(root, interval) {
      var slides = Array.prototype.slice.call(root.querySelectorAll("[data-slide]"));
      var dots = makeDots(root.querySelector("[data-carousel-dots]"), slides, activate);
      var index = 0;
      var timer;
      var paused = false;

      function activate(next, userInitiated) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          var active = itemIndex === index;
          slide.classList.toggle("is-active", active);
          slide.setAttribute("aria-hidden", active ? "false" : "true");
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
          dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
        });
        if (userInitiated) restart();
      }

      function restart() {
        window.clearInterval(timer);
        if (!reducedMotion && !paused) timer = window.setInterval(function () { activate(index + 1, false); }, interval);
      }

      root.querySelector("[data-carousel-prev]").addEventListener("click", function () { activate(index - 1, true); });
      root.querySelector("[data-carousel-next]").addEventListener("click", function () { activate(index + 1, true); });
      root.addEventListener("mouseenter", function () { paused = true; window.clearInterval(timer); });
      root.addEventListener("mouseleave", function () { paused = false; restart(); });
      root.addEventListener("focusin", function () { paused = true; window.clearInterval(timer); });
      root.addEventListener("focusout", function (event) { if (!root.contains(event.relatedTarget)) { paused = false; restart(); } });
      activate(0, false);
      restart();
    }

    function initProductCarousel(root) {
      var track = root.querySelector(".vpn-premium-product-track");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".vpn-premium-product"));
      var index = 0;
      var timer;
      var paused = false;

      function visibleCount() {
        if (window.innerWidth <= 760) return 1;
        if (window.innerWidth <= 1100) return 3;
        return 4;
      }

      function maxIndex() { return Math.max(0, cards.length - visibleCount()); }

      function render(userInitiated) {
        var card = cards[0];
        if (!card) return;
        index = Math.min(index, maxIndex());
        var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
        var step = card.getBoundingClientRect().width + gap;
        track.style.transform = "translate3d(" + (-index * step) + "px, 0, 0)";
        if (userInitiated) restart();
        var status = home.querySelector("[data-carousel-status]");
        if (status) status.textContent = "Showing fresh picks " + (index + 1) + " of " + (maxIndex() + 1);
      }

      function restart() {
        window.clearInterval(timer);
        if (!reducedMotion && !paused && maxIndex() > 0) timer = window.setInterval(function () {
          index = index >= maxIndex() ? 0 : index + 1;
          render(false);
        }, 3400);
      }

      root.querySelector("[data-carousel-prev]").addEventListener("click", function () { index = index <= 0 ? maxIndex() : index - 1; render(true); });
      root.querySelector("[data-carousel-next]").addEventListener("click", function () { index = index >= maxIndex() ? 0 : index + 1; render(true); });
      root.addEventListener("mouseenter", function () { paused = true; window.clearInterval(timer); });
      root.addEventListener("mouseleave", function () { paused = false; restart(); });
      root.addEventListener("focusin", function () { paused = true; window.clearInterval(timer); });
      root.addEventListener("focusout", function (event) { if (!root.contains(event.relatedTarget)) { paused = false; restart(); } });
      window.addEventListener("resize", function () { render(false); restart(); });
      render(false);
      restart();
    }

    function initOfferCarousel(root, interval) {
      if (!root || !root.querySelector(".vpn-premium-offer-track")) return;
      var track = root.querySelector(".vpn-premium-offer-track");
      var slides = Array.prototype.slice.call(root.querySelectorAll(".vpn-premium-offer-slide"));
      var dots = makeDots(root.querySelector("[data-carousel-dots]"), slides, activate);
      var index = 0;
      var timer;
      var paused = false;

      function activate(next, userInitiated) {
        index = (next + slides.length) % slides.length;
        track.style.transform = "translate3d(" + (-index * 100) + "%, 0, 0)";
        slides.forEach(function (slide, itemIndex) { slide.setAttribute("aria-hidden", itemIndex === index ? "false" : "true"); });
        dots.forEach(function (dot, dotIndex) { dot.classList.toggle("is-active", dotIndex === index); dot.setAttribute("aria-current", dotIndex === index ? "true" : "false"); });
        if (userInitiated) restart();
      }
      function restart() {
        window.clearInterval(timer);
        if (!reducedMotion && !paused) timer = window.setInterval(function () { activate(index + 1, false); }, interval);
      }
      root.querySelector("[data-carousel-prev]").addEventListener("click", function () { activate(index - 1, true); });
      root.querySelector("[data-carousel-next]").addEventListener("click", function () { activate(index + 1, true); });
      root.addEventListener("mouseenter", function () { paused = true; window.clearInterval(timer); });
      root.addEventListener("mouseleave", function () { paused = false; restart(); });
      root.addEventListener("focusin", function () { paused = true; window.clearInterval(timer); });
      root.addEventListener("focusout", function (event) { if (!root.contains(event.relatedTarget)) { paused = false; restart(); } });
      activate(0, false);
      restart();
    }

    function initReveal() {
      var items = home.querySelectorAll(".vpn-reveal");
      if (reducedMotion || !("IntersectionObserver" in window)) {
        items.forEach(function (item) { item.classList.add("is-visible"); });
        return;
      }
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
        });
      }, { threshold: .12 });
      items.forEach(function (item) { observer.observe(item); });
    }

    initFadeCarousel(home.querySelector('[data-home-carousel="hero"]'), 5600);
    initHomeProducts();
    initOfferCarousel(home.querySelector('[data-home-carousel="offers"]'), 5400);
    initReveal();
  });
})();