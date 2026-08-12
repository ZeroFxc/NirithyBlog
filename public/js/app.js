/* ============================================================
   MD3 Blog - Home Page Logic
   Post list, search, filter, infinite scroll, cover images
   ============================================================ */

(function () {
  "use strict";

  var allPosts = [];
  var allTags = [];
  var allCategories = [];
  var currentFilter = { type: "all", value: "all" };
  var currentPage = 1;
  var pageSize = 12;
  var hasMore = true;
  var isLoading = false;
  var sentinelObserver = null;
  var sortBy = "latest"; // "latest" or "popular"

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
    initInfiniteScroll();
    initSortToggle();
    initFeedTab();
  });

  // ===== Listen for auth changes =====
  function initAuthListener() {
    window.addEventListener("authChanged", function () {
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
      updateLoadMoreText();
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

  // ===== Load Posts (Paginated) =====
  async function loadPosts(page) {
    page = page || 1;
    if (isLoading) return;
    if (page > 1 && !hasMore) return;

    isLoading = true;
    var container = document.getElementById("postsContainer");

    try {
      var data = await MD3.api("/posts?page=" + page + "&pageSize=" + pageSize);
      var newPosts = data.posts || [];
      hasMore = data.hasMore || false;

      if (page === 1) {
        allPosts = newPosts;
      } else {
        allPosts = allPosts.concat(newPosts);
      }
      currentPage = page;

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

      updateLoadMoreText();
    } catch (e) {
      if (page === 1) {
        container.innerHTML =
          '<div class="empty-state">' +
          '<div class="empty-state__icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg></div>' +
          '<h2 class="empty-state__title">' + t("empty.failed_title") + '</h2>' +
          '<p class="empty-state__description">' + MD3.escapeHtml(e.message) + "</p>" +
          '<button class="btn-tonal" onclick="location.reload()">' + t("empty.retry") + '</button>' +
          "</div>";
      }
    } finally {
      isLoading = false;
    }
  }

  // ===== Load More (for infinite scroll) =====
  function loadMore() {
    if (!isLoading && hasMore) {
      loadPosts(currentPage + 1);
    }
  }

  // ===== Update "Load More" / "No More" text =====
  function updateLoadMoreText() {
    var loader = document.getElementById("infiniteLoader");
    if (!loader) return;

    if (isLoading) {
      loader.style.display = "";
      loader.innerHTML =
        '<div class="progress-circular" style="width:32px;height:32px;margin:16px auto;">' +
        '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg>' +
        "</div>";
    } else if (!hasMore && allPosts.length > 0) {
      loader.style.display = "";
      loader.innerHTML =
        '<p style="text-align:center;color:var(--md-on-surface-variant);padding:24px 0;font-size:14px;">' +
        t("app.no_more_posts") + "</p>";
    } else {
      loader.style.display = "";
      loader.innerHTML = "";
    }
  }

  // ===== Infinite Scroll via IntersectionObserver =====
  function initInfiniteScroll() {
    var sentinel = document.getElementById("infiniteLoader");
    if (!sentinel) return;

    if ("IntersectionObserver" in window) {
      sentinelObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMore();
        }
      }, { rootMargin: "200px" });
      sentinelObserver.observe(sentinel);
    } else {
      // Fallback: scroll listener
      window.addEventListener("scroll", function () {
        if (isLoading || !hasMore) return;
        var rect = sentinel.getBoundingClientRect();
        if (rect.top < window.innerHeight + 200) {
          loadMore();
        }
      });
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

    if (filtered.length === 0 && !isLoading) {
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

      // Cover image HTML
      var coverHtml = "";
      if (p.coverImage) {
        coverHtml =
          '<div class="card__cover">' +
          '<img src="' + MD3.escapeHtml(p.coverImage) + '" alt="' + MD3.escapeHtml(p.title) + '" loading="lazy" />' +
          "</div>";
      }

      html +=
        '<article class="card fade-in" data-slug="' +
        MD3.escapeHtml(p.slug) +
        '" style="animation-delay:' +
        (i % pageSize) * 50 +
        'ms">' +
        coverHtml +
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
        '<div class="card__footer">' +
        '<span class="card__like">' +
        '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' +
        '<span>' + (p.likeCount || 0) + "</span>" +
        "</span>" +
        "</div>" +
        "</div>" +
        "</article>";
    });
    html += "</div>";

    // Add infinite scroll loader at the end
    html += '<div id="infiniteLoader"></div>';

    container.innerHTML = html;

    // Re-attach observer to new sentinel
    if (sentinelObserver) {
      var sentinel = document.getElementById("infiniteLoader");
      if (sentinel) sentinelObserver.observe(sentinel);
    }

    updateLoadMoreText();

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

  // ===== Sort Toggle (Latest / Popular) =====
  function initSortToggle() {
    var sortContainer = document.getElementById("sortToggle");
    if (!sortContainer) return;

    sortContainer.innerHTML =
      '<button class="chip chip--selected" data-sort="latest">' + t("app.sort_latest") + "</button>" +
      '<button class="chip" data-sort="popular">' + t("app.sort_popular") + "</button>";

    sortContainer.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        sortContainer.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("chip--selected");
        });
        chip.classList.add("chip--selected");
        sortBy = chip.dataset.sort;

        if (sortBy === "popular") {
          loadPopularPosts();
        } else {
          currentPage = 1;
          hasMore = true;
          allPosts = [];
          loadPosts(1);
        }
      });
      MD3.attachRipple(chip);
    });
  }

  async function loadPopularPosts() {
    var container = document.getElementById("postsContainer");
    isLoading = true;
    container.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var data = await MD3.api("/posts/popular");
      allPosts = data.posts || [];
      hasMore = false;
      renderPosts();
      updateLoadMoreText();
    } catch (e) {
      container.innerHTML = '<p style="color:var(--md-on-surface-variant);text-align:center;padding:24px;">' + MD3.escapeHtml(e.message) + "</p>";
    } finally {
      isLoading = false;
    }
  }

  // ===== Following Feed Tab =====
  function initFeedTab() {
    var feedBtn = document.getElementById("feedTabBtn");
    if (!feedBtn) return;

    // Show/hide based on login status
    function updateFeedVisibility() {
      if (window.Auth && Auth.isLoggedIn()) {
        feedBtn.style.display = "";
      } else {
        feedBtn.style.display = "none";
      }
    }
    updateFeedVisibility();

    window.addEventListener("authChanged", updateFeedVisibility);

    feedBtn.addEventListener("click", function () {
      loadFollowingFeed();
    });
  }

  async function loadFollowingFeed() {
    var container = document.getElementById("postsContainer");
    if (!container) return;
    if (!window.Auth || !Auth.isLoggedIn()) {
      Auth.showLoginDialog();
      return;
    }

    container.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var data = await MD3.api("/user/feed");
      allPosts = data.posts || [];
      hasMore = false;

      var loader = document.getElementById("infiniteLoader");
      if (loader) loader.style.display = "none";

      if (allPosts.length === 0) {
        container.innerHTML =
          '<div class="empty-state">' +
          '<div class="empty-state__icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg></div>' +
          '<h2 class="empty-state__title">' + t("feed.empty_title") + '</h2>' +
          '<p class="empty-state__description">' + t("feed.empty_desc") + '</p>' +
          "</div>";
        return;
      }

      renderPosts();
      updateLoadMoreText();
    } catch (e) {
      container.innerHTML = '<p style="color:var(--md-on-surface-variant);text-align:center;padding:24px;">' + MD3.escapeHtml(e.message) + "</p>";
    }
  }
})();
