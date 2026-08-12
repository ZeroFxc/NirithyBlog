/* ============================================================
   NirithyBlog - Auth & User System
   Login, register, logout, user state, check-in
   ============================================================ */

(function (global) {
  "use strict";

  var Auth = {};

  // ===== State =====
  var token = localStorage.getItem("nb-token");
  var currentUser = null;

  // ===== i18n helper =====
  function t(key) {
    if (global.I18N) return I18N.t(key);
    return key;
  }

  // ===== Get/Set Token =====
  Auth.getToken = function () {
    return token;
  };

  Auth.setToken = function (t) {
    token = t;
    if (t) {
      localStorage.setItem("nb-token", t);
    } else {
      localStorage.removeItem("nb-token");
    }
  };

  Auth.isLoggedIn = function () {
    return !!token;
  };

  Auth.getUser = function () {
    return currentUser;
  };

  Auth.refreshUser = async function () {
    if (!token) return;
    try {
      var data = await apiCall("/auth/me");
      currentUser = data.user;
      Auth.updateUI();
    } catch (e) {
      Auth.setToken(null);
      currentUser = null;
      Auth.updateUI();
    }
  };

  // ===== API calls =====
  async function apiCall(path, options) {
    options = options || {};
    var url = "/api" + path;
    var fetchOpts = {
      method: options.method || "GET",
      headers: { "Content-Type": "application/json" },
    };
    if (options.body) {
      fetchOpts.body = JSON.stringify(options.body);
    }
    if (token) {
      fetchOpts.headers["Authorization"] = "Bearer " + token;
    }

    var response = await fetch(url, fetchOpts);
    var data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  }

  // ===== Init =====
  Auth._initPromise = null;

  Auth.init = function () {
    if (Auth._initPromise) return Auth._initPromise;
    Auth._initPromise = (async function () {
      // Capture token from URL (GitHub OAuth redirect)
      var urlParams = new URLSearchParams(window.location.search);
      var urlToken = urlParams.get("token");
      if (urlToken) {
        Auth.setToken(urlToken);
        token = urlToken;
        // Clean URL
        var cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // Handle error params
      var urlError = urlParams.get("error");
      if (urlError) {
        setTimeout(function () {
          if (global.MD3 && MD3.showSnackbar) {
            MD3.showSnackbar(t("auth." + urlError) || t("auth.github_failed"));
          }
        }, 500);
        var cleanUrl2 = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl2);
      }

      // Handle bound=github success
      var bound = urlParams.get("bound");
      if (bound === "github") {
        setTimeout(function () {
          if (global.MD3 && MD3.showSnackbar) {
            MD3.showSnackbar(t("auth.github_bound"));
          }
        }, 500);
        var cleanUrl3 = window.location.pathname + window.location.search.replace(/[?&]bound=github/, "");
        window.history.replaceState({}, document.title, cleanUrl3);
      }

      if (token) {
        try {
          var data = await apiCall("/auth/me");
          currentUser = data.user;
        } catch (e) {
          Auth.setToken(null);
          currentUser = null;
        }
      }
      Auth.updateUI();
      Auth.bindEvents();
      window.dispatchEvent(new CustomEvent("authChanged", { detail: { user: currentUser } }));
    })();
    return Auth._initPromise;
  };

  Auth.ready = function () {
    return Auth._initPromise || Promise.resolve();
  };

  // ===== Update UI =====
  Auth.updateUI = function () {
    var userArea = document.getElementById("userArea");
    var checkinBtn = document.getElementById("checkinBtn");

    if (currentUser) {
      // Logged in - show user menu
      if (userArea) {
        var levelColor = Auth.getLevelColor(currentUser.level);
        userArea.innerHTML =
          '<button class="user-chip" id="userMenuBtn">' +
          '<span class="user-avatar" style="background:' + levelColor + ';">' +
          Auth.escapeHtml(currentUser.username.charAt(0).toUpperCase()) +
          "</span>" +
          '<span class="user-chip__info">' +
          "<span>" + Auth.escapeHtml(currentUser.username) + "</span>" +
          '<span class="user-chip__level">Lv.' + currentUser.level + " | " +
          Auth.escapeHtml(currentUser.points + " pts") + "</span>" +
          "</span>" +
          "</button>" +
          '<div class="user-menu" id="userMenu">' +
          '<div class="user-menu__header">' +
          '<span class="user-avatar user-avatar--lg" style="background:' + levelColor + ';">' +
          Auth.escapeHtml(currentUser.username.charAt(0).toUpperCase()) +
          "</span>" +
          "<div>" +
          '<div class="user-menu__name">' + Auth.escapeHtml(currentUser.username) + "</div>" +
          '<div class="user-menu__level">Lv.' + currentUser.level + " " + Auth.escapeHtml(currentUser.levelTitle) + "</div>" +
          '<div class="user-menu__points">' + Auth.escapeHtml(currentUser.points + " pts") + "</div>" +
          '<div class="user-menu__progress">' +
          "<div class=\"user-menu__progress-bar\" style=\"width:" + currentUser.progressToNext + "%;background:" + levelColor + ";\"></div>" +
          "</div>" +
          "</div>" +
          "</div>" +
          '<a class="user-menu__item" href="/profile.html?u=' + encodeURIComponent(currentUser.username) + '">' +
          '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' +
          "<span>" + t("nav.profile") + "</span>" +
          "</a>" +
          (currentUser.githubUsername ?
            '<button class="user-menu__item" id="unbindGithubBtn">' +
            '<svg viewBox="0 0 24 24"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.67 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.4-2.69 5.38-5.25 5.66.42.36.8 1.08.8 2.18v3.23c0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>' +
            "<span>" + t("auth.unbind_github") + " (" + Auth.escapeHtml(currentUser.githubUsername) + ")</span>" +
            "</button>" :
            '<a class="user-menu__item" href="/api/auth/github/bind">' +
            '<svg viewBox="0 0 24 24"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.67 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.4-2.69 5.38-5.25 5.66.42.36.8 1.08.8 2.18v3.23c0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>' +
            "<span>" + t("auth.bind_github") + "</span>" +
            "</a>"
          ) +
          (currentUser.role === "admin" ?
            '<a class="user-menu__item" href="/admin.html">' +
            '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>' +
            "<span>" + t("nav.admin") + "</span>" +
            "</a>" : "") +
          '<button class="user-menu__item" id="logoutBtn">' +
          '<svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>' +
          "<span>" + t("auth.logout") + "</span>" +
          "</button>" +
          "</div>";
      }

      // Show check-in button
      if (checkinBtn) {
        checkinBtn.style.display = "";
        Auth.updateCheckinUI();
      }

      // Bind user menu toggle
      var menuBtn = document.getElementById("userMenuBtn");
      var menu = document.getElementById("userMenu");
      if (menuBtn && menu) {
        menuBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          menu.classList.toggle("user-menu--show");
        });
        document.addEventListener("click", function () {
          menu.classList.remove("user-menu--show");
        });
      }

      // Bind logout
      var logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          Auth.logout();
        });
      }

      // Bind unbind GitHub
      var unbindGithubBtn = document.getElementById("unbindGithubBtn");
      if (unbindGithubBtn) {
        unbindGithubBtn.addEventListener("click", async function (e) {
          e.stopPropagation();
          if (confirm(t("auth.unbind_confirm"))) {
            try {
              var data = await apiCall("/auth/github/unbind", { method: "DELETE" });
              currentUser = data.user;
              Auth.updateUI();
              if (global.MD3 && MD3.showSnackbar) {
                MD3.showSnackbar(t("auth.github_unbound"));
              }
              window.dispatchEvent(new CustomEvent("authChanged", { detail: { user: currentUser } }));
            } catch (err) {
              if (global.MD3 && MD3.showSnackbar) {
                MD3.showSnackbar(err.message || "Error");
              }
            }
          }
        });
      }
    } else {
      // Not logged in - show login/register button
      if (userArea) {
        userArea.innerHTML =
          '<button class="btn-tonal" id="loginBtn">' + t("auth.login") + "</button>";
        var loginBtn = document.getElementById("loginBtn");
        if (loginBtn) {
          loginBtn.addEventListener("click", Auth.showLoginDialog);
        }
      }

      if (checkinBtn) {
        checkinBtn.style.display = "none";
      }
    }
  };

  // ===== Check-in =====
  Auth.updateCheckinUI = async function () {
    var checkinBtn = document.getElementById("checkinBtn");
    if (!checkinBtn || !currentUser) return;

    try {
      var data = await apiCall("/checkin/status");
      if (data.checkedInToday) {
        checkinBtn.classList.add("checkin-btn--done");
        checkinBtn.innerHTML =
          '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' +
          "<span>" + t("checkin.done") + " (" + data.streak + ")" + "</span>";
        checkinBtn.disabled = true;
      } else {
        checkinBtn.classList.remove("checkin-btn--done");
        checkinBtn.innerHTML =
          '<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>' +
          "<span>" + t("checkin.checkin") + "</span>";
        checkinBtn.disabled = false;
      }
    } catch (e) {
      // ignore
    }
  };

  Auth.doCheckin = async function () {
    var checkinBtn = document.getElementById("checkinBtn");
    if (!checkinBtn || !currentUser) return;

    checkinBtn.disabled = true;
    try {
      var data = await apiCall("/checkin", { method: "POST" });
      currentUser = data.user;
      Auth.updateUI();

      if (global.MD3 && MD3.showSnackbar) {
        var msg = t("checkin.success") + " +" + data.points + " pts";
        if (data.streak > 1) {
          msg += " (" + t("checkin.streak") + ": " + data.streak + ")";
        }
        MD3.showSnackbar(msg);
      }
    } catch (e) {
      if (global.MD3 && MD3.showSnackbar) {
        MD3.showSnackbar(t("checkin.already"));
      }
      Auth.updateCheckinUI();
    }
  };

  // ===== Login Dialog =====
  Auth.showLoginDialog = function () {
    var scrim = document.getElementById("authScrim");
    var dialog = document.getElementById("authDialog");
    if (!scrim || !dialog) return;

    // Reset to login mode
    Auth.setAuthMode("login");

    scrim.classList.add("dialog-scrim--show");
    dialog.classList.add("dialog--show");
  };

  Auth.hideLoginDialog = function () {
    var scrim = document.getElementById("authScrim");
    var dialog = document.getElementById("authDialog");
    if (!scrim || !dialog) return;

    scrim.classList.remove("dialog-scrim--show");
    dialog.classList.remove("dialog--show");

    // Clear fields
    var u = document.getElementById("authUsername");
    var p = document.getElementById("authPassword");
    var err = document.getElementById("authError");
    if (u) u.value = "";
    if (p) p.value = "";
    if (err) err.textContent = "";
  };

  Auth.setAuthMode = function (mode) {
    var title = document.getElementById("authDialogTitle");
    var submitBtn = document.getElementById("authSubmit");
    var toggleBtn = document.getElementById("authToggle");

    if (mode === "login") {
      if (title) title.textContent = t("auth.login");
      if (submitBtn) submitBtn.textContent = t("auth.login");
      if (toggleBtn) toggleBtn.textContent = t("auth.no_account");
    } else {
      if (title) title.textContent = t("auth.register");
      if (submitBtn) submitBtn.textContent = t("auth.register");
      if (toggleBtn) toggleBtn.textContent = t("auth.has_account");
    }

    var toggle = document.getElementById("authToggle");
    if (toggle) {
      toggle.onclick = function () {
        Auth.setAuthMode(mode === "login" ? "register" : "login");
      };
    }
  };

  // ===== Submit Auth =====
  Auth.submitAuth = async function () {
    var username = document.getElementById("authUsername").value.trim();
    var password = document.getElementById("authPassword").value;
    var submitBtn = document.getElementById("authSubmit");
    var errEl = document.getElementById("authError");
    var mode = (document.getElementById("authDialogTitle").textContent === t("auth.login")) ? "login" : "register";

    if (!username || !password) {
      if (errEl) errEl.textContent = t("auth.fields_required");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t("auth.processing");
    if (errEl) errEl.textContent = "";

    try {
      var endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      var data = await apiCall(endpoint, {
        method: "POST",
        body: { username: username, password: password },
      });

      Auth.setToken(data.token);
      currentUser = data.user;
      Auth.updateUI();
      Auth.hideLoginDialog();

      if (global.MD3 && MD3.showSnackbar) {
        var msg = mode === "login" ? t("auth.login_success") : t("auth.register_success");
        MD3.showSnackbar(msg);
      }

      // Notify pages
      window.dispatchEvent(new CustomEvent("authChanged", { detail: { user: currentUser } }));
    } catch (e) {
      if (errEl) errEl.textContent = e.message;
    } finally {
      submitBtn.disabled = false;
      Auth.setAuthMode(mode);
    }
  };

  // ===== Logout =====
  Auth.logout = function () {
    Auth.setToken(null);
    currentUser = null;
    Auth.updateUI();

    if (global.MD3 && MD3.showSnackbar) {
      MD3.showSnackbar(t("auth.logged_out"));
    }

    window.dispatchEvent(new CustomEvent("authChanged", { detail: { user: null } }));
  };

  // ===== GitHub Login =====
  Auth.loginWithGithub = function () {
    window.location.href = "/api/auth/github";
  };

  // ===== Require Auth =====
  Auth.requireAuth = function (callback) {
    if (currentUser) {
      callback();
    } else {
      Auth.showLoginDialog();
    }
  };

  // ===== Level Colors =====
  Auth.getLevelColor = function (level) {
    var colors = [
      "#9E9E9E", // 1 - Grey
      "#8D6E63", // 2 - Brown
      "#4CAF50", // 3 - Green
      "#00BCD4", // 4 - Cyan
      "#2196F3", // 5 - Blue
      "#7C4DFF", // 6 - Purple
      "#FF9800", // 7 - Orange
      "#FF5722", // 8 - Deep Orange
      "#F44336", // 9 - Red
      "#FFD700", // 10 - Gold
    ];
    return colors[Math.min(level - 1, colors.length - 1)] || colors[0];
  };

  // ===== Escape HTML =====
  Auth.escapeHtml = function (text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // ===== Bind Events =====
  Auth.bindEvents = function () {
    // Auth dialog events (delegated, since dialog may not exist yet)
    document.addEventListener("click", function (e) {
      if (e.target.closest("#authSubmit")) {
        Auth.submitAuth();
      }
      if (e.target.closest("#authCancel") || e.target.id === "authScrim") {
        Auth.hideLoginDialog();
      }
      if (e.target.closest("#checkinBtn") && currentUser) {
        Auth.doCheckin();
      }
      if (e.target.closest("#githubLoginBtn")) {
        Auth.loginWithGithub();
      }
    });

    // Enter key in auth fields
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var activeDialog = document.querySelector(".dialog--show");
        if (activeDialog && activeDialog.id === "authDialog") {
          Auth.submitAuth();
        }
      }
      if (e.key === "Escape") {
        var dialog = document.querySelector(".dialog--show");
        if (dialog && dialog.id === "authDialog") {
          Auth.hideLoginDialog();
        }
      }
    });
  };

  // ===== Export =====
  global.Auth = Auth;
})(window);
