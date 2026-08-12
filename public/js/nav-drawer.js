/* ============================================================
   NirithyBlog - Navigation Drawer
   MD3 modal navigation drawer with dynamic nav items
   ============================================================ */

(function (global) {
  "use strict";

  var NavDrawer = {};

  function t(key) {
    if (global.I18N) return I18N.t(key);
    return key;
  }

  // ===== Build drawer HTML =====
  function buildDrawerHTML() {
    var isAdmin = false;
    if (global.Auth && Auth.getUser()) {
      isAdmin = Auth.getUser().role === "admin";
    }

    var html =
      '<div class="nav-drawer__scrim" id="navScrim"></div>' +
      '<aside class="nav-drawer" id="navDrawer">' +
      '<div class="nav-drawer__header">' +
      '<span class="nav-drawer__title">' +
      (global.MD3 && MD3.blogTitle ? MD3.blogTitle : "NirithyBlog") +
      "</span>" +
      "</div>" +
      '<nav class="nav-drawer__content">';

    // Home
    html +=
      '<a class="nav-drawer__item" href="/" data-i18n="nav.home">' +
      '<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>' +
      '<span>' + t("nav.home") + "</span>" +
      "</a>";

    // Profile (if logged in)
    if (global.Auth && Auth.isLoggedIn() && Auth.getUser()) {
      var user = Auth.getUser();
      html +=
        '<a class="nav-drawer__item" href="/profile.html?u=' +
        encodeURIComponent(user.username) + '" data-i18n="nav.profile">' +
        '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' +
        '<span>' + t("nav.profile") + "</span>" +
        "</a>";
    }

    // Tags
    html +=
      '<a class="nav-drawer__item" href="/tags" data-i18n="nav.tags">' +
      '<svg viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>' +
      '<span>' + t("nav.tags") + "</span>" +
      "</a>";

    // Categories
    html +=
      '<a class="nav-drawer__item" href="/category" data-i18n="nav.categories">' +
      '<svg viewBox="0 0 24 24"><path d="M12 2l-5.5 9h11z" fill="currentColor"/><path d="M17.5 17h-11l5.5-6z" opacity="0.5" fill="currentColor"/><circle cx="6" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
      '<span>' + t("nav.categories") + "</span>" +
      "</a>";

    // Divider
    html += '<hr class="nav-drawer__divider">';

    // Admin (only for admins)
    if (isAdmin) {
      html +=
        '<a class="nav-drawer__item nav-drawer__item--active" href="/admin.html" data-i18n="nav.admin">' +
        '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>' +
        '<span>' + t("nav.admin") + "</span>" +
        "</a>";
      html += '<hr class="nav-drawer__divider">';
    }

    // New Post (if logged in)
    if (global.Auth && Auth.isLoggedIn() && Auth.getUser()) {
      html +=
        '<a class="nav-drawer__item" href="/editor.html" data-i18n="nav.new_post">' +
        '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' +
        '<span>' + t("nav.new_post") + "</span>" +
        "</a>";
    }

    html += "</nav>";

    // Footer
    html +=
      '<div class="nav-drawer__footer">' +
      '<a href="https://github.com/ZeroFxc/NirithyBlog" target="_blank" rel="noopener noreferrer" class="nav-drawer__footer-link">' +
      '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>' +
      '<span>GitHub</span>' +
      "</a>" +
      "</div>";

    html += "</aside>";

    return html;
  }

  // ===== Open / Close =====
  NavDrawer.open = function () {
    var drawer = document.getElementById("navDrawer");
    var scrim = document.getElementById("navScrim");
    if (!drawer) return;

    // Rebuild content (in case auth state changed)
    var container = document.getElementById("navDrawerContainer");
    if (container) {
      container.innerHTML = buildDrawerHTML();
      NavDrawer.bindEvents();
    }

    drawer = document.getElementById("navDrawer");
    scrim = document.getElementById("navScrim");
    if (drawer) drawer.classList.add("nav-drawer--open");
    if (scrim) scrim.classList.add("nav-drawer__scrim--show");
  };

  NavDrawer.close = function () {
    var drawer = document.getElementById("navDrawer");
    var scrim = document.getElementById("navScrim");
    if (drawer) drawer.classList.remove("nav-drawer--open");
    if (scrim) scrim.classList.remove("nav-drawer__scrim--show");
  };

  NavDrawer.toggle = function () {
    var drawer = document.getElementById("navDrawer");
    if (drawer && drawer.classList.contains("nav-drawer--open")) {
      NavDrawer.close();
    } else {
      NavDrawer.open();
    }
  };

  // ===== Bind Events =====
  NavDrawer.bindEvents = function () {
    var scrim = document.getElementById("navScrim");
    if (scrim) {
      scrim.onclick = NavDrawer.close;
    }

    // Close on nav item click
    var items = document.querySelectorAll(".nav-drawer__item");
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        NavDrawer.close();
      });
    });
  };

  // ===== Init =====
  NavDrawer.init = function () {
    var container = document.getElementById("navDrawerContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "navDrawerContainer";
      document.body.appendChild(container);
    }
    container.innerHTML = buildDrawerHTML();
    NavDrawer.bindEvents();

    // Bind menu button
    var menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
      menuBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        NavDrawer.toggle();
      });
    }

    // After Auth finishes async init, rebuild drawer with correct user info
    if (global.Auth && Auth.ready) {
      Auth.ready().then(function () {
        var c = document.getElementById("navDrawerContainer");
        if (c) {
          c.innerHTML = buildDrawerHTML();
          NavDrawer.bindEvents();
        }
      });
    }

    // Rebuild on auth change
    window.addEventListener("authChanged", function () {
      var c = document.getElementById("navDrawerContainer");
      if (c) {
        c.innerHTML = buildDrawerHTML();
        NavDrawer.bindEvents();
      }
    });
  };

  global.NavDrawer = NavDrawer;
})(window);
