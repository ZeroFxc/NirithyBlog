/* ============================================================
   NirithyBlog - User Profile Page
   Display user info, posts, comments, points log
   ============================================================ */

(function () {
  "use strict";

  var profileUser = null;
  var currentTab = "posts";

  function t(key) {
    if (window.I18N) return I18N.t(key);
    return key;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var username = params.get("u");

    // If no username, redirect to own profile or login
    if (!username) {
      if (window.Auth && Auth.isLoggedIn()) {
        username = Auth.getUser().username;
      } else {
        window.location.href = "/";
        return;
      }
    }

    loadProfile(username);
    initLangListener();
    initAuthListener();
  });

  function initAuthListener() {
    window.addEventListener("authChanged", function () {
      if (profileUser) {
        loadProfile(profileUser.username);
      }
    });
  }

  function initLangListener() {
    window.addEventListener("languageChanged", function () {
      if (profileUser) {
        renderProfile(profileUser);
        switchTab(currentTab);
      }
    });
  }

  async function loadProfile(username) {
    try {
      var data = await MD3.api("/users/" + encodeURIComponent(username));
      profileUser = data.user;
      renderProfile(profileUser);
      switchTab("posts");
    } catch (e) {
      var container = document.getElementById("profileContainer");
      container.innerHTML =
        '<div class="empty-state">' +
        '<div class="empty-state__icon">' +
        '<svg viewBox="0 0 24 24" width="64" height="64"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>' +
        "</div>" +
        '<h2 class="empty-state__title">' + t("profile.not_found") + "</h2>" +
        '<p class="empty-state__desc">' + (e.message || "Error") + "</p>" +
        "</div>";
    }
  }

  function renderProfile(user) {
    var container = document.getElementById("profileContainer");
    var levelColor = Auth.getLevelColor(user.level);
    var isOwn = window.Auth && Auth.isLoggedIn() && Auth.getUser() && Auth.getUser().id === user.id;

    var html =
      '<div class="profile-header">' +
      '<div class="profile-header__avatar" style="background:' + levelColor + ';">' +
      MD3.escapeHtml(user.username.charAt(0).toUpperCase()) +
      "</div>" +
      '<div class="profile-header__info">' +
      '<h1 class="profile-header__name">' + MD3.escapeHtml(user.username) + "</h1>";

    // Role badge
    if (user.role === "admin") {
      html +=
        '<span class="profile-header__badge profile-header__badge--admin">' +
        t("profile.admin_badge") + "</span>";
    }

    html +=
      '<div class="profile-header__level">' +
      '<span class="profile-level-badge" style="background:' + levelColor + ';">' +
      "Lv." + user.level + " " + MD3.escapeHtml(user.levelTitle) +
      "</span>" +
      "</div>" +
      '<div class="profile-header__points">' +
      '<span class="profile-points-value">' + user.points + "</span>" +
      '<span class="profile-points-label">' + t("profile.points") + "</span>" +
      "</div>";

    // Progress bar
    html +=
      '<div class="profile-header__progress">' +
      '<div class="profile-header__progress-bar" style="width:' + user.progressToNext + "%;background:" + levelColor + ';"></div>' +
      "</div>" +
      '<div class="profile-header__progress-text">' +
      t("profile.next_level") + ": " + user.nextLevelPoints + " pts (" + user.progressToNext + "%)" +
      "</div>";

    // Stats row
    html +=
      '<div class="profile-header__stats">' +
      '<div class="profile-stat">' +
      '<span class="profile-stat__value">' + user.postCount + "</span>" +
      '<span class="profile-stat__label">' + t("profile.posts") + "</span>" +
      "</div>" +
      '<div class="profile-stat">' +
      '<span class="profile-stat__value">' + user.checkinStreak + "</span>" +
      '<span class="profile-stat__label">' + t("profile.streak") + "</span>" +
      "</div>" +
      '<div class="profile-stat">' +
      '<span class="profile-stat__value">' + (user.banned ? "BANNED" : "OK") + "</span>" +
      '<span class="profile-stat__label">' + t("profile.status") + "</span>" +
      "</div>" +
      "</div>";

    // Joined date
    var joinDate = new Date(user.createdAt);
    html +=
      '<div class="profile-header__joined">' +
      t("profile.joined") + ": " + MD3.formatDate(joinDate) +
      "</div>";

    // GitHub binding status
    if (user.githubUsername) {
      html +=
        '<div class="profile-header__github">' +
        '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.67 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.4-2.69 5.38-5.25 5.66.42.36.8 1.08.8 2.18v3.23c0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>' +
        '<a href="https://github.com/' + encodeURIComponent(user.githubUsername) + '" target="_blank" rel="noopener noreferrer">' +
        MD3.escapeHtml(user.githubUsername) +
        "</a>" +
        "</div>";
    }

    html += "</div></div>";

    // Tabs
    html +=
      '<div class="profile-tabs">' +
      '<button class="profile-tab profile-tab--active" data-tab="posts" data-i18n="profile.tab_posts">' + t("profile.tab_posts") + "</button>" +
      '<button class="profile-tab" data-tab="comments" data-i18n="profile.tab_comments">' + t("profile.tab_comments") + "</button>";

    if (isOwn) {
      html +=
        '<button class="profile-tab" data-tab="points" data-i18n="profile.tab_points">' + t("profile.tab_points") + "</button>";
    }

    html += "</div>";

    // Tab content
    html += '<div class="profile-tab-content" id="tabContent"></div>';

    container.innerHTML = html;

    // Bind tab clicks
    var tabs = document.querySelectorAll(".profile-tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        switchTab(tab.getAttribute("data-tab"));
      });
    });
  }

  function switchTab(tab) {
    currentTab = tab;

    // Update tab active state
    var tabs = document.querySelectorAll(".profile-tab");
    tabs.forEach(function (t) {
      t.classList.remove("profile-tab--active");
    });
    var activeTab = document.querySelector('.profile-tab[data-tab="' + tab + '"]');
    if (activeTab) activeTab.classList.add("profile-tab--active");

    if (tab === "posts") loadUserPosts();
    else if (tab === "comments") loadUserComments();
    else if (tab === "points") loadPointsLog();
  }

  async function loadUserPosts() {
    var content = document.getElementById("tabContent");
    content.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var data = await MD3.api("/users/" + encodeURIComponent(profileUser.username) + "/posts");
      var posts = data.posts || [];

      if (posts.length === 0) {
        content.innerHTML =
          '<div class="empty-state">' +
          '<p class="empty-state__desc">' + t("profile.no_posts") + "</p>" +
          "</div>";
        return;
      }

      var html = '<div class="post-list">';
      posts.forEach(function (post) {
        var levelColor = Auth.getLevelColor(profileUser.level);
        html +=
          '<a class="post-card" href="/post.html?slug=' + encodeURIComponent(post.slug) + '">' +
          '<div class="post-card__header">' +
          '<span class="post-author-avatar" style="background:' + levelColor + ';">' +
          MD3.escapeHtml(post.authorName.charAt(0).toUpperCase()) +
          "</span>" +
          '<span class="post-card__author">' + MD3.escapeHtml(post.authorName) + "</span>" +
          '<span class="post-card__time">' + MD3.timeAgo(new Date(post.createdAt)) + "</span>" +
          "</div>" +
          '<h3 class="post-card__title">' + MD3.escapeHtml(post.title) + "</h3>" +
          '<p class="post-card__excerpt">' + MD3.escapeHtml(post.excerpt) + "</p>" +
          '<div class="post-card__tags">';
        (post.tags || []).forEach(function (tag) {
          html += '<span class="chip">' + MD3.escapeHtml(tag) + "</span>";
        });
        html += "</div></a>";
      });
      html += "</div>";
      content.innerHTML = html;
    } catch (e) {
      content.innerHTML = '<p class="empty-state__desc">' + (e.message || "Error") + "</p>";
    }
  }

  async function loadUserComments() {
    var content = document.getElementById("tabContent");
    content.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var data = await MD3.api("/users/" + encodeURIComponent(profileUser.username) + "/comments");
      var comments = data.comments || [];

      if (comments.length === 0) {
        content.innerHTML =
          '<div class="empty-state">' +
          '<p class="empty-state__desc">' + t("profile.no_comments") + "</p>" +
          "</div>";
        return;
      }

      var html = '<div class="comments-list">';
      comments.forEach(function (comment) {
        var levelColor = Auth.getLevelColor(profileUser.level);
        html +=
          '<div class="comment-item">' +
          '<div class="comment-item__header">' +
          '<span class="comment-avatar" style="background:' + levelColor + ';">' +
          MD3.escapeHtml(comment.username.charAt(0).toUpperCase()) +
          "</span>" +
          '<span class="comment-username">' + MD3.escapeHtml(comment.username) + "</span>" +
          '<span class="comment-level-badge" style="background:' + levelColor + ';">Lv.' + profileUser.level + "</span>" +
          '<span class="comment-time">' + MD3.timeAgo(new Date(comment.createdAt)) + "</span>" +
          "</div>" +
          '<a href="/post.html?slug=' + encodeURIComponent(comment.postSlug) + '" class="comment-content">' +
          MD3.escapeHtml(comment.content) +
          "</a>" +
          "</div>";
      });
      html += "</div>";
      content.innerHTML = html;
    } catch (e) {
      content.innerHTML = '<p class="empty-state__desc">' + (e.message || "Error") + "</p>";
    }
  }

  async function loadPointsLog() {
    var content = document.getElementById("tabContent");
    content.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var data = await MD3.api("/points/log");
      var logs = data.logs || [];

      if (logs.length === 0) {
        content.innerHTML =
          '<div class="empty-state">' +
          '<p class="empty-state__desc">' + t("profile.no_points") + "</p>" +
          "</div>";
        return;
      }

      var html =
        '<div class="points-summary">' +
        '<span class="points-summary__label">' + t("profile.total_points") + "</span>" +
        '<span class="points-summary__value">' + data.totalPoints + "</span>" +
        "</div>" +
        '<div class="points-list">';

      logs.forEach(function (log) {
        var isPositive = log.points > 0;
        var icon = "";
        if (log.action === "checkin") {
          icon = '<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/></svg>';
        } else if (log.action === "post") {
          icon = '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/></svg>';
        } else if (log.action === "comment") {
          icon = '<svg viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" fill="currentColor"/></svg>';
        } else {
          icon = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor"/></svg>';
        }

        html +=
          '<div class="points-item">' +
          '<div class="points-item__icon' + (isPositive ? " points-item__icon--positive" : "") + '">' + icon + "</div>" +
          '<div class="points-item__info">' +
          '<span class="points-item__desc">' + MD3.escapeHtml(log.description) + "</span>" +
          '<span class="points-item__time">' + MD3.formatDateTime(new Date(log.createdAt)) + "</span>" +
          "</div>" +
          '<span class="points-item__value' + (isPositive ? " points-item__value--positive" : "") + '">' +
          (isPositive ? "+" : "") + log.points +
          "</span>" +
          "</div>";
      });

      html += "</div>";
      content.innerHTML = html;
    } catch (e) {
      content.innerHTML = '<p class="empty-state__desc">' + (e.message || "Error") + "</p>";
    }
  }
})();
