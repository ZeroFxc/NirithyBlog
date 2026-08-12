/* ============================================================
   NirithyBlog - Admin Dashboard
   Stats (with Chart.js trend), user management (search + batch),
   post management (edit + batch delete), comment management
   ============================================================ */

(function () {
  "use strict";

  var currentTab = "stats";
  var isAdmin = false;
  var trendChart = null;

  function t(key) {
    if (window.I18N) return I18N.t(key);
    return key;
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAuthCheck();
    initLangListener();
  });

  async function initAuthCheck() {
    if (window.Auth) {
      await Auth.ready();
      var user = Auth.getUser();
      if (!Auth.isLoggedIn()) {
        Auth.showLoginDialog();
        MD3.showSnackbar(t("editor.login_required"));
        return;
      }
      if (!user || user.role !== "admin") {
        var container = document.getElementById("adminContainer");
        container.innerHTML =
          '<div class="empty-state">' +
          '<div class="empty-state__icon">' +
          '<svg viewBox="0 0 24 24" width="64" height="64"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="currentColor"/></svg>' +
          "</div>" +
          '<h2 class="empty-state__title">' + t("admin.no_access") + "</h2>" +
          '<p class="empty-state__desc">' + t("admin.no_access_desc") + "</p>" +
          "</div>";
        return;
      }
      isAdmin = true;
      renderAdminLayout();
      switchTab("stats");
    }
  }

  function initLangListener() {
    window.addEventListener("languageChanged", function () {
      if (isAdmin) {
        renderAdminLayout();
        switchTab(currentTab);
      }
    });
  }

  function renderAdminLayout() {
    var container = document.getElementById("adminContainer");

    container.innerHTML =
      '<div class="admin-header">' +
      '<h1 class="admin-header__title">' + t("admin.title") + "</h1>" +
      "</div>" +
      '<div class="admin-tabs">' +
      '<button class="admin-tab admin-tab--active" data-tab="stats" data-i18n="admin.tab_stats">' + t("admin.tab_stats") + "</button>" +
      '<button class="admin-tab" data-tab="users" data-i18n="admin.tab_users">' + t("admin.tab_users") + "</button>" +
      '<button class="admin-tab" data-tab="posts" data-i18n="admin.tab_posts">' + t("admin.tab_posts") + "</button>" +
      '<button class="admin-tab" data-tab="comments" data-i18n="admin.tab_comments">' + t("admin.tab_comments") + "</button>" +
      "</div>" +
      '<div class="admin-tab-content" id="adminTabContent"></div>';

    // Bind tab clicks
    var tabs = document.querySelectorAll(".admin-tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        switchTab(tab.getAttribute("data-tab"));
      });
    });
  }

  function switchTab(tab) {
    currentTab = tab;
    // Destroy chart when leaving stats tab
    if (tab !== "stats" && trendChart) {
      trendChart.destroy();
      trendChart = null;
    }
    var tabs = document.querySelectorAll(".admin-tab");
    tabs.forEach(function (t) {
      t.classList.remove("admin-tab--active");
    });
    var activeTab = document.querySelector('.admin-tab[data-tab="' + tab + '"]');
    if (activeTab) activeTab.classList.add("admin-tab--active");

    if (tab === "stats") loadStats();
    else if (tab === "users") loadUsers();
    else if (tab === "posts") loadAllPosts();
    else if (tab === "comments") loadAllComments();
  }

  // ===== Stats =====
  async function loadStats() {
    var content = document.getElementById("adminTabContent");
    content.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var data = await MD3.api("/admin/stats");

      var html =
        '<div class="stats-grid">' +
        '<div class="stat-card">' +
        '<div class="stat-card__icon stat-card__icon--blue">' +
        '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>' +
        "</div>" +
        '<div class="stat-card__info">' +
        '<span class="stat-card__value">' + data.totalUsers + "</span>" +
        '<span class="stat-card__label">' + t("admin.stat_users") + "</span>" +
        "</div>" +
        "</div>" +
        '<div class="stat-card">' +
        '<div class="stat-card__icon stat-card__icon--green">' +
        '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/></svg>' +
        "</div>" +
        '<div class="stat-card__info">' +
        '<span class="stat-card__value">' + data.totalPosts + "</span>" +
        '<span class="stat-card__label">' + t("admin.stat_posts") + "</span>" +
        "</div>" +
        "</div>" +
        '<div class="stat-card">' +
        '<div class="stat-card__icon stat-card__icon--orange">' +
        '<svg viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" fill="currentColor"/></svg>' +
        "</div>" +
        '<div class="stat-card__info">' +
        '<span class="stat-card__value">' + data.totalComments + "</span>" +
        '<span class="stat-card__label">' + t("admin.stat_comments") + "</span>" +
        "</div>" +
        "</div>" +
        '<div class="stat-card">' +
        '<div class="stat-card__icon stat-card__icon--purple">' +
        '<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/></svg>' +
        "</div>" +
        '<div class="stat-card__info">' +
        '<span class="stat-card__value">' + data.checkinToday + "</span>" +
        '<span class="stat-card__label">' + t("admin.stat_checkin_today") + "</span>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="admin-chart-section">' +
        '<h3 class="admin-chart-title">' + t("admin.trend_title") + "</h3>" +
        '<div class="admin-chart-container">' +
        '<canvas id="trendChart"></canvas>' +
        "</div>" +
        "</div>";

      content.innerHTML = html;

      // Load trend data and draw chart
      loadTrendChart();
    } catch (e) {
      content.innerHTML = '<p class="empty-state__desc">' + (e.message || "Error") + "</p>";
    }
  }

  async function loadTrendChart() {
    try {
      var trend = await MD3.api("/admin/stats/trend");
      var ctx = document.getElementById("trendChart");
      if (!ctx || typeof Chart === "undefined") return;

      var labels = trend.dates || [];
      var isZh = I18N.getLang() === "zh-CN";

      var datasetUsers = {
        label: t("admin.trend_new_users"),
        data: trend.newUsers || [],
        borderColor: "#2196F3",
        backgroundColor: "rgba(33,150,243,0.1)",
        tension: 0.3,
        fill: true,
      };

      var datasetPosts = {
        label: t("admin.trend_new_posts"),
        data: trend.newPosts || [],
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76,175,80,0.1)",
        tension: 0.3,
        fill: true,
      };

      var datasetComments = {
        label: t("admin.trend_new_comments"),
        data: trend.newComments || [],
        borderColor: "#FF9800",
        backgroundColor: "rgba(255,152,0,0.1)",
        tension: 0.3,
        fill: true,
      };

      // Dark theme detection
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      var gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
      var textColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";

      trendChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [datasetUsers, datasetPosts, datasetComments],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: textColor,
                usePointStyle: true,
                padding: 16,
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, maxRotation: 45 },
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor },
              beginAtZero: true,
            },
          },
        },
      });
    } catch (e) {
      // Chart loading failed - not critical
      console.error("Trend chart error:", e);
    }
  }

  // ===== Users =====
  async function loadUsers(searchQuery) {
    var content = document.getElementById("adminTabContent");
    content.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var endpoint = "/admin/users";
      if (searchQuery) {
        endpoint += "?q=" + encodeURIComponent(searchQuery);
      }
      var data = await MD3.api(endpoint);
      var users = data.users || [];

      // Search bar + batch action bar
      var html =
        '<div class="admin-toolbar">' +
        '<div class="admin-search-bar">' +
        '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>' +
        '<input type="text" class="admin-search-input" id="userSearchInput" placeholder="' + t("admin.search_users") + '" value="' + (searchQuery || "") + '">' +
        '<button class="btn-filled admin-search-btn" id="userSearchBtn">' + t("admin.search") + "</button>" +
        "</div>" +
        '<div class="admin-batch-actions">' +
        '<button class="btn-text admin-batch-btn admin-batch-btn--ban" id="batchBanBtn">' + t("admin.batch_ban") + "</button>" +
        '<button class="btn-text admin-batch-btn admin-batch-btn--unban" id="batchUnbanBtn">' + t("admin.batch_unban") + "</button>" +
        "</div>" +
        "</div>";

      if (users.length === 0) {
        html += '<div class="empty-state"><p class="empty-state__desc">' + t("admin.no_comments") + "</p></div>";
        content.innerHTML = html;
        bindUserSearch();
        return;
      }

      html +=
        '<div class="admin-table-wrap">' +
        '<table class="admin-table">' +
        "<thead><tr>" +
        '<th style="width:40px;"><input type="checkbox" id="userSelectAll"></th>' +
        "<th>" + t("admin.user_username") + "</th>" +
        "<th>" + t("admin.user_level") + "</th>" +
        "<th>" + t("admin.user_points") + "</th>" +
        "<th>" + t("admin.user_posts") + "</th>" +
        "<th>" + t("admin.user_role") + "</th>" +
        "<th>" + t("admin.user_status") + "</th>" +
        "<th>" + t("admin.user_actions") + "</th>" +
        "</tr></thead><tbody>";

      users.forEach(function (user) {
        var levelColor = Auth.getLevelColor(user.level);
        html +=
          "<tr>" +
          '<td><input type="checkbox" class="user-checkbox" data-user-id="' + user.id + '" data-user-name="' + MD3.escapeHtml(user.username) + '" data-banned="' + (user.banned ? "1" : "0") + '"></td>' +
          '<td><a href="/profile.html?u=' + encodeURIComponent(user.username) + '" class="admin-table__user-link">' +
          '<span class="post-author-avatar" style="background:' + levelColor + ';">' +
          MD3.escapeHtml(user.username.charAt(0).toUpperCase()) +
          "</span>" +
          MD3.escapeHtml(user.username) +
          "</a></td>" +
          '<td><span class="comment-level-badge" style="background:' + levelColor + ';">Lv.' + user.level + "</span></td>" +
          "<td>" + user.points + "</td>" +
          "<td>" + user.postCount + "</td>" +
          "<td>" + (user.role === "admin"
            ? '<span class="badge badge--admin">' + t("admin.role_admin") + "</span>"
            : '<span class="badge">' + t("admin.role_user") + "</span>") +
          "</td>" +
          "<td>" + (user.banned
            ? '<span class="badge badge--banned">' + t("admin.status_banned") + "</span>"
            : '<span class="badge badge--ok">' + t("admin.status_ok") + "</span>") +
          "</td>" +
          '<td class="admin-table__actions">' +
          '<button class="btn-text admin-action-btn" data-action="toggle-role" data-user-id="' + user.id + '" data-user-name="' + MD3.escapeHtml(user.username) + '">' +
          (user.role === "admin" ? t("admin.demote") : t("admin.promote")) +
          "</button>" +
          '<button class="btn-text admin-action-btn" data-action="toggle-ban" data-user-id="' + user.id + '" data-user-name="' + MD3.escapeHtml(user.username) + '">' +
          (user.banned ? t("admin.unban") : t("admin.ban")) +
          "</button>" +
          "</td>" +
          "</tr>";
      });

      html += "</tbody></table></div>";
      content.innerHTML = html;

      // Bind search
      bindUserSearch();

      // Bind select all
      var selectAll = document.getElementById("userSelectAll");
      if (selectAll) {
        selectAll.addEventListener("change", function () {
          var checkboxes = content.querySelectorAll(".user-checkbox");
          checkboxes.forEach(function (cb) { cb.checked = selectAll.checked; });
        });
      }

      // Bind batch actions
      var batchBanBtn = document.getElementById("batchBanBtn");
      if (batchBanBtn) {
        batchBanBtn.addEventListener("click", function () { handleBatchUsers(true); });
      }
      var batchUnbanBtn = document.getElementById("batchUnbanBtn");
      if (batchUnbanBtn) {
        batchUnbanBtn.addEventListener("click", function () { handleBatchUsers(false); });
      }

      // Bind action buttons
      var btns = content.querySelectorAll(".admin-action-btn");
      btns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          handleUserAction(
            btn.getAttribute("data-action"),
            btn.getAttribute("data-user-id"),
            btn.getAttribute("data-user-name")
          );
        });
      });
    } catch (e) {
      content.innerHTML = '<p class="empty-state__desc">' + (e.message || "Error") + "</p>";
    }
  }

  function bindUserSearch() {
    var searchInput = document.getElementById("userSearchInput");
    var searchBtn = document.getElementById("userSearchBtn");
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        var q = searchInput.value.trim();
        loadUsers(q || undefined);
      });
    }
    if (searchInput) {
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          var q = searchInput.value.trim();
          loadUsers(q || undefined);
        }
      });
    }
  }

  async function handleBatchUsers(ban) {
    var content = document.getElementById("adminTabContent");
    var checked = content.querySelectorAll(".user-checkbox:checked");
    if (checked.length === 0) {
      MD3.showSnackbar(t("admin.no_selection"));
      return;
    }

    var userIds = [];
    var userNames = [];
    checked.forEach(function (cb) {
      userIds.push(cb.getAttribute("data-user-id"));
      userNames.push(cb.getAttribute("data-user-name"));
    });

    var action = ban ? t("admin.batch_ban") : t("admin.batch_unban");
    var confirmed = await MD3.showConfirm(
      ban ? t("admin.confirm_batch_ban") : t("admin.confirm_batch_unban"),
      userNames.join(", ")
    );
    if (!confirmed) return;

    try {
      await MD3.api("/admin/users/batch", {
        method: "POST",
        body: { userIds: userIds, banned: ban },
      });
      MD3.showSnackbar(ban ? t("admin.batch_banned") : t("admin.batch_unbanned"));
      loadUsers();
    } catch (e) {
      MD3.showSnackbar(e.message || "Error");
    }
  }

  async function handleUserAction(action, userId, username) {
    try {
      // Fetch current user list to get up-to-date state
      var listData = await MD3.api("/admin/users");
      var user = listData.users.find(function (u) { return u.id === userId; });
      if (!user) {
        MD3.showSnackbar("User not found");
        return;
      }

      if (action === "toggle-role") {
        var newRole = user.role === "admin" ? "user" : "admin";
        await MD3.api("/admin/users/" + userId, {
          method: "PUT",
          body: { role: newRole },
        });
        MD3.showSnackbar(username + " -> " + newRole);
        loadUsers();
      } else if (action === "toggle-ban") {
        await MD3.api("/admin/users/" + userId, {
          method: "PUT",
          body: { banned: !user.banned },
        });
        MD3.showSnackbar(username + " " + (!user.banned ? t("admin.banned") : t("admin.unbanned")));
        loadUsers();
      }
    } catch (e) {
      MD3.showSnackbar(e.message || "Error");
    }
  }

  // ===== Posts =====
  async function loadAllPosts() {
    var content = document.getElementById("adminTabContent");
    content.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var data = await MD3.api("/posts");
      var posts = data.posts || [];

      if (posts.length === 0) {
        content.innerHTML =
          '<div class="empty-state"><p class="empty-state__desc">' + t("admin.no_posts") + "</p></div>";
        return;
      }

      // Batch action bar
      var html =
        '<div class="admin-toolbar">' +
        '<div class="admin-batch-actions">' +
        '<button class="btn-text admin-batch-btn admin-delete-btn" id="batchDeletePostsBtn">' + t("admin.batch_delete") + "</button>" +
        "</div>" +
        "</div>";

      html +=
        '<div class="admin-table-wrap">' +
        '<table class="admin-table">' +
        "<thead><tr>" +
        '<th style="width:40px;"><input type="checkbox" id="postSelectAll"></th>' +
        "<th>" + t("admin.post_title") + "</th>" +
        "<th>" + t("admin.post_author") + "</th>" +
        "<th>" + t("admin.post_category") + "</th>" +
        "<th>" + t("admin.post_date") + "</th>" +
        "<th>" + t("admin.post_actions") + "</th>" +
        "</tr></thead><tbody>";

      posts.forEach(function (post) {
        html +=
          "<tr>" +
          '<td><input type="checkbox" class="post-checkbox" data-slug="' + encodeURIComponent(post.slug) + '" data-title="' + MD3.escapeHtml(post.title) + '"></td>' +
          '<td><a href="/post.html?slug=' + encodeURIComponent(post.slug) + '" class="admin-table__user-link">' +
          MD3.escapeHtml(post.title) +
          "</a></td>" +
          '<td><a href="/profile.html?u=' + encodeURIComponent(post.authorName || "") + '" class="admin-table__user-link">' +
          MD3.escapeHtml(post.authorName || "-") +
          "</a></td>" +
          '<td><a href="/category?c=' + encodeURIComponent(post.category || "") + '" class="admin-tag-link">' +
          MD3.escapeHtml(post.category || "-") +
          "</a></td>" +
          "<td>" + MD3.formatDate(new Date(post.createdAt)) + "</td>" +
          '<td class="admin-table__actions">' +
          '<a href="/editor.html?slug=' + encodeURIComponent(post.slug) + '" class="btn-text admin-action-btn admin-edit-btn">' +
          t("admin.edit") +
          "</a>" +
          '<button class="btn-text admin-action-btn admin-delete-btn" data-action="delete-post" data-slug="' + encodeURIComponent(post.slug) + '" data-title="' + MD3.escapeHtml(post.title) + '">' +
          t("admin.delete") +
          "</button>" +
          "</td>" +
          "</tr>";
      });

      html += "</tbody></table></div>";
      content.innerHTML = html;

      // Bind select all
      var selectAll = document.getElementById("postSelectAll");
      if (selectAll) {
        selectAll.addEventListener("change", function () {
          var checkboxes = content.querySelectorAll(".post-checkbox");
          checkboxes.forEach(function (cb) { cb.checked = selectAll.checked; });
        });
      }

      // Bind batch delete
      var batchDelBtn = document.getElementById("batchDeletePostsBtn");
      if (batchDelBtn) {
        batchDelBtn.addEventListener("click", handleBatchDeletePosts);
      }

      // Bind individual delete buttons
      var delBtns = content.querySelectorAll(".admin-delete-btn[data-action='delete-post']");
      delBtns.forEach(function (btn) {
        btn.addEventListener("click", async function () {
          var slug = btn.getAttribute("data-slug");
          var title = btn.getAttribute("data-title");
          var confirmed = await MD3.showConfirm(
            t("admin.confirm_delete_post"),
            title + " - " + t("admin.confirm_delete_post_desc")
          );
          if (confirmed) {
            deletePostAdmin(slug);
          }
        });
      });
    } catch (e) {
      content.innerHTML = '<p class="empty-state__desc">' + (e.message || "Error") + "</p>";
    }
  }

  async function handleBatchDeletePosts() {
    var content = document.getElementById("adminTabContent");
    var checked = content.querySelectorAll(".post-checkbox:checked");
    if (checked.length === 0) {
      MD3.showSnackbar(t("admin.no_selection"));
      return;
    }

    var slugs = [];
    var titles = [];
    checked.forEach(function (cb) {
      slugs.push(cb.getAttribute("data-slug"));
      titles.push(cb.getAttribute("data-title"));
    });

    var confirmed = await MD3.showConfirm(
      t("admin.confirm_batch_delete_posts"),
      titles.join(", ") + " - " + t("admin.confirm_batch_delete_posts_desc")
    );
    if (!confirmed) return;

    try {
      await MD3.api("/admin/posts/batch-delete", {
        method: "POST",
        body: { slugs: slugs },
      });
      MD3.showSnackbar(t("admin.batch_deleted"));
      loadAllPosts();
    } catch (e) {
      MD3.showSnackbar(e.message || "Error");
    }
  }

  async function deletePostAdmin(slug) {
    try {
      await MD3.api("/admin/posts/" + slug, { method: "DELETE" });
      MD3.showSnackbar(t("admin.post_deleted"));
      loadAllPosts();
    } catch (e) {
      MD3.showSnackbar(e.message || "Error");
    }
  }

  // ===== Comments =====
  async function loadAllComments() {
    var content = document.getElementById("adminTabContent");
    content.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var data = await MD3.api("/admin/comments");
      var comments = data.comments || [];

      if (comments.length === 0) {
        content.innerHTML =
          '<div class="empty-state"><p class="empty-state__desc">' + t("admin.no_comments") + "</p></div>";
        return;
      }

      var html =
        '<div class="admin-table-wrap">' +
        '<table class="admin-table">' +
        "<thead><tr>" +
        "<th>" + t("admin.comment_content") + "</th>" +
        "<th>" + t("admin.comment_author") + "</th>" +
        "<th>" + t("admin.comment_post") + "</th>" +
        "<th>" + t("admin.comment_date") + "</th>" +
        "<th>" + t("admin.comment_actions") + "</th>" +
        "</tr></thead><tbody>";

      comments.forEach(function (comment) {
        var levelColor = Auth.getLevelColor(comment.userLevel || 1);
        html +=
          "<tr>" +
          "<td>" + MD3.escapeHtml(comment.content.substring(0, 60)) + (comment.content.length > 60 ? "..." : "") + "</td>" +
          "<td>" +
          '<a href="/profile.html?u=' + encodeURIComponent(comment.username) + '" class="admin-table__user-link">' +
          '<span class="comment-avatar" style="background:' + levelColor + ';display:inline-flex;width:20px;height:20px;font-size:10px;">' +
          MD3.escapeHtml(comment.username.charAt(0).toUpperCase()) +
          "</span> " +
          MD3.escapeHtml(comment.username) +
          "</a>" +
          "</td>" +
          '<td><a href="/post.html?slug=' + encodeURIComponent(comment.postSlug) + '" class="admin-table__user-link">' +
          MD3.escapeHtml(comment.postTitle || comment.postSlug) +
          "</a></td>" +
          "<td>" + MD3.formatDate(new Date(comment.createdAt)) + "</td>" +
          '<td>' +
          '<button class="btn-text admin-action-btn admin-delete-btn" data-action="delete-comment" data-slug="' + encodeURIComponent(comment.postSlug) + '" data-id="' + encodeURIComponent(comment.id) + '">' +
          t("admin.delete") +
          "</button>" +
          "</td>" +
          "</tr>";
      });

      html += "</tbody></table></div>";
      content.innerHTML = html;

      var delBtns = content.querySelectorAll(".admin-delete-btn");
      delBtns.forEach(function (btn) {
        btn.addEventListener("click", async function () {
          var slug = btn.getAttribute("data-slug");
          var id = btn.getAttribute("data-id");
          var confirmed = await MD3.showConfirm(
            t("admin.confirm_delete_comment"),
            t("admin.confirm_delete_comment_desc")
          );
          if (confirmed) {
            deleteCommentAdmin(slug, id);
          }
        });
      });
    } catch (e) {
      content.innerHTML = '<p class="empty-state__desc">' + (e.message || "Error") + "</p>";
    }
  }

  async function deleteCommentAdmin(slug, commentId) {
    try {
      await MD3.api("/admin/comments/" + slug + "/" + commentId, { method: "DELETE" });
      MD3.showSnackbar(t("admin.comment_deleted"));
      loadAllComments();
    } catch (e) {
      MD3.showSnackbar(e.message || "Error");
    }
  }
})();
