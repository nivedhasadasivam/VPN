(function () {
  var AUTH_KEYS = [
    "vpnexuesAuth",
    "vpnexuesLoggedIn",
    "vpnexuesSession",
    "vpnexuesUser",
    "isLoggedIn",
    "loggedInUser",
    "authToken",
    "userToken",
    "currentUser"
  ];

  function isLoggedIn() {
    return AUTH_KEYS.some(function (key) {
      return localStorage.getItem(key) === "true" || sessionStorage.getItem(key) === "true";
    });
  }

  function readUser() {
    var sources = [
      localStorage.getItem("vpnexuesUser"),
      sessionStorage.getItem("vpnexuesUser"),
      localStorage.getItem("loggedInUser"),
      sessionStorage.getItem("loggedInUser"),
      localStorage.getItem("currentUser"),
      sessionStorage.getItem("currentUser")
    ];
    for (var i = 0; i < sources.length; i += 1) {
      if (!sources[i]) continue;
      try { return JSON.parse(sources[i]); } catch (e) { return { name: sources[i] }; }
    }
    return {};
  }

  function clearAuthStorage(storage) {
    var keysToRemove = [];
    for (var i = 0; i < storage.length; i += 1) {
      var key = storage.key(i);
      if (AUTH_KEYS.indexOf(key) !== -1 || /(auth|login|logged|token|session|currentUser)/i.test(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(function (key) { storage.removeItem(key); });
  }

  function logout() {
    clearAuthStorage(localStorage);
    clearAuthStorage(sessionStorage);
    localStorage.removeItem("cart");
    window.location.href = "index.html";
  }

  function readWishlist() {
    try {
      var w = JSON.parse(localStorage.getItem("vpnexuesWishlist") || "[]");
      return Array.isArray(w) ? w : [];
    } catch (e) { return []; }
  }

  function renderWishlist() {
    var container = document.querySelector("[data-wishlist-items]");
    if (!container) return;
    var wishlist = readWishlist();
    container.replaceChildren();
    if (!wishlist.length) {
      var empty = document.createElement("p");
      empty.className = "wishlist-empty";
      empty.textContent = "Your wishlist is empty. Add products from the Shop page.";
      container.appendChild(empty);
      return;
    }
    wishlist.forEach(function (product) {
      var item = document.createElement("article");
      item.className = "wishlist-item";
      var image = document.createElement("img");
      image.src = product.img || "";
      image.alt = product.name || "Wishlist product";
      var details = document.createElement("div");
      var name = document.createElement("strong");
      name.textContent = product.name || "Product";
      var price = document.createElement("small");
      price.textContent = "$" + Number(product.price || 0).toFixed(2) + (product.unit ? " · " + product.unit : "");
      details.append(name, price);
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "wishlist-item__remove";
      remove.setAttribute("aria-label", "Remove " + (product.name || "product"));
      remove.innerHTML = '<i class="fas fa-heart"></i>';
      remove.addEventListener("click", function () {
        var next = readWishlist().filter(function (e) { return String(e.id) !== String(product.id); });
        localStorage.setItem("vpnexuesWishlist", JSON.stringify(next));
        renderWishlist();
      });
      item.append(image, details, remove);
      container.appendChild(item);
    });
  }

  function openWishlist() {
    var panel = document.getElementById("wishlist-panel");
    if (!panel) return;
    renderWishlist();
    panel.hidden = false;
  }

  function closeWishlist() {
    var panel = document.getElementById("wishlist-panel");
    if (panel) panel.hidden = true;
  }

  if (!isLoggedIn()) {
    window.location.replace("index.html?login=1");
    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-logout]").forEach(function (btn) {
      btn.addEventListener("click", logout);
    });
    document.querySelectorAll("[data-wishlist]").forEach(function (link) {
      link.addEventListener("click", openWishlist);
    });
    document.querySelectorAll("[data-wishlist-close]").forEach(function (btn) {
      btn.addEventListener("click", closeWishlist);
    });
    var wp = document.getElementById("wishlist-panel");
    if (wp) {
      wp.addEventListener("click", function (e) {
        if (e.target === e.currentTarget) closeWishlist();
      });
    }

    document.querySelectorAll(".acc-menu-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sectionId = this.getAttribute("data-section");
        var section = document.getElementById(sectionId);
        if (!section) return;
        var isOpen = !section.hidden;
        section.hidden = isOpen;
        this.classList.toggle("open", !isOpen);
      });
    });

    document.querySelectorAll(".np-toggle input[data-key]").forEach(function (input) {
      var saved = localStorage.getItem(input.getAttribute("data-key"));
      if (saved !== null) input.checked = saved === "true";
      input.addEventListener("change", function () {
        localStorage.setItem(this.getAttribute("data-key"), this.checked);
      });
    });

    var deleteBtn = document.getElementById("acc-delete-btn");
    var deleteModal = document.getElementById("acc-delete-modal");
    var modalClose = document.getElementById("acc-modal-close");
    var modalCancel = document.getElementById("acc-modal-cancel");
    var modalConfirm = document.getElementById("acc-modal-confirm");
    var reasonText = document.getElementById("acc-reason-text");
    var otherRadio = document.querySelector('input[name="deleteReason"][value="other"]');

    function openDeleteModal() {
      if (deleteModal) deleteModal.classList.add("open");
    }

    function closeDeleteModal() {
      if (deleteModal) deleteModal.classList.remove("open");
      var checked = deleteModal ? deleteModal.querySelector('input[name="deleteReason"]:checked') : null;
      if (checked) checked.checked = false;
      if (reasonText) { reasonText.value = ""; reasonText.style.display = "none"; }
    }

    if (deleteBtn) deleteBtn.addEventListener("click", openDeleteModal);
    if (modalClose) modalClose.addEventListener("click", closeDeleteModal);
    if (modalCancel) modalCancel.addEventListener("click", closeDeleteModal);

    if (deleteModal) {
      deleteModal.addEventListener("click", function (e) {
        if (e.target === e.currentTarget) closeDeleteModal();
      });
    }

    document.querySelectorAll('input[name="deleteReason"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (reasonText) {
          reasonText.style.display = this.value === "other" ? "block" : "none";
          if (this.value !== "other") reasonText.value = "";
        }
      });
    });

    if (reasonText) reasonText.style.display = "none";

    function handleDeleteSubmit() {
      var selected = deleteModal ? deleteModal.querySelector('input[name="deleteReason"]:checked') : null;
      if (!selected) {
        alert("Please select a reason for deleting your account.");
        return;
      }
      if (selected.value === "other" && reasonText && !reasonText.value.trim()) {
        alert("Please provide a reason for deleting your account.");
        return;
      }
      clearAuthStorage(localStorage);
      clearAuthStorage(sessionStorage);
      localStorage.removeItem("cart");
      window.location.href = "index.html?deleted=1";
    }

    if (modalConfirm) {
      modalConfirm.addEventListener("click", handleDeleteSubmit);
    }
  });
})();
