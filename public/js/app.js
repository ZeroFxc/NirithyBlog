/* ============================================================
   MD3 Blog - Home Page Logic
   Post list, search, filter, navigation
   ============================================================ */

(function () {
  "use strict";

  var allPosts = [];
  var allTags = [];
  var allCategories = [];
  var currentFilter = { type: "all", value: "all" };

  // ===== i18n helper =====
  function t(key) {
    if (window.I18N) return I18N.t(key);
    return key;
  }

  // ===== Init =====
  document.addEventListener("DOMContentLoaded", function () {
    loadBlogInfo();
    loadPosts();
    initSearch();
    initFab();
    initLangListener();
    initAuthListener();
  });

  // ===== Listen for auth changes =====
  function initAuthListener() {
    window.addEventListener("authChanged", function () {
      // Re-render posts to update author info
      renderPosts();
    });
  }

  // ===== Listen for language change =====
  function initLangListener() {
    window.addEventListener("languageChanged", function () {
      renderFilters();
      renderPosts();
      if (allPosts.length === 0) {
        renderEmptyState();
      }
    });
  }

  // ===== Load Blog Info =====
  async function loadBlogInfo() {
    try {
      var data = await MD3.api("/info");
      document.title = data.title + " - " + t("app.title");
      var titleEl = document.getElementById("blogTitle");
      if (titleEl) titleEl.textContent = data.title;
    } catch (e) {
      console.error("Failed to load blog info:", e);
    }
  }

  // ===== Load Posts =====
  async function loadPosts() {
    var container = document.getElementById("postsContainer");

    try {
      var data = await MD3.api("/posts");
      allPosts = data.posts || [];

      // Collect tags and categories
      var tagSet = {};
      var catSet = {};
      allPosts.forEach(function (p) {
        (p.tags || []).forEach(function (tag) {
          tagSet[tag] = (tagSet[tag] || 0) + 1;
        });
        var cat = p.category || t("post.uncategorized");
        catSet[cat] = (catSet[cat] || 0) + 1;
      });

      allTags = Object.keys(tagSet).sort();
      allCategories = Object.keys(catSet).sort();

      renderFilters();
      renderPosts();

      if (allPosts.length === 0) {
        renderEmptyState();
      }
    } catch (e) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<div class="empty-state__icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg></div>' +
        '<h2 class="empty-state__title">' + t("empty.failed_title") + '</h2>' +
        '<p class="empty-state__description">' + MD3.escapeHtml(e.message) + "</p>" +
        '<button class="btn-tonal" onclick="location.reload()">' + t("empty.retry") + '</button>' +
        "</div>";
    }
  }

  // ===== Render Empty State (no posts yet) =====
  function renderEmptyState() {
    var container = document.getElementById("postsContainer");
    container.innerHTML =
      '<div class="empty-state">' +
      '<div class="empty-state__icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/></svg></div>' +
      '<h2 class="empty-state__title">' + t("empty.no_posts_title") + '</h2>' +
      '<p class="empty-state__description">' + t("empty.no_posts_desc") + '</p>' +
      '<button class="btn-filled" onclick="window.location.href=\'/editor\'">' + t("empty.write_post") + '</button>' +
      "</div>";
  }

  // ===== Render Filters =====
  function renderFilters() {
    var section = document.getElementById("filterSection");
    if (!section) return;

    var html = '<button class="chip chip--selected" data-filter-type="all" data-filter-value="all">' + t("app.filter_all") + '</button>';

    // Categories
    allCategories.forEach(function (cat) {
      html +=
        '<button class="chip" data-filter-type="category" data-filter-value="' +
        MD3.escapeHtml(cat) +
        '">' +
        MD3.escapeHtml(cat) +
        "</button>";
    });

    // Tags
    if (allTags.length > 0) {
      html += '<span style="width:1px;height:24px;background:var(--md-outline-variant);margin:0 4px;"></span>';
      allTags.forEach(function (tag) {
        html +=
          '<button class="chip" data-filter-type="tag" data-filter-value="' +
          MD3.escapeHtml(tag) +
          '">#' +
          MD3.escapeHtml(tag) +
          "</button>";
      });
    }

    section.innerHTML = html;

    // Attach click handlers
    section.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        // Update selected state
        section.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("chip--selected");
        });
        chip.classList.add("chip--selected");

        currentFilter = {
          type: chip.dataset.filterType,
          value: chip.dataset.filterValue,
        };
        renderPosts();
      });

      // Attach ripple
      MD3.attachRipple(chip);
    });
  }

  // ===== Render Posts =====
  function renderPosts() {
    var container = document.getElementById("postsContainer");
    var search = (document.getElementById("searchInput") || {}).value || "";
    search = search.toLowerCase().trim();

    var uncategorized = t("post.uncategorized");

    var filtered = allPosts.filter(function (p) {
      // Filter by category/tag
      if (currentFilter.type === "category") {
        if ((p.category || uncategorized) !== currentFilter.value) return false;
      } else if (currentFilter.type === "tag") {
        if (!p.tags || p.tags.indexOf(currentFilter.value) === -1) return false;
      }

      // Filter by search
      if (search) {
        var title = (p.title || "").toLowerCase();
        var excerpt = (p.excerpt || "").toLowerCase();
        if (title.indexOf(search) === -1 && excerpt.indexOf(search) === -1) {
          return false;
        }
      }

      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<div class="empty-state__icon"><svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg></div>' +
        '<h2 class="empty-state__title">' + t("empty.no_results_title") + '</h2>' +
        '<p class="empty-state__description">' + t("empty.no_results_desc") + '</p>' +
        "</div>";
      return;
    }

    var html = '<div class="post-grid">';
    filtered.forEach(function (p, i) {
      var tagsHtml = (p.tags || [])
        .slice(0, 3)
        .map(function (tag) {
          return '<span class="chip" style="height:24px;font-size:11px;cursor:default;padding:0 8px;">#' + MD3.escapeHtml(tag) + "</span>";
        })
        .join("");

      html +=
        '<article class="card fade-in" data-slug="' +
        MD3.escapeHtml(p.slug) +
        '" style="animation-delay:' +
        i * 50 +
        'ms">' +
        '<div class="card__content">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
        '<span style="font-size:12px;font-weight:500;color:var(--md-primary);text-transform:uppercase;letter-spacing:0.5px;">' +
        MD3.escapeHtml(p.category || uncategorized) +
        "</span>" +
        '<span style="font-size:12px;color:var(--md-on-surface-variant);">' +
        MD3.timeAgo(p.createdAt) +
        "</span>" +
        "</div>" +
        '<h3 class="card__title">' +
        MD3.escapeHtml(p.title) +
        "</h3>" +
        '<p class="card__excerpt">' +
        MD3.escapeHtml(p.excerpt || "") +
        "</p>" +
        (tagsHtml ? '<div style="display:flex;gap:4px;margin-top:12px;flex-wrap:wrap;">' + tagsHtml + "</div>" : "") +
        "</div>" +
        "</article>";
    });
    html += "</div>";

    container.innerHTML = html;

    // Attach click handlers
    container.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("click", function () {
        var slug = card.dataset.slug;
        window.location.href = "/post?slug=" + encodeURIComponent(slug);
      });
      MD3.attachRipple(card);
    });
  }

  // ===== Search =====
  function initSearch() {
    var input = document.getElementById("searchInput");
    if (!input) return;

    var timer = null;
    input.addEventListener("input", function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(renderPosts, 200);
    });
  }

  // ===== FAB =====
  function initFab() {
    var fab = document.getElementById("newPostFab");
    if (fab) {
      fab.addEventListener("click", function () {
        if (window.Auth) {
          Auth.requireAuth(function () {
            window.location.href = "/editor";
          });
        } else {
          window.location.href = "/editor";
        }
      });
    }
  }
})();
