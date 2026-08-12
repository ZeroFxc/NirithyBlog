/* ============================================================
   MD3 Blog - MD3 Component Library
   Theme toggle, ripple effect, snackbar, dialog, helpers
   ============================================================ */

(function (global) {
  "use strict";

  // ===== Theme Management =====
  function initTheme() {
    const saved = localStorage.getItem("md3-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    setTheme(theme);

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        const current = document.documentElement.getAttribute("data-theme");
        setTheme(current === "dark" ? "light" : "dark");
      });
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("md3-theme", theme);

    const lightIcon = document.getElementById("themeIconLight");
    const darkIcon = document.getElementById("themeIconDark");
    if (lightIcon && darkIcon) {
      if (theme === "dark") {
        lightIcon.style.display = "none";
        darkIcon.style.display = "block";
      } else {
        lightIcon.style.display = "block";
        darkIcon.style.display = "none";
      }
    }
  }

  // ===== Ripple Effect =====
  function attachRipple(el) {
    el.classList.add("ripple-container");
    el.addEventListener("click", function (e) {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";

      el.appendChild(ripple);
      ripple.addEventListener("animationend", function () {
        ripple.remove();
      });
    });
  }

  function initRipples() {
    const selectors = [
      ".btn-filled",
      ".btn-tonal",
      ".btn-outlined",
      ".btn-text",
      ".icon-button",
      ".fab",
      ".chip",
      ".card",
      ".nav-rail__item",
      ".toolbar-btn",
    ];
    document.querySelectorAll(selectors.join(",")).forEach(attachRipple);
  }

  // ===== App Bar Scroll Shadow =====
  function initAppBarShadow() {
    const appBar = document.getElementById("appBar");
    if (!appBar) return;

    function update() {
      if (window.scrollY > 0) {
        appBar.classList.add("scrolled");
      } else {
        appBar.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // ===== Snackbar =====
  let snackbarTimer = null;

  function showSnackbar(message, duration) {
    duration = duration || 4000;
    const snackbar = document.getElementById("snackbar");
    const text = document.getElementById("snackbarText");
    if (!snackbar || !text) return;

    text.textContent = message;
    snackbar.classList.add("snackbar--show");

    if (snackbarTimer) clearTimeout(snackbarTimer);
    snackbarTimer = setTimeout(function () {
      snackbar.classList.remove("snackbar--show");
    }, duration);
  }

  // ===== Dialog =====
  function showDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    const scrim = document.querySelector(".dialog-scrim");
    if (!dialog) return;

    if (scrim) scrim.classList.add("dialog-scrim--show");
    dialog.classList.add("dialog--show");
  }

  function hideDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    const scrim = document.querySelector(".dialog-scrim");
    if (!dialog) return;

    if (scrim) scrim.classList.remove("dialog-scrim--show");
    dialog.classList.remove("dialog--show");
  }

  // ===== Date Formatting =====
  function formatDate(isoString) {
    var d = new Date(isoString);
    var months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return (
      d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear()
    );
  }

  function formatDateTime(isoString) {
    var d = new Date(isoString);
    var months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    var hh = d.getHours().toString().padStart(2, "0");
    var mm = d.getMinutes().toString().padStart(2, "0");
    return (
      d.getDate() +
      " " +
      months[d.getMonth()] +
      " " +
      d.getFullYear() +
      ", " +
      hh +
      ":" +
      mm
    );
  }

  function timeAgo(isoString) {
    var now = Date.now();
    var then = new Date(isoString).getTime();
    var diff = Math.floor((now - then) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
    if (diff < 2592000) return Math.floor(diff / 604800) + "w ago";
    if (diff < 31536000) return Math.floor(diff / 2592000) + "mo ago";
    return Math.floor(diff / 31536000) + "y ago";
  }

  // ===== API Helper =====
  async function api(path, options) {
    options = options || {};
    var url = "/api" + path;
    var fetchOptions = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    if (options.headers) {
      Object.assign(fetchOptions.headers, options.headers);
    }

    var response = await fetch(url, fetchOptions);
    var data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  }

  // ===== Escape HTML =====
  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== Initialize on DOM Ready =====
  function init() {
    initTheme();
    initRipples();
    initAppBarShadow();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ===== Export =====
  global.MD3 = {
    initTheme: initTheme,
    setTheme: setTheme,
    attachRipple: attachRipple,
    initRipples: initRipples,
    showSnackbar: showSnackbar,
    showDialog: showDialog,
    hideDialog: hideDialog,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    timeAgo: timeAgo,
    api: api,
    escapeHtml: escapeHtml,
  };
})(window);
